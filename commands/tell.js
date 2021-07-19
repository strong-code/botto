const db = require('../util/db.js')
const Command = require('./command.js')
const TellObserver = require('../observers/tell.js')

module.exports = class Tell extends Command {

  constructor() {
    super('tell')
  }

  call(bot, opts, respond) {
    const receiver = opts.args.shift()
    const msg      = opts.args.join(' ')

    if (msg && receiver) {
      return this.saveMessage(opts.to, opts.from, receiver, msg, respond)
    } else {
      return respond('Usage is !tell <nick> <message>')
    }
  }

  async saveMessage(chan, sender, receiver, msg, respond) {
    await this.toDisk(chan, sender, receiver, msg)
    TellObserver.refresh()
    return respond(`Message saved. I will tell ${receiver} next time they are around.`)
  }

  async toDisk(chan, sender, receiver, msg) {
    await db.none(
      'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      [chan, sender, receiver, msg, new Date().toISOString()]
    )

    console.log('Tell message saved to disk')
  }

}
