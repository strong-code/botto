const db = require('../util/db.js')
const _ = require('lodash')
const Observer = require('./observer.js')

module.exports = class Tell extends Observer {

  // key: receiver nick
  // value: array of tell objects
  // msgCache[receiver] = [ { chan, sender, message } ]
  static msgCache = {}

  constructor() {
    const regex = new RegExp(/.*/)
    super('tell', regex)
  }

  async init() {
    super.init()
    await Tell.refresh()
  }

  call(opts, respond) {
    const receiver = opts.from

    if (_.includes(_.keys(Tell.msgCache), receiver)) {
      console.log(`Sending ${Tell.msgCache[receiver].length} tells to ${receiver}`)
      _.forEach(Tell.msgCache[receiver], (tell) => {
        this.sendMessage(receiver, tell, (info) => respond(info))
      })
      delete Tell.msgCache[receiver]
    }
  }

  static async refresh() {
    Tell.msgCache = {}
    let total = 0

    await db.each('SELECT * FROM tells WHERE sent = false', [], row => {
      const receiver = row.receiver
      const tell = { chan: row.chan, sender: row.sender, msg: row.message }
      total++

      if (Tell.msgCache[receiver]) {
        Tell.msgCache[receiver].push(tell)
      } else {
        Tell.msgCache[receiver] = [tell]
      }
    })

    console.log(`Tell message cache warmed with ${total} messages`)
  }
  
  sendMessage(receiver, tell, cb) {
    db.none('UPDATE tells SET sent = true WHERE receiver = $1 AND message = $2', [receiver, tell.msg])
    console.log(`Tell marked as sent`)
    return cb(`${receiver}, ${tell.sender} says: ${tell.msg}`)
  }

}
