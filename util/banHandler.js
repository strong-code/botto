const Redis = require('./redis.js')
const BAN_SET = 'CHANNEL_BANS'

module.exports = class BanHandler {

  constructor(bot) {
    this.bot = bot

    this.bot.addListener("join", async (chan, nick, message) => {
      let currBans = await Redis.sMembers(BAN_SET)

      if (nick == 'botto' && currBans.includes(chan)) {
        this.bot.say('#botto', `Successfully rejoined ${chan}`)
        console.log(`Successfully rejoined ${chan}`)
        await Redis.sRem(BAN_SET, chan)
      }
    })
  }

  async getBans() {
    return await Redis.sMembers(BAN_SET)
  }

  async addBan(chan) {
    const currBans = await Redis.sMembers(BAN_SET)

    if (currBans.includes(chan)) {
      return
    } else {
      await Redis.sAdd(BAN_SET, chan)
      console.log(`Added ${chan} to ban watcher list`)
    }

    this.#attemptRejoins()
  }

  static async showBans() {
    const currBans = await Redis.sMembers(BAN_SET)
    return currBans.join(', ')
  }

  async #attemptRejoins() {
    const currBans = await Redis.sMembers(BAN_SET)

    if (this.rejoinTimer || currBans.length == 0) {
      return
    }

    currBans.forEach((chan) => {
      this.bot.join(chan)
    })

    this.rejoinTimer = setTimeout(() => {
      delete this.rejoinTimer
      this.#attemptRejoins()
    }, 60000)
  }

}
