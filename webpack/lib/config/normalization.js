function getNormalizedWebpackOptons(config) {
  return {
    ...config,
    entry: getNormalizedEntryStatic(config.entry)
  }
}


function getNormalizedEntryStatic(entry) {
  if (typeof entry === 'string') {
    return {
      main: {
        import: [entry]
      }
    }
  }

  if (Array.isArray(entry)) {
    return {
      main: {
        import: entry
      }
    }
  }

  return entry

}


exports.getNormalizedWebpackOptons = getNormalizedWebpackOptons