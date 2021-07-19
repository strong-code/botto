const _config = require('./config.js').core;
const config = (process.argv[2] === 'test' ? _config.test : _config.default);
const fs = require('fs');
const irc = require('irc');
const commandHandler = new (require('./commands/_commandHandler.js'))();
const observerHandler = new (require('./observers/_observerHandler.js'))();
const Ignore = require('./commands/admin/ignore.js');
const _ = require('lodash');

// Preload the observerHandler and commandHandler
(async () => {
  await commandHandler.init()
  await observerHandler.init()
})();

// Initiate the bot and the observers
const bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

if (config.debug) {
  const chans = _.join(config.channels, ', ');
  console.log('Starting ' + config.botName + ' and joining: ' + chans);
  bot.addListener("message", function(_from, to, text, message) {
    console.log("[" + to + "] " + _from + ": " + text);
  });
}

bot.addListener("message", function(_from, to, text, msg) {
  try {
    if (!Ignore.isIgnored(_from)) {  
      if (text[0] === '!') {
        // Delegate explicit commands starting with a !bang to the handler
        commandHandler.route(bot, _from, to, text, msg);
      }
      // Delegate observables (keywords, mentions, etc) to the handler
      observerHandler.route(bot, _from, to, text, msg);
    }
  } catch (e) {
    console.log(e);
    bot.say(to, 'Something went wrong, check !logs for more info');
  }
});

bot.addListener("error", function(err) {
  console.log("[ERROR] ", err);
});

