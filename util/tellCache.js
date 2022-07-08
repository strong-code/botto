const db = require('./db.js')
const moment = require('moment')

module.exports = class TellCache {

  constructor() {}

  static tells = {}

  static async refresh() {
    this.tells = {}
    let total = 0

    await db.each('SELECT * FROM tells WHERE sent = false', [], row => {
      let receiver = row.receiver
      let at = moment(row.created_at)
      let tell = { chan: row.chan, sender: row.sender, msg: row.message, at: at }
      total++

      if (this.tells[receiver]) {
        this.tells[receiver].push(tell)
      } else {
        this.tells[receiver] = [tell]
      }
    })

    console.log(`Tell message cache warmed with ${total} messages`)
  }

  static tellsFor(nick) {
    return this.tells[nick]
  }

  static clearFor(nick) {
    delete this.tells[nick]
  }
}
