const EntryDependency = require("./dependencies/EntryDependency");

class EntryPlugin {
  constructor(context, entry, options) {
    this.context = context;
    this.entry = entry;
    this.options = options;
  }
  apply(compiler) {
    // 监听compilation钩子当我们开始一次新的编译，就会创建一个新的compilation,触发compilation钩子
    // 参数对象里有一个属性normalModuleFactory，代表生产模块工厂
    compiler.hooks.compilation.tap("EntryPlugin", (compilation, { normalModuleFactory }) => {
      // 注册入口依赖和对应的工厂关系
      // moduleA import moduleB,moduleB会成为moduleA的依赖
      // 当编译完moduleA的时候，找到moduleA的依赖moduleBDependency
      // 然后要到这个dependencyFactories找对应的工作，把依赖传进去，生成对应的moduleB模块
      // webpack里有多种依赖，有多种模块工厂，每个依赖会对应一个生产模块的工厂
      compilation.dependencyFactories.set(EntryDependency, normalModuleFactory);
    });
    //9.解析入口文件：根据配置对象的entry属性解析入口文件。Webpack会为每个入口文件创建一个Chunk，并确定各个模块之间的依赖关系
    const { entry, options, context } = this;
    const dep = new EntryDependency(entry);
    // 注册make钩子回调 等待make事件触发
    compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
      compilation.addEntry(context, dep, options, callback);
    });
  }
}
module.exports = EntryPlugin;
