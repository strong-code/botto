const needle = require('needle')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class UrbanDictionary extends Command {

  constructor() {
    super('urbandictionary')
  }

  call(bot, opts, respond) {
    if (!opts.args) {
      return respond('Usage is !ud <phrase>')
    } else {
      return this.getDefinition(opts.args, respond)
    }
  }

  async getDefinition(phraseArray, respond) {
    const phrase = phraseArray.join('+')
    const apiUrl = `http://api.urbandictionary.com/v0/define?term=${phrase}`

    const res = await needle('get', apiUrl, Helpers.httpOptions)

    if (!res.body.list || res.body.list.length == 0) {
      return respond(`No definition found for "${phraseArray.join(' ')}"`)
    }
    
    const item = res.body.list[0]
    const desc = Helpers.strip(Helpers.truncate(item.definition, 200, '...'))
    const example = Helpers.strip(Helpers.truncate(item.example, 100, '...'))

    return respond(`${phrase}: ${desc} Example: ${example}`)
  }
}
