// Create the configuration
var config = {
	channels: ["#bottotest"],
	server: "irc.rizon.net",
	botName: "botto"
};

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

bot.addListener("join", function(chan, who) {
  bot.say(chan, "welcome back " + who);
});
