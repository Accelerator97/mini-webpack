function applyWebpackOptionsBaseDefaults(options) {
  F(options, 'context', () => process.cwd())
}


function applyWebpackOptionsDefaults(options) {
  return options
}

const F = (obj, prop, factory) => {
  if (obj[prop] === undefined) {
    obj[prop] = factory
  }
}


exports.applyWebpackOptionsBaseDefaults = applyWebpackOptionsBaseDefaults
exports.applyWebpackOptionsDefaults = applyWebpackOptionsDefaults