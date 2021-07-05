const db = require('../util/db.js')
const Command = require('./command.js')
// const TellObserver = require('../observers/tell.js')

module.exports = class Tell extends Command {

  constructor() {
    super('tell')
  }

  call(opts, respond) {
    const receiver = opts.args.shift()
    const msg      = opts.args.join(' ')

    if (msg && receiver) {
      return this.saveMessage(opts.to, opts.from, receiver, msg, respond)
    } else {
      return respond('Usage is !tell <nick> <message>')
    }
  }

  saveMessage(chan, sender, receiver, msg, respond) {
    // this.toCache(chan, sender, receiver, msg)
    this.toDisk(chan, sender, receiver, msg)
    return respond(`Message saved. I will tell ${receiver} next time they are around.`)
  }

  toCache(chan, sender, receiver, msg) {
    TellObserver.addTell(receiver, { chan: chan, sender: sender, msg: msg })
  }

  toDisk(chan, sender, receiver, msg) {
    db.none(
      'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      [chan, sender, receiver, msg, new Date().toISOString()]
    ).then(() => console.log('Tell message saved to disk'))
  }

}
