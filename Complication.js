const path = require('path')
const fs = require('fs')
const types = require('@babel/types');
// 导入@babel/parser库，用于将源代码解析成抽象语法树（AST）
const parser = require('@babel/parser');
// 导入@babel/traverse库，用于遍历和操作AST
const traverse = require('@babel/traverse').default;
// 导入@babel/generator库，用于将修改过的AST重新生成源代码
const generator = require('@babel/generator').default;

function toUnixSeq(filePath) {
  return filePath.replace(/\\/g, '/')
}

class Complication {

  constructor(options) {
    this.options = options
    this.options.context = toUnixSeq(options.context || process.cwd())
    this.fileDependencies = new Set()
    this.modules = [] // 存放本次编译产生的所有模块
    this.chunks = []
    this.assets = []
  }

  build(onCompiled) {
    // onCompiled(null, 'stats', [])
    let entry = {}
    if (typeof this.options.entry === 'string') {
      entry.main = this.options.entry
    } else {
      entry = this.options.entry
    }


    for (let entryName in entry) {
      // 获取入口文件的绝对路径
      let entryFilePath = (path.posix.join(this.options.context, entry[entryName]))
      // 把文件添加到文件依赖中
      this.fileDependencies.add(entryFilePath)
      // 入口文件开始编译模块
      let entryModule = this.buildModule(entryName, entryFilePath)
      // 根据入口和模块之间的关系 组装成一个个包含多个模块的chunk
      let chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter(module => module.names.includes(entryName))
      }
      let outputFileName = this.options.output.filename.replace('[name]', chunk.name)
      this.chunks.push(chunk)
      this.assets[outputFileName] = getSourceCode(chunk)
    }

    onCompiled(null, {
      modules: this.modules,
      chunks: this.chunks,
      assets: this.assets
    }, this.fileDependencies)
  }

  buildModule(entryName, modulePath) {
    // 从入口文件出发，调用所有配置的loader进行转换
    let rawSourceCode = fs.readFileSync(modulePath, 'utf8')
    let { rules } = this.options.module
    let loaders = []

    rules.forEach((rule) => {
      if (modulePath.match(rule.test)) {
        loaders.push(...rule.use)
      }
    })

    let transformSourceCode = loaders.reduceRight((sourceCode, loaders) => {
      const loaderFn = require(loaders)
      return loaderFn(sourceCode)
    }, rawSourceCode)

    let moduleId = './' + path.posix.relative(this.options.context, modulePath)
    // names来记录 当前模块属于哪些入口
    let module = { id: moduleId, names: [entryName], dependencies: new Set() }
    this.modules.push(module)

    let ast = parser.parse(transformSourceCode, { sourceType: 'module' })
    traverse(ast, {
      CallExpression: ({ node }, state) => {
        if (node.callee.name === 'require') {
          //  引用的模块名字
          let depModuleName = node.arguments[0].value
          let dirname = path.posix.dirname(modulePath)
          let depModulePath = path.posix.join(dirname, depModuleName)
          let { extensions } = this.options.resolve
          // 尝试添加拓展名 找到真正的模块路径
          depModulePath = tryExtension(depModulePath, extensions)
          this.fileDependencies.add(depModulePath)
          // 获取模块id 也就是相对于根目录的相对路径
          let depModuleId = './' + path.posix.relative(this.options.context, depModulePath)
          // 修改语法树 把引入模块路径改为模块的id
          node.arguments[0] = types.stringLiteral(depModuleId)
          // 给当前entry 添加依赖信息
          module.dependencies.add({ depModuleId, depModulePath })
        }

      }
    })

    const { code } = generator(ast)
    module._source = code

    // 找出该模块依赖的模块 递归本步骤直到入口文件的所有依赖都经过本步骤的处理
    const dependencies = [...module.dependencies]

    dependencies.forEach(({ depModuleId, depModulePath }) => {
      let existModule = this.modules.find(item => item.id === depModuleId)
      if (existModule) {
        existModule.names.push(entryName)
      } else {
        this.buildModule(entryName, depModulePath)
      }
    })


    return module
  }

}

function tryExtension(modulePath, extensions) {
  if (fs.existsSync(modulePath)) {
    return modulePath
  }


  for (let i = 0; i < extensions.length; i++) {
    let filePath = modulePath + extensions[i]
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  throw new Error(`${modulePath}没找到`)

}


function getSourceCode(chunk) {
  return `
  (() => {
    var modules = {
      ${chunk.modules.filter(module => module.id !== chunk.entryModule.id).map(module => `
            "${module.id}": module => {
               ${module._source}
              }
            `)}
    };
    var cache = {};
    function require(moduleId) {
      var cachedModule = cache[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = cache[moduleId] = {
        exports: {}
      };
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    var exports = {};
    (() => {
      ${chunk.entryModule._source}
    })();
  })();
  `;
}

module.exports = Complication