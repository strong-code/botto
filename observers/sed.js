const Observer = require('./observer.js')
const MsgCache = require('../util/messageCache.js')

module.exports = class Sed extends Observer {

  constructor() {
    const regex = new RegExp(/^s\/(.+)\/(.*)$/)
    super('sed', regex)
  }

  call(opts, respond) {
    const [_, rgx, replacement] = opts.text.split('/')
    const r = new RegExp(rgx)

    for (let msg of MsgCache.get(opts.to)) {

      // don't want to match the initial s/*/* observer message
      if (msg.text === opts.text) {
        continue
      }

      if (r.test(msg.text)) {
        return respond(msg.text.replace(r, replacement))
      }
    }
  }

}
