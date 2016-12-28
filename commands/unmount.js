const _ = require('lodash');
const commands = require('./_commandHandler.js')

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === 'del') {
      commands.mount(opts.to, opts.args[1]);
      return respond(opts.args[1] + ' no longer unmounted in ' + opts.to);
    } else if (opts.args[0] === 'list') {
      return respond('Currently unmounted triggers in ' + opts.to + ': ' + _.join(commands.unmounted[opts.to], ', '));
    } else {
      commands.unmount(opts.to, opts.args[0]);      
      return respond(opts.args[0] + ' unmounted in ' + opts.to);
    }
  }

};
