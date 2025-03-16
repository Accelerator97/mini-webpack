const NormalModuleFactory = require('./NormalModuleFactory')
const Compilation = require('./Compilation')
const { SyncHook, SyncBailHook, AsyncSeriesHook, AsyncParallelHook } = require('tapable')
class Compiler {

  constructor(context, options) {
    this.context = context
    this.options = options
    this.hooks = {
      environment: new SyncHook(),
      afterEnvironment: new SyncHook(),
      initialize: new SyncHook(),
      entryOption: new SyncBailHook(['context', 'entry']),
      compilation: new SyncHook(['compilation', 'params']),
      afterPlugins: new SyncHook(['compiler']),
      afterResolvers: new SyncHook(['compiler']),
      thisCompilation: new SyncHook(['compilation', 'params']),
      normalModuleFacotry: new SyncHook(['normalModuleFacotry']),
      beforeRun: new AsyncSeriesHook(['compiler']),
      beforeCompile: new AsyncSeriesHook(['params']),
      compile: new SyncHook(['params']),
      make: new AsyncParallelHook(['compilation']),
      finishMake: new AsyncSeriesHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      run: new AsyncSeriesHook(['compiler']),
      addEntry: new SyncHook(['entry', 'options'])
    }
  }

  run(callback) {
    const finalCallback = (err, stats) => {
      callback(err, stats)
    }
    const onCompiled = (err, Compilation) => {
      finalCallback(null, {})
    }

    this.hooks.beforeRun.callAsync(this, err => {
      if (err) return finalCallback(err)
      this.hooks.run.callAsync(this, err => {
        if (err) finalCallback(err)
        this.compiled(onCompiled)
      })
    })
  }

  compiled(callback) {
    // const params = this.newCompilationParams() 
    const params = this.newCompilationParams();
    this.hooks.beforeCompile.callAsync(params, err => {
      this.hooks.compile.call(params)
      const compilation = this.newCompilation(params)
      this.hooks.make.callAsync(compilation, err => {
        this.hooks.finishMake.callAsync(compilation, err => {
          compilation.finish(err => {
            compilation.seal(err => {
              this.hooks.afterCompile.callAsync(compilation, err => {
                return callback(null, compilation)
              })
            })
          })
        })
      })

    })
  }
  newCompilation(param) {
    const compilation = this.createCompilation(param)
    this.hooks.thisCompilation.call(compilation, param)
    this.hooks.compilation.call(compilation, param)
    return compilation

  }
  createCompilation(param) {
    return new Compilation(this, param)
  }
  newCompilationParams() {
    return {
      normalModuleFactory: this.createNormalModuleFacotry()
    }
  }
  createNormalModuleFacotry() {
    const normalModuleFactory = new NormalModuleFactory({
      context: this.options.context,
    })

    this.hooks.normalModuleFacotry.call(normalModuleFactory)
    return normalModuleFactory
  }
}

module.exports = Compiler