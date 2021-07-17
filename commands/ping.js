const Command = require('./command.js')

module.exports = class Ping extends Command {

  constructor() {
    super('ping')
  }

  call(bot, opts, respond) {
    return respond(`${opts.from}: PONG`)
  }
}
