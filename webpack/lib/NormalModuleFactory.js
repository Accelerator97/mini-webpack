const { AsyncSeriesBailHook } = require("tapable")
const { Module, } = require("webpack")
const NormalModule = require('./NormalModule')

class NormalModuleFactory {
  constructor() {
    this.hooks = {
      factorzie: new AsyncSeriesBailHook(['resolveData'])
    }
    // 真正的普通模块生成的地方
    this.hooks.factorzie.tapAsync('NormalModuleFactory', (resolveData, callback) => {
      this.hooks.resolve.callAsync(resolveData, (err, result) => {
        if (result instanceof Module) {
          return callback(null, result)
        }
        this.hooks.afterResolve.callAsync(resolveData, (err, result) => {
          const createData = resolveData.createData
          this.hooks.createModule.callAsync(createData, resolveData, (err, createModule) => {
            createModule = new NormalModule(createData)
            createModule = this.hooks.module.call(createModule, createData, resolveData)
            return callback(null, createModule)
          })

        })
      })
    })
  }

  create(data, callback) {
    const dependencies = data.dependencies
    const context = data.context
    const resolveOptions = data.resolveOptions
    const dependency = dependencies[0]
    const request = dependency.request

    const resolveData = {
      context,
      request
    }

    this.hooks.beforeResolve.callAsync(resolveData, (err, res) => {
      // 在普通模块工厂创建模块之前触发的钩子
      // 后面手写插件，通过此钩子拦截创建模块的流程
      this.hooks.factorzie.callAsync(resolveData, (err, module) => {
        const factoryResult = { module }
        callback(null, factoryResult)
      })
    })

  }

}

module.exports = NormalModuleFactory