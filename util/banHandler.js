module.exports = class BanHandler {

  constructor(bot) {
    this.bans = []
    this.bot = bot

    this.bot.addListener("join", (chan, nick, message) => {
      if (nick == 'botto' && this.bans.indexOf(chan) !== -1) {
        this.bot.say('#botto', `Successfully rejoin ${chan}`)
        console.log(`Successfully rejoined ${chan}`)
        this.bans = this.bans.filter(c => c != chan)
      }
      this.bot.removeAllListeners(`join${chan}`)
    })
  }

  addBan(chan) {
    if (this.bans.indexOf(chan) !== -1) {
      return
    } else {
      console.log(`Added ${chan} to ban watcher list`)
      this.bans.push(chan)
    }

    this.#attemptRejoins()
  }

  showBans() {
    return this.bans.join(', ')
  }

  #attemptRejoins() {
    if (this.rejoinTimer || this.bans.length == 0) {
      return
    }

    this.bans.forEach((chan) => {
      this.bot.join(chan)
    })

    this.rejoinTimer = setTimeout(() => {
      delete this.rejoinTimer
      this.#attemptRejoins()
    }, 60000)
  }

}
