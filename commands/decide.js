const Command = require('./command.js')
const _ = require('lodash')

class Decide extends Command {

  constructor() {
    super('decide')
  }

  call(opts, respond) {
    let choices = opts.args.join(' ').split(' or ')

    if (choices.length === 1) {
      choices = ['yes', 'no']
    }

    const decision = choices[_.random(choices.length - 1)]
    return respond(decision.trim())
  }

}

module.exports = new Decide()
