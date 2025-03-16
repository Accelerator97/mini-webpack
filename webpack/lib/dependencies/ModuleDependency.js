const Dependency = require("../Dependency");
const DependencyTemplate = require("../DependencyTemplate");
class ModuleDependency extends Dependency {
  constructor(request) {
    super();
    this.request = request;
  }
}
ModuleDependency.Template = DependencyTemplate;
module.exports = ModuleDependency;