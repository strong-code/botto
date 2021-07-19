const db = require('../util/db.js')
const moment = require('moment')
const Observer = require('./observer.js')

module.exports = class Shout extends Observer {

  constructor() {
    const regex = new RegExp(/^[^a-z]{4,}$|^who\ssaid\sthat$/)
    super('shout', regex)
  }

  call(opts, respond) {
    if (opts.text === 'who said that') {
      if (this.lastShout) {
        const lastAt = moment(this.lastShout.date_spoken).format('dddd, MMMM Do YYYY')
        return respond(`${this.lastShout.nick} said that in ${this.lastShout.chan} on ${lastAt}`)
      } else {
        return respond(`Who said what?`)
      }
    } else {
      this.storeShout(opts)
      this.getShout(respond)
    }
  }

  lastShout = null

  storeShout(opts) {
    db.none(
      'INSERT INTO shouts (nick, chan, message, date_spoken) VALUES ($1, $2, $3, $4)',
      [opts.from, opts.to, opts.text, new Date().toISOString()]
    ).then(() => {
      console.log("[" + opts.to + "] Shout quote from " + opts.from + " stored.")
    }).catch(error => {
      console.log(`Ignoring duplicate shout message`)
    })
  }

  async getShout(respond) {
    const shout = await db.one('SELECT * FROM shouts ORDER BY random() LIMIT 1')
    this.lastShout = shout
    return respond(shout.message)
  }

}
