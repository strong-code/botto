const db = require('../util/db.js')
const Observer = require('./observer.js')

module.exports = class Reply extends Observer {

  constructor() {
    const regex = new RegExp(/.*/)
    super('reply', regex, 5)
  }

  #lastReply = undefined

  async call(opts, respond) {
    if (opts.text === 'who added that') {
      return respond(this.#lastReply ? this.#lastReply.added_by : 'who added what?')
    } else {
      const row = await db.oneOrNone(
        'SELECT * FROM replies WHERE trigger = $1 AND enabled = true ORDER BY RANDOM() LIMIT 1', 
        [opts.text])

      if (row) {
        this.#lastReply = row
        return respond(row.reply)
      }
    }
  }

}
