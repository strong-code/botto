const MSG_CACHE_LENGTH = 25
const Observer = require('./observer.js')

module.exports = class Sed extends Observer {

  constructor() {
    // we need callable() to always return true to build msgCache
    const regex = new RegExp(/.*/)
    super('sed', regex)
  }

  call(opts, respond) {
    if (/^s\/(.+)\/(.*)$/.test(opts.text)) {
      const [_, rgx, replacement] = opts.text.split('/')
      const replaced = this.tryReplacing(rgx, replacement)
      return respond(replaced)
    } else {
      this.storeMessage(opts.text)
    }
  }

  #msgCache = []

  storeMessage(msg) {
    if (this.#msgCache.length === MSG_CACHE_LENGTH) {
      this.#msgCache.pop()
    }

    this.#msgCache.unshift(msg)
  }

  tryReplacing(rgx, replacement) {
    const r = new RegExp(rgx)

    for(let msg of this.#msgCache) {
      if (r.test(msg)) {
        return msg.replace(r, replacement)
      }
    }
  }

}
