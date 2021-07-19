const db = require('../util/db.js')
const Command = require('./command.js')

module.exports = class Points extends Command {

  constructor() {
    super('points')
  }

  call(bot, opts, respond) {
    // if no arg supplied, look up points of sender
    const nick = (opts.args[0] ? opts.args[0] : opts.from)
    return this.showPoints(nick, respond)
  }

  async showPoints(nick, respond) {
    try {
      const points = await db.one('SELECT score FROM points WHERE nick = $1', [nick], r => r.score)
      return respond(`${nick} has ${points} points`)
    } catch (e) {
      return respond(`${nick} has 0 points`)
    }
  }

}
