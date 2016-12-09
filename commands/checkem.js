const _ = require('lodash');

module.exports = {

  call: function(opts, respond) {
    const target = opts.args[0] || 'bro';
    return respond('(⊃｡•́‿•̀｡)⊃ Check \'em ' + target + ': ' + _.random(1,9) + '' + _.random(1,9));
  }
};
