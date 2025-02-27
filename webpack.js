const Compiler = require("./Compiler")

function webpack(config) {
  // 1. 初始化参数
  const argv = process.argv.slice(2)
  const shellOptions = argv.reduce((shellOptions, options) => {
    const [key, value] = options.split('=');
    shellOptions[key.slice(2)] = value;
    return shellOptions;
  }, {});

  const finalOptions = { ...config, ...shellOptions }
  // 2.初始化compiler对象
  const compiler = new Compiler(finalOptions)
  // 3.加载所有插件
  finalOptions.plugins.forEach((plugin) => {
    plugin.apply(compiler)
  })

  return compiler
}

module.exports = webpack