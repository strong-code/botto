const Command = require('./command.js')
const Helpers = require('../util/helpers.js')
const needle = require('needle')

module.exports = class Wikipedia extends Command {

  constructor() {
    super('wikipedia')
  }

  async call(bot, opts, respond) {
    const query = opts.args.join('_')
    const API_URL = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=200&titles=${query}&explaintext=1&exsectionformat=plain&format=json`

    const res = await needle('get', API_URL)
    const data = Object.values(res.body.query.pages)[0]
    const snippet = Helpers.strip(data.extract)
    const url = `https://en.wikipedia.org/wiki/${res.body.query.normalized[0].from}`

    return respond(`[Wikipedia] ${data.title}: ${snippet} | ${url}`)
  }

}
