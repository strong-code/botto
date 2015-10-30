var config = require("./config").config

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

if (config.debug) {
	bot.addListener("message", function(from, to, msg) {
		console.log("[" + to + "] " + from + ": " + msg);
	});
}

bot.addListener("join", function(chan, who) {
  bot.say(chan, "welcome back " + who);
});
