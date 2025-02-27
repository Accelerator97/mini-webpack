const { SyncHook } = require("tapable")
const Complication = require("./Complication")
const fs = require("fs")


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