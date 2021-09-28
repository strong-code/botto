const Command = require('./command.js')

module.exports = class Version extends Command {

  constructor() {
    super('version')
  }

  call(bot, opts, respond) {
    const target = opts.args[0]

    // Register single event listener so we don't fire on non !version CTCPs
    bot.once('ctcp', (from, to, text, type, message) => {
      respond(message.args[1]?.split('VERSION')[1]?.slice(1, -1))
    })

    bot.ctcp(target, 'privmsg', 'version')
  }
}
