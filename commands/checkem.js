const Command = require('./command.js')
const _ = require('lodash');

class Checkem extends Command {

  constructor() {
    super('checkem')
  }

  call(opts, respond) {
    const target = opts.args[0] || 'bro'
    return respond('(⊃｡•‿•｡)⊃ Check \'em ' + target + ': ' + _.random(1,9) + '' + _.random(1,9))
  }
}

module.exports = new Checkem()
