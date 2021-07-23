const needle = require('needle')
const Helpers = require('../../util/helpers.js')

module.exports = {

  hostMatch: /^(www\.)?(en\.)?wikipedia\.org$/,

  parse: async function(url) {
    const query = url.path.split('/')[2]
    const API_URL = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=250&titles=${query}&explaintext=1&exsectionformat=plain&format=json`

    const res = await needle('get', API_URL)
    const data = Object.values(res.body.query.pages)[0]
    const snippet = Helpers.strip(data.extract)

    return `[Wikipedia] ${snippet}`
  }

}
