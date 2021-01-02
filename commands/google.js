const needle  = require('needle')
const BASE_URL = 'https://customsearch.googleapis.com/customsearch/v1?'
const google = require('../config.js').google
const config = require('../config').url

module.exports = {

  call: async function(opts, respond) {
    if (opts.args[0] === '') {
      respond('Usage is !google <query> or !google 1 <query> to get next result')
    }

    let idx = 0
    if (!isNaN(opts.args[0])) {
      idx = opts.args[0]
    }

    const query = opts.args.join('+');
    const info = await module.exports.search(query, idx)
    respond(info)
  },

  search: async function(query, idx) {
    const API_URL = `${BASE_URL}cx=${google.cx}&q=${query}&key=${google.key}`

    const res = await needle('get', API_URL, config)

    if (res.body.searchInformation.totalRestults === '0') {
      return 'No results found'
    }

    if (idx > res.body.items.length) {
      return `Found fewer than ${idx} search results`
    }

    const item = res.body.items[idx]
    const charsLeft = 255 - (item.title.length + item.link.length)
    const desc = item.snippet.replace(/\r?\n|\r/g, " ").substring(0, charsLeft)

    return `[${item.title}] ${item.link} | ${desc}`
  }

}

