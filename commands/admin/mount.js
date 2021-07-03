const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')

module.exports = class Mount extends Command {
  
  constructor() {
    super('mount')
  }

  call(opts, respond) {
    const cmdName = opts.args[0]
    const cmd = CommandHandler.commandList[cmdName]

    if (cmd.mounted) {
      return respond(`Command "${cmd.name}" is already mounted`)
    } else {
      cmd.mount()
      return respond(`Mounted command "${cmd.name}"`)
    }
  }
}
