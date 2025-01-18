const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')
const suppress = require('../../util/suppress.js')

module.exports = class Mount extends Command {

  constructor() {
    super('suppress')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    if (opts.args[0] == 'showall') {
      const suppList = suppress.getForChan(opts.to)
      if (suppList == '') {
        return respond(`No modules currently suppressed for ${opts.to}`)
      }
      return respond(`Currently suppressed modules for ${opts.to}: ${suppList}`)
    }

    let modname
    let chan
    let remove = false
    if (opts.args.length == 3 && opts.args[0] == 'undo') {
      modname = opts.args[1]
      chan = opts.args[2]
      remove = true
    } else if (opts.args.length == 2) {
      modname = opts.args[0]
      chan = opts.args[1]
    } else {
      return respond(`Usage: !suppress [undo] <module> <channel>`)
    }

    if (!(modname in CommandHandler.commandList) &&
        !(modname in ObserverHandler.observerList)) {
      return respond(`No such module '${modname}'`)
    }

    if (remove) {
      suppress.remove(modname, chan, respond)
    } else {
      suppress.add(modname, chan, respond)
    }
  }
}
