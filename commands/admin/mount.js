const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

module.exports = class Mount extends Command {
  
  constructor() {
    super('mount')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable) return

    const module = opts.args[0]
    const cmd = CommandHandler.commandList[module]
    const obs = ObserverHandler.observerList[module]

    let cmdString = ''
    let obsString = ''

    if (cmd) {
      cmdString = `Command "${module}" is already mounted.`
      if (!cmd.mounted) {
        cmd.mount()
        cmdString = `Mounted command "${module}".`
      }
    }

    if (obs) {
      obsString = `Observer ${module}" is already mounted.`
      if (!obs.mounted) {
        obs.mount()
        obsString = `Mounted observer "${module}".`
      }
    }

    return respond(`${cmdString} ${obsString}`)
  }
}
