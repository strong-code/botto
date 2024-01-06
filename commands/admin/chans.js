const exec = require('child_process').exec
const Helpers = require('../../util/helpers.js')
const Command = require('../command.js')

module.exports = class Chans extends Command {

  constructor() {
    super('chans')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const chans = Object.keys(bot.chans).join(', ')

    respond(`Current channels: ${chans}`)
  }

}
