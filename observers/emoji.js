const _  = require('lodash')
const emoji = require('node-emoji')

module.exports = {
  
  call: function(opts, respond) {
    const match = opts.text.match(regex)

    if (match) {
      module.exports.getEmoji(match[0], (e) => respond(e))
    }
  },

  getEmoji: function(name, cb) {
    if (module.exports.alias[name]) {
      name = module.exports.alias[name]
    }

    if (emoji.hasEmoji(name)) {
      cb(emoji.get(name))
    }
  },

  // TODO: move this into a separate file if it grows too big
  // or if it needs to be shared elsewhere
  alias: {
    ':thinking:': 'thinking_face:'
  }

}

const regex = new RegExp(/^:\S*:$/gi)
