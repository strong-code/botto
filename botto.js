var config = require('./config.js').core;
var fs = require('fs');
var irc = require('irc');
var commandHandler = require('./commands/_commandHandler.js');
var observerHandler = require('./observers/_observerHandler.js')
var ignore = require('./commands/ignore.js');

/*
 * Initiate the bot and the observers
 */
var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

if (config.debug) {
  bot.addListener("message", function(_from, to, text, message) {
    console.log("[" + to + "] " + _from + ": " + text);
  });
}

// Register all our message listeners (either observers or commands)
bot.addListener("message", function(_from, to, text, msg) {

  ignore._isIgnoredBool(_from, msg.host, function(ignored) {
    if (!ignored) {
      // Delegate explicit commands starting with a !bang to the handler
    	commandHandler.route(bot, _from, to, text, msg);
    	// Delegate observables (keywords, mentions, etc) to the handler
    	observerHandler.route(bot, _from, to, text, msg);
    }
  });

});

bot.addListener("error", function(error) {
  console.log("[ERROR] ", error);
});
