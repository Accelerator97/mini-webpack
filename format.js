class ModuleGraphModule {
  constructor(module) {
    this.module = module;
    this.incomingConnections = new Set();
    this.outgoingConnections = new Set();
  }
}
module.exports = ModuleGraphModule
