const db = require('../util/db.js')
const Observer = require('./observer.js')
const TellCache = require('../util/tellCache.js')
const moment = require('moment')

module.exports = class Tell extends Observer {

  constructor() {
    const regex = new RegExp(/.*/)
    super('tell', regex)
  }

  async init() {
    super.init()
    await TellCache.refresh()
  }

  call(opts, respond) {
    const receiver = opts.from

    if (TellCache.tellsFor(receiver)) {
      console.log(`Sending ${TellCache.tellsFor(receiver).length} tells to ${receiver}`)

      TellCache.tellsFor(receiver).forEach((tell) => {
        this.sendMessage(receiver, tell, (info) => respond(info))
      })

      TellCache.clearFor(receiver)
    }
  }

  sendMessage(receiver, tell, cb) {
    db.none('UPDATE tells SET sent = true WHERE receiver = $1 AND message = $2', [receiver, tell.msg])
    console.log(`Tell marked as sent`)
    return cb(`${receiver}, ${tell.sender} says: ${tell.msg} (${tell.at.fromNow()})`)
  }

}
