var _duckHunt = require('..commands/duckhunt.js');

module.exports = {

  call: function (opts, respond) {
    if (opts.text === 'bang!') {
      return _duckHunt.handleShot(opts.from, respond);
    }
  }
  
}
