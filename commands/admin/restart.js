const Command = require('../command.js')

module.exports = class Restart extends Command {

  constructor() {
    super('restart')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    respond()

    Object.values(bot.chans).forEach(chan => {
      bot.part(chan.key, 'brb')
    })
    // https://nodejs.org/api/process.html#process_process_exitcode
    return process.exit(1)
  }
}
