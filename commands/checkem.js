const Command = require('./command.js')
const _ = require('lodash');

module.exports = class Checkem extends Command {

  constructor() {
    super('checkem')
  }

  call(bot, opts, respond) {
    const target = opts.args[0] || 'bro'
    return respond('(⊃｡•‿•｡)⊃ Check \'em ' + target + ': ' + _.random(1,9) + '' + _.random(1,9))
  }
}

