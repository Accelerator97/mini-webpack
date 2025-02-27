class DonePlugin {
  apply(compiler) {
    compiler.hooks.run.tap('DonePlugin', () => {
      console.log("done start")
    })
  }
}

module.exports = DonePlugin