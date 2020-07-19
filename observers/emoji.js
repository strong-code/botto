const _  = require('lodash')
const emoji = require('node-emoji')

module.exports = {
  
  call: function(opts, respond) {
    const match = opts.text.match(regex)

    if (match && emoji.hasEmoji(match[0])) {
      const e = emoji.get(match[0])
      respond(e)
    }
  }

}

const regex = new RegExp(/^:\S*:$/gi)
