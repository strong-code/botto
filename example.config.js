exports.core = {
	channels: ["#channel"],
	server: "server.address.here",
	botName: "ABotName",
  password: "BotPassword",
  debug: false
};

exports.admin = {
	"#channel": ["AdminUsername"]
}

// Holy shit why does this library use snake_case for variable names
exports.twitter = {
	consumer_key: "",
	consumer_secret: "",
	app_only_auth: true
}
