const db = require('../util/db.js')
const Command = require('./command.js')

module.exports = class Shout extends Command {

  constructor() {
    super('shout')
  }

  call(bot, opts, respond) {
    return this.getShout(opts.args.join(' '), respond)
  }

  async getShout(query, respond) {
    let row

    if (query.indexOf(';') > -1) {
      query = ''
    }

    if (query) {
      let pattern = `%${query.toUpperCase()}%`
      row = await db.one('SELECT * FROM shouts WHERE message LIKE $1 ORDER BY random() LIMIT 1', [pattern])
    } else {
      row = await db.one('SELECT * FROM shouts ORDER BY random() LIMIT 1', [])
    }
    return respond(row.message)
  }

  async getShoutForNick(nick, respond) {
    const row = await db.one('SELECT * FROM shouts WHERE nick = $1 ORDER BY random() LIMIT 1', [nick])
    return respond(row.message)
  }

}
