var config = require('./config').config
var fs = require('fs');
var irc = require('irc');
var commandHandler = require('./commands/_commandHandler.js');

/*
 * Initiate the bot and the observers
 */
var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

// Register all our message listeners (either observers or commands)
bot.addListener("message", function(from, to, text, msg) {

	// Log to stdout if we have debugging enabled
	if (config.debug) {
		console.log("[" + to + "] " + from + ": " + text);
	}

	// Handle commands starting with a !bang to the handler
	commandHandler(bot, from, to, text, msg);

	// Handle observables (keywords, mentions, etc) to the handler

});

bot.addListener("join", function(chan, who) {
  bot.say(chan, "welcome back " + who);
});
