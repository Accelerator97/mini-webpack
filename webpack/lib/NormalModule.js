class NormalModule {
  constructor({ request }) {
    this.request = request
  }
  identifier() {
    return this.request
  }

}

module.exports = NormalModule