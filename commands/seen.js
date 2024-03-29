const Command = require('./command.js')
const RedisClient = require('../util/redis.js')
const Helpers = require('../util/helpers.js')

module.exports = class Seen extends Command {

  constructor() {
    super('seen')
  }

  async call(bot, opts, respond) {
    const nick = opts.args[0]

    if (!nick) {
      return respond('Usage is !seen <nick>')
    }

    if (await Helpers.userInChan(bot, opts.to, nick)) {
      return respond(`${nick} is in the channel right now`)
    }

    const lastEvent = await RedisClient.hGetAll(nick)

    if (Object.entries(lastEvent).length === 0) {
      return respond(`I've never seen ${nick}`)
    }

    const str = this.fmtEvent(lastEvent)
    respond(`${nick} ${str} at ${lastEvent.time}`)
  }

  fmtEvent(lastEvent) {
    let str

    switch (lastEvent.type) {
      case 'join':
        str = `was last seen joining ${lastEvent.chan}`
        break
      case 'part':
        str = `was last seen leaving ${lastEvent.chan}`

        if (lastEvent.eventString) {
          str += ` saying: "${lastEvent.eventString}"`
        }
        break
      case 'quit':
        str = `was last seen quitting`
        break
      case 'kick':
        str = `was last seen getting kicked from ${lastEvent.chan}`
        break
      case 'kill':
        str = `was killed from the server`
        break
      case 'message':
        str = `was last seen saying "${lastEvent.eventString}" in ${lastEvent.chan}`
        break
      case 'nick':
        str = `was last seen changing their nickname: ${lastEvent.eventString}`
        break
      case 'action':
        str = `was last seen emoting: ${lastEvent.eventString}`
        break
    }

    return str
  }
}
