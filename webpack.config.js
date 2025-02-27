const path = require('path')
const RunPlugin = require("./plugins/RunPlugin")
const DonePlugin = require("./plugins/DonePlugin")
module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    entry1: './src/entry1.js',
    entry2: './src/entry2.js',
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, 'loaders/logger1-loader.js'),
          path.resolve(__dirname, 'loaders/logger2-loader.js')
        ]
      }
    ]
  },
  plugins: [
    new RunPlugin(),
    new DonePlugin()
  ]
}