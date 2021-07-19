const db = require('../util/db.js')
const Command = require('./command.js')

module.exports = class Shout extends Command {

  constructor() {
    super('shout')
  }

  call(bot, opts, respond) {
    if (opts.args[0].length) {
      return this.getShoutForNick(opts.args[0], respond)
    } else {
      return this.getShout(respond)
    }
  }

  async getShout(respond) {
    const row = await db.one('SELECT * FROM shouts ORDER BY random() LIMIT 1', [])
    return respond(row.message)
  }

  async getShoutForNick(nick, respond) {
    const row = await db.one('SELECT * FROM shouts WHERE nick = $1 ORDER BY random() LIMIT 1', [nick])
    return respond(row.message)
  }

}
