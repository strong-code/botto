const Observer = require('./observer.js')
const MsgCache = require('../util/messageCache.js')
const regex = new RegExp(/^s\/(.+)\/(.*)$/)
const vm = require('vm')

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

      const ctx = vm.createContext({
        match: null,
        msg: msg,
        r: r,
        replacement: replacement
      })

      const script = new vm.Script('match = r.test(msg.text)')

      try {
        script.runInContext(ctx, { timeout: 5000 })
        if (ctx.match) {
          return respond(msg.text.replace(r, replacement))
        }
      } catch (e) {
        console.log(e)
        return respond('Timeout exceeded (5000ms). Stop trying to break me')
      }
    }
  }

}
