const _ = require('lodash');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

module.exports = class Unmount extends Command {

  constructor() {
    super('unmount')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const module = opts.args[0]
    const cmd = CommandHandler.commandList[module]
    const obs = ObserverHandler.observerList[module]

    let cmdString = ''
    let obsString = ''

    if (cmd) {
      cmdString = `Command "${module}" is already unmounted.`
      if (cmd.mounted) {
        cmd.unmount()
        cmdString = `Unmounted command "${module}".`
      }
    }

    if (obs) {
      obsString = `Observer "${module}" is already unmounted.`
      if (obs.mounted) {
        obs.unmount()
        obsString = `Unmounted observer "${module}".`
      }
    }
    
    if (!cmdString && !obsString) {
      return respond(`Could not find module "${module}"`)
    }

    return respond(`${cmdString} ${obsString}`)
  }

}
