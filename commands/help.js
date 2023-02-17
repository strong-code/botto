const fs = require('fs')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class Help extends Command {

  constructor() {
    super('help')
  }

  async call(bot, opts, respond) {
    const text = fs.readFileSync('scripts/help.txt', { encoding: 'utf8' })
    const res = await Helpers.uploadText(text)

    return respond(`Help is on the way: ${res.body.path}`)
  }

}
