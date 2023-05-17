const Observer = require('./observer.js')
const MsgCache = require('../util/messageCache.js')
const regex = new RegExp(/^s\/(.+)\/(.*)$/)

module.exports = class Sed extends Observer {

  constructor() {
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

      // don't match other s/foo/bar user messages
      if (regex.test(msg.text)) {
        continue
      }

      try {
        if (r.test(msg.text)) {
          return respond(msg.text.replace(r, replacement))
        }
      } catch (e) {
        console.log(e)
        return respond('Invalid regex, nothing to replace')
      }
    }
  }

}
