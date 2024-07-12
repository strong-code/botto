const Observer = require('./observer.js')
const MsgCache = require('../util/messageCache.js')
const regex = new RegExp(/^s\/(.+)\/(.*)$/)
const vm = require('vm')

module.exports = class Sed extends Observer {

  constructor() {
    super('sed', regex)
  }

  async call(opts, respond) {
    const [_, rgx, replacement] = opts.text.split('/')
    const r = new RegExp(rgx)

    const msgCache = await MsgCache.get(opts.to)

    for (let msg of msgCache.reverse()) {

      // don't want to match the initial s/*/* observer message
      if (msg.text === opts.text) {
        continue
      }

      // don't match other s/foo/bar user messages
      if (regex.test(msg)) {
        continue
      }

      const ctx = vm.createContext({
        match: null,
        msg: msg,
        r: r,
        replacement: replacement
      })

      const script = new vm.Script('match = r.test(msg)')

      try {
        script.runInContext(ctx, { timeout: 5000 })
        if (ctx.match) {
          return respond(msg.replace(r, replacement))
        }
      } catch (e) {
        console.log(e)
        return respond('Timeout exceeded (5000ms). Stop trying to break me')
      }
    }
  }

}
