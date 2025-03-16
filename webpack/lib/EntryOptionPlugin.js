const EntryPlugin = require("./EntryPlugin");

class EntryOptionPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
      EntryOptionPlugin.applyEntryOption(compiler, context, entry);
      return true;
    });
  }

  static applyEntryOption(compiler, context, entry) {
    for (const name of Object.keys(entry)) {
      const desc = entry[name];
      const options = { name }
      for (const entry of desc.import) {
        new EntryPlugin(context, entry, options).apply(compiler);
      }
    }
  }
}


module.exports = EntryOptionPlugin