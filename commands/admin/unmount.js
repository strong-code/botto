const _ = require('lodash');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')

module.exports = class Unmount extends Command {

  constructor() {
    super('unmount')
  }

  call(opts, respond) {
    // if (opts.args[0] === 'del') {
    //   commands.mount(opts.to, opts.args[1]);
    //   return respond(opts.args[1] + ' no longer unmounted in ' + opts.to);
    // } else if (opts.args[0] === 'list') {
    //   return respond('Currently unmounted triggers in ' + opts.to + ': ' + _.join(commands.unmounted[opts.to], ', '));
    // } else {

    const cmdName = opts.args[0]
    const cmd = CommandHandler.commandList[cmdName]

    if (!cmd.mounted) {
      return respond(`Command "${cmdName}" is already unmounted`)
    } else {
      cmd.unmount()
      return respond(`Unmounted command "${cmdName}"`);
    }
  }

};
