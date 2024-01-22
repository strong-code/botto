const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class Checkem extends Command {

  constructor() {
    super('tuck')
  }

  async call(bot, opts, respond) {
    let target = opts.args[0]

    if (await Helpers.userInChan(bot, opts.to, target)) {
      return bot.action(opts.to, `tucks ${target} into bed and wishes them a good night ❤️`)
    }
  }
}

