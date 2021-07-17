const _ = require('lodash')
const needle = require('needle')
const baseUrl = 'http://api.urbandictionary.com/v0/define?term='
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class UrbanDictionary extends Command {

  constructor() {
    super('urbandictionary')
  }

  call(bot, opts, respond) {
    if (_.isEmpty(opts.args)) {
      return respond('Usage is !ud <phrase>')
    } else {
      return this.getDefinition(opts.args, respond)
    }
  }

  getDefinition(phraseArray, respond) {
    const phrase = _.join(phraseArray, ' ')
    const apiUrl = baseUrl + _.join(phraseArray, '+')

    return needle.get(apiUrl, Helpers.httpOptions, (err, res) => {
      if (err) {
        return respond(err.message)
      }

      if (!res.body.list) {
        return respond('No definition found for: ' + phrase)
      }
      
      const upper = res.body.list.length - 1
      const item = res.body.list[_.random(0, upper)]
      if (item) {
        return respond(phrase + ': ' + item.definition + '. Example: ' + item.example)
      }

      return respond('No definition found for: ' + phrase)
    })
  }
}
