// 引入自定义的webpack模块
const webpack = require('./webpack/lib/webpack');
// 引入Node.js的文件系统模块，用于操作文件
const fs = require('fs');
// 引入webpack配置文件
const config = require('./webpack.config');
// 使用配置文件创建一个webpack编译器实例
const compiler = webpack(config);
// 运行编译器，开始构建过程
compiler.run((err, stats) => {
  // 打印构建错误信息（如果有的话）
  console.log(err);
  console.log(stats)
});