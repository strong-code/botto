const _config = require('./config.js').core
const config = (process.argv[2] === 'test' ? _config.test : _config.default)
const fs = require('fs')
const irc = require('irc')
const commandHandler = new (require('./commands/_commandHandler.js'))()
const observerHandler = new (require('./observers/_observerHandler.js'))()
const Ignore = require('./commands/admin/ignore.js')
const MsgCache = require('./util/messageCache.js')
const Helpers = require('./util/helpers.js')
const kickCounter = {}; // ; is needed here for SEAF

// Preload the observerHandler and commandHandler
(async () => {
  await commandHandler.init()
  await observerHandler.init()
})();

// Initiate the bot and the observers
const bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

const BanHandler = new (require('./util/banHandler.js'))(bot)

console.log(`${new Array(35).join('-')}` +
  String.raw`
   _           _   _        
  | |         | | | |       
  | |__   ___ | |_| |_ ___  
  | '_ \ / _ \| __| __/ _ \ 
  | |_) | (_) | |_| || (_) |
  |_.__/ \___/ \__|\__\___/ 
  ` + `  
  ${new Date().toLocaleString()}
  ${'\n'}
  Server: ${config.server}:${config.port} ${config.secure ? '(SSL)' : ''}
  Channels: ${config.channels.join(', ')}
${new Array(35).join('-')}
`)

bot.addListener("message", function(from, to, text, msg) {
  console.log(` <- [${to}] ${from}: ${text}`)

  MsgCache.put(from, to, text, new Date().toISOString())

  try {
    if (!Ignore.isIgnored(from)) {  
      if (text[0] === '!') {
        // Delegate explicit commands starting with a !bang to the handler
        commandHandler.route(bot, from, to, text, msg)
      } else {
        // Delegate observables (keywords, mentions, etc) to the handler
        observerHandler.route(bot, from, to, text, msg)
      }
    }
  } catch (e) {
    console.error(e)
    bot.say(to, 'Something went wrong, check !logs for more info')
  }

})

bot.addListener("invite", (chan, from, message) => {
  if (Helpers.isAdmin(from, chan)) {
    console.log(`Accepting invite to ${chan} from ${from}`)
    bot.join(chan)
  }
})

bot.addListener("kick", (chan, nick, by, reason, message) => {
  if (nick == 'botto') {
    if (kickCounter[chan] > 2) {
      console.log(`Attempted to rejoin 3 times, cooldown for 1 minute...`)
      setTimeout(() => {
        kickCounter[chan] = 0
        console.log(`Rejoin cooldown expired, attempting to rejoin ${chan}`)
        bot.join(chan)
      }, 60000)
      return
    } else {
      kickCounter[chan] = (kickCounter[chan] || 0) + 1
      console.log(`Kicked from ${chan} by ${by}: ${reason}. Attemping to rejoin... (${kickCounter[chan]}/3)`)
      bot.join(chan)
    }
  }
})

bot.addListener("error", function(err) {
  if (err.args[2] == 'Cannot join channel (+b)') {
    BanHandler.addBan(err.args[1])
  } else {
    console.error("[ERROR] ", err)
  }
})

