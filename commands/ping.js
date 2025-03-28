const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class Ping extends Command {

  constructor() {
    super('ping')
  }

  async call(bot, opts, respond) {
    if (opts.args[0]) {
      const inChan = await Helpers.userInChan(bot, opts.to, opts.args[0])

      if (!inChan) {
        return respond(`${opts.args[0]} is not in this channel`)
      } else {
        const wrapper = function(msg) {
          if (msg.command === 'NOTICE' && msg.args[1].startsWith('\x01PING ')) {
            const receivedTimestamp = parseInt(msg.args[1].replace(/\x01PING (\d+)\x01/, '$1'), 10);
            const latency = (Date.now() - receivedTimestamp) / 1000
            console.log(`Latency with ${msg.nick}: ${latency} ms`);
            respond(`${opts.args[0]} has a latency of ${latency} seconds`)
            bot.removeListener('raw', wrapper)
          }
        }

        bot.addListener('raw', wrapper)
        const str = `\x01PING ${Date.now()}\x01`
        return bot.say(opts.args[0], str)
      }
    }
  }
}
