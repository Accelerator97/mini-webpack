const { SyncHook } = require("tapable")
const Complication = require("./Complication")
const fs = require("fs")
const path = require('path')

class Compiler {
  constructor(options) {
    this.options = options
    this.hooks = {
      run: new SyncHook(),
      done: new SyncHook()
    }
  }


  run(callback) {
    this.hooks.run.call()
    // 开始编译
    const onCompiled = (err, stats, fileDependencies) => {
      const { assets } = stats
      // 确定好输出内容后 根据配置确定输出的路径和文件名 把文件内容导入到文件系统
      for (let filename in assets) {
        let filePath = path.posix.join(this.options.output.path, filename)
        try {
          fs.writeFileSync(filePath, assets[filename], 'utf-8')
        } catch (e) {
          console.log("写入失败", e)
        }
      }
      callback(err, {
        toJson: () => stats
      })
      const filesArr = [...fileDependencies]
      // fileDependencies是本次打包依赖的文件
      filesArr.forEach(file => {
        fs.watch(file, () => {
          this.compile(onCompiled)
        })
      })
    }
    this.compile(onCompiled)
    this.hooks.done.call()
  }

  compile(onCompiled) {
    const complication = new Complication(this.options)
    complication.build(onCompiled)
  }
}

module.exports = Compiler