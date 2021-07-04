const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')

module.exports = class Mount extends Command {
  
  constructor() {
    super('mount')
  }

  call(bot, opts) {
    const cmdName = opts.args[0]
    const cmd = CommandHandler.commandList[cmdName]

    if (cmd.mounted) {
      return bot.say(opts.to, `Command "${cmd.name}" is already mounted`)
    } else {
      cmd.mount()
      return bot.say(opts.to, `Mounted command "${cmd.name}"`)
    }
  }
}
