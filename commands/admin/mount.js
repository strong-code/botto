const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

module.exports = class Mount extends Command {
  
  constructor() {
    super('mount')
  }

  call(bot, opts) {
    const module = opts.args[0]
    const cmd = CommandHandler.commandList[module]
    const obs = ObserverHandler.observerList[module]

    if (cmd) {
      if (cmd.mounted) {
        return bot.say(opts.to, `Command "${module}" is already mounted`)
      } else {
        cmd.mount()
        return bot.say(opts.to, `Mounted command "${module}"`)
      }
    }

    if (obs) {
      if (obs.mounted) {
        return bot.say(opts.to, `Observer "${module}" is already mounted`)
      } else {
        obs.mount()
        return bot.say(opts.to, `Mounted observer "${module}"`)
      }
    }
  }
}
