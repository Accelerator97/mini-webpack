class RunPlugin {
  apply(compiler) {
    compiler.hooks.run.tap('RunPlugin', () => {
      console.log("run start")
    })
  }
}

module.exports = RunPlugin