const _config = require('./config.js').core;
const config = (process.argv[2] === 'test' ? _config.test : _config.default);
const fs = require('fs');
const irc = require('irc');
const commandHandler = new (require('./commands/_commandHandler.js'))();
const observerHandler = new (require('./observers/_observerHandler.js'))();
const Ignore = require('./commands/admin/ignore.js');

// Preload the observerHandler and commandHandler
(async () => {
  await commandHandler.init()
  await observerHandler.init()
})();

// Initiate the bot and the observers
const bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

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

bot.addListener("message", function(_from, to, text, msg) {
  console.log(` <- [${to}] ${_from}: ${text}`)
  // console.log(  "[" + to + "] " + _from + ": " + text)

  try {
    if (!Ignore.isIgnored(_from)) {  
      if (text[0] === '!') {
        // Delegate explicit commands starting with a !bang to the handler
        commandHandler.route(bot, _from, to, text, msg)
      }
      // Delegate observables (keywords, mentions, etc) to the handler
      observerHandler.route(bot, _from, to, text, msg)
    }
  } catch (e) {
    console.error(e)
    bot.say(to, 'Something went wrong, check !logs for more info')
  }

})

bot.addListener("error", function(err) {
  console.error("[ERROR] ", err)
})

