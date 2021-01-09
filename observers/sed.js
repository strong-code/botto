const MSG_CACHE_LENGTH = 25

module.exports = {

  call: function(opts, respond) {
    if (/^s\/(.+)\/(.*)$/.test(opts.text)) {
      const [_, rgx, replacement] = opts.text.split('/')
      const replaced = module.exports.tryReplacing(rgx, replacement)
      return respond(replaced)
    } else {
      module.exports.storeMessage(opts.text)
    }
  },

  msgCache: [],

  storeMessage: function(msg) {
    if (module.exports.msgCache.length === MSG_CACHE_LENGTH) {
      module.exports.msgCache.pop()
    }
    module.exports.msgCache.unshift(msg)
  },

  tryReplacing: function(rgx, replacement) {
    const r = new RegExp(rgx)

    for(let msg of module.exports.msgCache) {
      if (r.test(msg)) {
        return msg.replace(r, replacement)
      }
    }
  }

}
