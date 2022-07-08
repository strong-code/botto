const db = require('../util/db.js')
const Command = require('./command.js')
const TellCache = require('../util/tellCache.js')
const moment = require('moment')

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
    TellCache.refresh()
    return respond(`Message saved. I will tell ${receiver} next time they are around.`)
  }

  async toDisk(chan, sender, receiver, msg) {
    const created_at = moment().format('YYYY-MM-DD HH:mm:ss')
    await db.none(
      'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      [chan, sender, receiver, msg, created_at]
    )

    console.log('Tell message saved to disk')
  }

}
