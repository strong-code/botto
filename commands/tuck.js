const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class Checkem extends Command {

  constructor() {
    super('tuck')
  }

  call(bot, opts, respond) {
    let target = opts.args[0]

    Helpers.usersInChan(bot, opts.to, (nicks) => {
      if (nicks.includes(target)) {
        return bot.action(opts.to, `tucks ${target} into bed and wishes them a good night ❤️`)
      }
    })
  }
}

