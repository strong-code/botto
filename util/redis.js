const moment = require('moment')
const redis = require('redis')
const VALID_EVENTS = ['join', 'part', 'quit', 'kick', 'kill', 'message', 'nick', 'action']

module.exports = class RedisClient {

  constructor(bot) {
    this.bot = bot
    this.client = redis.createClient().on('error', err => console.log('Redis Client error:', err));
    (async () => {
      await this.client.connect()
    })();
    this.initListeners()
  }


  initListeners() {
    this.bot.addListener("join", (chan, nick, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(nick, chan, now, 'join', '')
    })

    this.bot.addListener("part", (chan, nick, reason, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      reason = reason || ''
      this.recordEvent(nick, chan, now, 'part', reason)
    })

    this.bot.addListener("quit", (nick, reason, chans, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(nick, chans, now, 'quit', reason)
    })

    this.bot.addListener("kick", (chan, nick, by, reason, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(nick, chan, now, 'kick', `${reason} by ${by}`)
    })

    this.bot.addListener("kill", (nick, reason, chans, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(nick, chans, now, 'kill', reason)
    })

    this.bot.addListener("message", (nick, to, text, msg) => {
      if (to === '#botto') return

      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(nick, to, now, 'message', text)
    })

    this.bot.addListener("nick", (oldnick, newnick, chans, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(oldnick, chans[0], now, 'nick', `${oldnick} changed nick to ${newnick}`)
      this.recordEvent(newnick, chans[0], now, 'nick', `${newnick} changed nick from ${oldnick}`)
    })

    this.bot.addListener("action", (from, to, text, msg) => {
      let now = moment().format('MMM Do YYYY, h:mm a')
      this.recordEvent(from, to, now, 'action', text) 
    })

    console.log(`Redis client initiated and connected with ${VALID_EVENTS.length} event listeners`)
  }

  async recordEvent(nick, chan, time, type, eventString) {
    if (!VALID_EVENTS.find(t => type === t)) {
      console.log(`${type} is not a valid type - not recording event`)
      return
    }

    await this.client.hSet(nick, {
      chan: chan,
      time: time,
      type: type,
      eventString: eventString
    })
  }

}
