const emoji = require('node-emoji')
const Observer = require('./observer.js')

module.exports = class Emoji extends Observer {

  constructor() {
    const regex = new RegExp(/^:\S*:$/i)
    super('emoji', regex)
  }
  
  call(opts, respond) {
    const match = opts.text.match(this.regex)

    if (match) {
      const emoji = this.getEmoji(match[0])

      if (emoji) {
        return respond(emoji)
      }

      return
    }
  }

  getEmoji(name) {
    if (this.#alias[name]) {
      name = this.#alias[name]
    }

    if (emoji.hasEmoji(name)) {
      return emoji.get(name)
    }
  }

  // TODO: move this into a separate file if it grows too big
  // or if it needs to be shared elsewhere
  #alias = {
    ':thinking:': 'thinking_face:'
  }

}

