const Command = require('./command.js')
const needle = require('needle');
const config = require('../config').url.options
const creds = require('../config').oxford
const BASE_URL = 'https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/'

module.exports = class Dictionary extends Command {

  constructor() {
    super('dictionary')
  }

  async call(bot, opts, respond) {
    const word = opts.args[0]

    if (!word || word === '') {
      return respond('Usage is !dictionary <word>')
    }

    let response
    try {
      response = await this.getDefinition(word)
    } catch (e) {
      response = e.message
    }

    respond(response)
  }

  async getDefinition(word) {

    config.headers['app_id'] = creds.id
    config.headers['app_key'] = creds.apiKey
    const API_URL = `${BASE_URL}${word}?fields=definitions&strictMatch=false`

    const res = await needle('get', API_URL, config)
    
    if (res.body.error) {
      return res.body.error
    }

    const data = res.body.results[0]
    const definitions = {}

    data.lexicalEntries.forEach(le => {
      const type = le.lexicalCategory.text
      definitions[type] = ''
      
      // sometimes the lexicalEntries don't contain definitions?
      if (typeof le.entries === 'undefined') {
        throw new Error(`No definitions found for "${word}"`)
      }

      le.entries.forEach(e => {
        if (typeof e.senses === 'undefined') {
          throw new Error(`No definitions found for "${word}" (type unspecified)`)
        }

        definitions[type] = e.senses[0].definitions[0]
      })
    })

    let defstr = ''
    for (const [k, v] of Object.entries(definitions)) {
      defstr += `(${k.toLowerCase()}) ${v} `
    }

    return `"${word}" - ${defstr}`
  }

}

