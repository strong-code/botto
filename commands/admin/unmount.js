const _ = require('lodash');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

module.exports = class Unmount extends Command {

  constructor() {
    super('unmount')
  }

  call(bot, opts) {
    if (!this.adminCallable) return

    const module = opts.args[0]
    const cmd = CommandHandler.commandList[module]
    const obs = ObserverHandler.observerList[module]

    if (cmd) {
      if (!cmd.mounted) {
        return bot.say(opts.to, `Command "${module}" is already unmounted`)
      } else {
        cmd.unmount()
        return bot.say(opts.to, `Unmounted command "${module}"`)
      }
    }

    if (obs) {
      if (!obs.mounted) {
        return bot.say(opts.to, `Observer "${module}" is already unmounted`)
      } else {
        obs.unmount()
        return bot.say(opts.to, `Unmounted observer "${module}"`)
      }
    }

  }

}
