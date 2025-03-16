const { getNormalizedWebpackOptons } = require('./config/normalization')
const { applyWebpackOptionsBaseDefaults, applyWebpackOptionsDefaults } = require('./config/default')
const Compiler = require('./Compiler')
const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')

function webpack(config) {
  // 1.读取和解析配置 校验配置
  validateSchema(config)
  // 2.实例化compiler 它是Webpack的核心
  const compiler = createCompiler(config)
  return compiler
}

// 校验配置
function validateSchema(config) {
  return config
}


function createCompiler(rawOptions) {
  // 获取规范化的配置对象
  const options = getNormalizedWebpackOptons(rawOptions)
  // 如果用户没传配置 应用默认配置
  applyWebpackOptionsBaseDefaults(options)
  const compiler = new Compiler(options.context, options)
  // 注册插件  配置中的插件实例化 挂载到compiler上
  // 插件会在构建过程中的各个阶段通过监听钩子来影响构建结果
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      plugin.apply(compiler)
    }
  }

  // 初始化内置钩子，用于在构建过程中触发一些事件
  new NodeEnvironmentPlugin().apply(compiler)

  applyWebpackOptionsDefaults(options)
  // 触发environment钩子：在环境准备好之前，Compiler触发environment钩子事件
  compiler.hooks.environment.call();
  // 触发afterEnvironment钩子：在环境准备好之后，Compiler触发afterEnvironment钩子事件
  compiler.hooks.afterEnvironment.call();
  new WebpackOptionsApply().process(options, compiler);
  compiler.hooks.initialize.call();
  return compiler
}


module.exports = webpack