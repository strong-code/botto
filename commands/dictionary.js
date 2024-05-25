const Command = require('./command.js')
const needle = require('needle');
const config = require('../config').url.options
const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

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
    const API_URL = `${BASE_URL}${word}`

    const res = await needle('get', API_URL, config)
    
    if (res.body.title === "No Definitions Found") {
      return res.body.message
    }

    if (res.body.error) {
      return res.body.error
    }

    const data = res.body
    const definitions = {}

    data.forEach(e => {
      let part = e['meanings'][0]['partOfSpeech']
      let def = e['meanings'][0]['definitions'][0]['definition']
      definitions[part] = def
    })

    let defstr = ''
    for (const [k, v] of Object.entries(definitions)) {
      defstr += `(${k.toLowerCase()}) ${v} `
    }

    return `"${word}" - ${defstr}`
  }

}

