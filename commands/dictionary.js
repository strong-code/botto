const needle = require('needle');
const config = require('../config').url.options
const creds = require('../config').oxford
const BASE_URL = 'https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/'

module.exports = {

  call: async function(opts, respond) {
    const word = opts.args[0]

    if (!word || word === '') {
      return respond('Usage is !dictionary <word>')
    }

    const def = await module.exports.getDefinition(word)
    
    respond(def)
  },

  getDefinition: async function(word) {

    config.headers['app_id'] = creds.id
    config.headers['app_key'] = creds.apiKey
    const API_URL = `${BASE_URL}${word}?fields=definitions&strictMatch=false`

    const res = await needle('get', API_URL, config)
    
    if (res.body.error) {
      return res.body.error
    }

    const data = res.body.results
    const definitions = {}

    data[0].lexicalEntries.forEach(le => {
      const type = le.lexicalCategory.text
      definitions[type] = ''
      le.entries.forEach(e => {
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
