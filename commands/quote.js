const Command = require('./command.js')
const db = require('../util/db.js')
const Helpers = require('../util/helpers.js')
const MsgCache = require('../util/messageCache.js')

module.exports = class Quote extends Command {

  constructor() {
    super('quote')
  }

  async call(bot, opts, respond) {
    const quote = opts.args.slice(2).join(' ').trim()

    switch (opts.args[0]) {
      case 'add':
        const userQuotes = await MsgCache.getQuoteList(opts.to, opts.args[1])
        if (!Helpers.userInChan(bot, opts.to, opts.args[1])) {
          return respond(`${opts.args[1]} is not a user in this channel currently`)
        } else if (!userQuotes.includes(quote)) {
          return respond(`${opts.args[1]} never said that`)
        } else {
          const id = await this.quoteAdd(quote, opts.args[1], opts.from, opts.to)
          if (id) {
            return respond(`Quote #${id} added ✍️'`)
          }
        }

        break
      case 'get':
        if (!Helpers.userInChan(bot, opts.to, opts.args[1])) {
          return respond(`${opts.args[1]} is not a user in this channel currently`)
        }

        const row = await this.quoteGetForNick(opts.args[1], opts.to)
        if (row) {
          return respond(`[#${row.id}] <${row.nick}> ${row.message}`)
        } else {
          return respond(`No quotes yet for ${opts.args[1]} in ${opts.to}`)
        }

        break
      case 'find':
        const rows = await this.quoteFind(quote.trim(), opts.to)
        if (rows) {
          return respond(`Quotes found: ${rows}`)
        } else {
          return respond(`No matching quotes found`)
        }

        break
      case 'info':
        const info = await this.getQuoteInfo(opts.args[1])
        if (info) {
          let date = new Date()
          date.setTime(Date.parse(info.date_spoken))
          return respond(`[#${info.id}] said by ${info.nick} in ${info.chan} at ${date.toDateString()}. Logged by ${info.logged_by}`)
        }
        
        break
      default:
        if (!isNaN(opts.args[0])) {
          const idQuote = await this.quoteGetById(opts.args[0])
          const reply = idQuote ? `[#${idQuote.id}] <${idQuote.nick}> ${idQuote.message}` : 'No quote found for that id'
          return respond(reply)
        } else {
          const rand = await this.quoteRandom(opts.to)
          if (rand) {
            return respond(`[#${rand.id}] <${rand.nick}> ${rand.message}`)
          }
        }

        break
    }

  }

  async getQuoteInfo(id) {
    return db.one('SELECT * FROM quotes WHERE id = $1', [id]).
      then((row) => {
        return row
      })
  }

  async quoteAdd(quote, nick, logged_by, chan) {
    return db.one(
      'INSERT INTO quotes (nick, logged_by, chan, message, date_spoken) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nick, logged_by, chan, quote, new Date().toISOString()]
    ).then((row) => {
      console.log(`Quote ${row.id} stored for ${nick} by ${logged_by}`)
      return row.id
    }).catch(e => {
      console.log(e.message)
    })
  }

  async quoteFind(seed, chan) {
    return db.manyOrNone('SELECT id FROM quotes WHERE message ILIKE $1 AND chan = $2', ['%' + seed + '%', chan])
    .then((rows) => {
      console.log(rows)
      if (rows.length > 0) {
        return rows.join(', ')
      }
    })
  }

  async quoteAllByNick(nick, chan) {
    return db.manyOrNone('SELECT * FROM quotes WHERE nick = $1 AND chan = $2', [nick, chan])
    .then((rows) => {
      // output to tmp txt and upload
    })
  }

  async quoteGetById(id) {
    return db.oneOrNone('SELECT * FROM quotes WHERE id = $1', [id])
    .then((row) => {
      return row
    })
  }

  async quoteGetForNick(nick, chan) {
    return db.oneOrNone('SELECT * FROM quotes WHERE nick = $1 AND chan = $2 ORDER BY RANDOM LIMIT 1', [nick, chan])
    .then((row) => {
      return row
    })
  }

  async quoteRandom(chan) {
    return db.oneOrNone('SELECT * FROM quotes WHERE chan = $1 ORDER BY RANDOM() LIMIT 1', [chan])
    .then((row) => {
      return row
    })
  }
}
