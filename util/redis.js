const moment = require('moment')
const redis = require('redis')
const VALID_EVENTS = ['join', 'part', 'quit', 'kick', 'kill', 'message', 'nick', 'action']
let client

const build = async(bot) => {
  client = redis.createClient().on('error', err => console.log('Redis Client error:', err));
  await client.connect()

  bot.addListener("join", (chan, nick, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    recordEvent(nick, chan, now, 'join', '')
  })

  bot.addListener("part", (chan, nick, reason, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    reason = reason || ''
    recordEvent(nick, chan, now, 'part', reason)
  })

  bot.addListener("quit", (nick, reason, chans, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    reason = reason || ''
    recordEvent(nick, '', now, 'quit', reason)
  })

  bot.addListener("kick", (chan, nick, by, reason, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    recordEvent(nick, chan, now, 'kick', `${reason} by ${by}`)
  })

  bot.addListener("kill", (nick, reason, chans, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    reason = reason || ''
    recordEvent(nick, '', now, 'kill', reason)
  })

  bot.addListener("message", (nick, to, text, msg) => {
    if (to === '#botto') return

    let now = moment().format('MMM Do YYYY, h:mm a')
    recordEvent(nick, to, now, 'message', text)
  })

  bot.addListener("nick", (oldnick, newnick, chans, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    recordEvent(oldnick, '', now, 'nick', `${oldnick} changed nick to ${newnick}`)
    recordEvent(newnick, '', now, 'nick', `${newnick} changed nick from ${oldnick}`)
  })

  bot.addListener("action", (from, to, text, msg) => {
    let now = moment().format('MMM Do YYYY, h:mm a')
    recordEvent(from, to, now, 'action', text) 
  })

  console.log(`Redis client initiated and connected with ${VALID_EVENTS.length} event listeners`)
}

const recordEvent = async (nick, chan, time, type, eventString) => {
  if (!VALID_EVENTS.find(t => type === t)) {
    console.log(`${type} is not a valid type - not recording event`)
    return
  }

  await client.hSet(nick, {
    chan: chan,
    time: time,
    type: type,
    eventString: eventString
  })
}

module.exports = {
  
  init: async(bot) => {
    await build(bot)
  },

  get: async(k) => {
    return await client.get(k)
  },

  set: async(k, v) => {
    return await client.set(k, v)
  },

  hGetAll: async(k) => {
    return await client.hGetAll(k)
  },

  hSet: async(k, obj) => {
    return await client.hSet(k, obj)
  },

  rPush: async(list, msg) => {
    return await client.rPush(list, msg)
  },

  lRange: async(list, start, end) => {
    return await client.lRange(list, start, end)
  },

  lLen: async(list) => {
    return await client.lLen(list)
  },

  lTrim: async(list) => {
    return await client.lTrim(list)
  }

}
