const _ = require('lodash');
const unmount = require('./_commandHandler.js').unmount;
const mount = require('./_commandHandler.js').mount;

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === 'del') {
      mount(opts.to, opts.args[1]);
      return respond(opts.args[1] + ' no longer unmounted in ' + opts.to);
    } else {
      unmount(opts.to, opts.args[0]);      
      return respond(opts.args[0] + ' unmounted in ' + opts.to);
    }
  }

};
