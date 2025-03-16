const ModuleDependency = require("./ModuleDependency");
class EntryDependency extends ModuleDependency {
  constructor(request) {
    super(request);
  }
  get type() {
    return "entry";
  }
  get category() {
    return "esm";
  }
}
module.exports = EntryDependency;
