const Command = require('./command.js')
const needle = require('needle')

module.exports = class Duck extends Command {

  constructor() {
    super('duck')
  }

  async call(bot, opts, respond) {
    const res = await needle('get', 'https://random-d.uk/api/random')
    return respond(`Here is your duck: ${res.body.url}`)
  }
}
