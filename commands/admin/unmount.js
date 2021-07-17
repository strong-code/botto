const _ = require('lodash');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

module.exports = class Unmount extends Command {

  constructor() {
    super('unmount')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable) return

    const module = opts.args[0]
    const cmd = CommandHandler.commandList[module]
    const obs = ObserverHandler.observerList[module]

    let cmdString = `Command "${module}" is already unmounted`
    let obsString = `Observer ${module}" is already unmounted`

    if (cmd && cmd.mounted) {
      cmd.unmount()
      cmdString = `Unmounted command "${module}"`
    }

    if (obs && obs.mounted) {
      obs.unmount()
      obsString = `Unmounted observer "${module}"`
    }

    return respond(`${cmdString}. ${obsString}.`)
  }

}
