const Command = require('./command.js')

class Ping extends Command {

  constructor() {
    super('ping')
  }

  call(opts, respond) {
    return respond(`${opts.from}: PONG`)
  }
}

module.exports = new Ping()
