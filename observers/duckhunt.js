const _duckHunt = require('../commands/duckhunt.js');
const Observer = require('./observer.js')

module.exports = class DuckHunt extends Observer {

  constructor() {
    super('duckhunt', /^bang$/i)
  }

  call(opts, respond) {
    if (opts.text === 'bang') {
      return _duckHunt.handleShot(opts.from, respond);
    }
  }

}
