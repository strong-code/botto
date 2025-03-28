const Command = require('./../command.js')
const Redis = require('../../util/redis.js')
const BAN_SET = 'CHANNEL_BANS'

module.exports = class Bans extends Command {

  //TODO: implement msg ChanServ CHECKBAN #chan for checking reason banned

  constructor() {
    super('bans')
  }

  async call(bot, opts, respond) {
    const currBans = await Redis.sMembers(BAN_SET)
    return respond(`Currently banned from: ${currBans.join(', ')}`)
  }
}
