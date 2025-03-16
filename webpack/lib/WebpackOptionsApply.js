const EntryOptionPlugin = require('./EntryOptionPlugin')

class WebpackOptionsApply {
  process(options, compiler) {
    //8.触发entryOption钩子：在解析入口选项前，Compiler触发entryOption钩子事件
    new EntryOptionPlugin().apply(compiler);
    //触发entryOption事件执行
    compiler.hooks.entryOption.call(options.context, options.entry);
    //10.触发afterPlugins钩子：在插件注册完毕后，Compiler触发afterPlugins钩子事件
    compiler.hooks.afterPlugins.call(compiler);
    //11.触发afterResolvers钩子：在解析器准备完毕后，Compiler触发afterResolvers钩子事件
    compiler.hooks.afterResolvers.call(compiler);
  }

}


module.exports = WebpackOptionsApply