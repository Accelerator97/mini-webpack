const { SyncHook } = require("tapable")
const { ModuleGraph } = require("./ModuleGraph")
const { identifier } = require("@babel/types")

class Compilation {
  constructor() {
    this.dependencyFactories = new Map()
    this.entries = new Map()
    this.moduleGraph = new ModuleGraph()
    this.modules = new Set()
    this._modules = new Map()
    this.hooks = {
      seal: new SyncHook([]),
      addEntry: new SyncHook(['entry', 'options']),
      succeedEntry: new SyncHook(['entry', 'options', 'module'])
    }
  }
  addEntry(context, entry, options, callback) {
    this._addEntryItem(context, entry, 'dependencies', options, callback)
  }
  _addEntryItem(context, entry, target, options, callback) {
    const { name } = options
    let entryData = {
      dependencies: [],
      includeDependencies: [],
      options: options
    }

    entryData[target].push(entry)
    this.entries.set(name, entryData)
    this.hooks.addEntry.call(entry, options)
    this.addModuleTree({ context, dependency: entry }, (err, module) => {
      this.hooks.succeedEntry.call(entry, options, module)
      return callback(null, module)
    })
  }
  finish(callback) {
    return callback()
  }
  seal(callback) {
    this.hooks.seal.call()
    return callback()
  }
  addModuleTree({ context, dependency }, callback) {
    const Dep = dependency.constructor
    const moduleFactory = this.dependencyFactories.get(Dep)
    // 根据文件的不同类型，通过不同的模块工厂创建
    this.handleModuleCreation({
      factory: moduleFactory,
      dependencies: [dependency],
      context
    }, (err, result) => {
      callback(null, result)
    })
  }
  // 开始创建模块
  handleModuleCreation({ factory, dependencies, context }, callback) {
    const moduleGraph = this.moduleGraph
    this._factorizeModule({ factory, dependencies, context }, (err, factoryResult) => {
      const newModule = factoryResult.module
      this._addModule(newModule, (err, module) => {
        for (let i = 0; i < dependencies.length; i++) {
          const dependency = dependencies[i]
          moduleGraph.setResolvedModule(null, dependency, module)
          // 源代码转成抽象语法树
          this._handleModuleBuildAndDependencies()
        }
      })
    })
  }

  _addModule(module, callback) {
    const identifier = module.identifier()
    this._modules.set(identifier, module)
    this.modules.add(module)
    callback(null, module)
  }

  _factorizeModule({ factory, dependencies, context }, callback) {
    factory.create({
      context,
      dependencies
    }, (err, result) => {

      callback(err, result)
    })

  }

  _handleModuleBuildAndDependencies() {

  }
  buildModule(){

  }
  processModuleDependencies(){
    
  }

}

module.exports = Compilation