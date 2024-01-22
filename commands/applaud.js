const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class Applaud extends Command {

  constructor() {
    super('applaud')
  }

  async call(bot, opts, respond) {
    let target = opts.args[0]
    const endings = [
      'for doing an amazing job!',
      'for all that they have done',
      'for being amazing',
      'loudly',
      'and thanks them'
    ]

    const ending = endings[Math.floor(Math.random() * endings.length)]

    if (await Helpers.userInChan(bot, opts.to, target)) {
      return bot.action(opts.to, `applauds ${target} ${ending} 👏 👏 👏`)
    }
  }
}
