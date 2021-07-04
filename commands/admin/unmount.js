const _ = require('lodash');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')

module.exports = class Unmount extends Command {

  constructor() {
    super('unmount')
  }

  call(bot, opts) {
    const cmdName = opts.args[0]
    const cmd = CommandHandler.commandList[cmdName]

    if (!cmd.mounted) {
      return bot.say(opts.to, `Command "${cmdName}" is already unmounted`)
    } else {
      cmd.unmount()
      return bot.say(opts.to, `Unmounted command "${cmdName}"`);
    }
  }

};
