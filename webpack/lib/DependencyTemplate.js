class DependencyTemplate {
  apply(dependency, source, templateContext) {
    throw new Error("Abstract method");
  }
}
module.exports = DependencyTemplate;