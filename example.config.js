exports.core = {
	default: {
		channels: ["#channel"],
		server: "server.address.here",
		botName: "ABotName",
		password: "BotPassword",
		debug: false
	},
	test: {
		channels: ["#channel"],
		server: "server.address.here",
		botName: "ABotName",
		password: "BotPassword",
		debug: false
	}
};

exports.admin = {
	"#channel": ["AdminUsername"]
};

exports.globalAdmins = ['GlobalAdminUsername'];

exports.db = {
	username: 'postgres-username',
	password: 'postgres-password'
};

exports.weather = {
	apiKey: ""
};

exports.logs = {
  path: "/path/to/botto.log",
  api: "localhost:8080/api/paste"
}

exports.url = {
  // Global HTTP options
  options: {
    follow: 2,
    open_timeout: 4000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  },
  youtube: {
    apiKey: ""
  },
  reddit: {
    userAgent: "",
    clientId: "",
    clientSecret: "",
    username: "",
    password: ""
  },
  omdb: {
    apiKey: ""
  }
}

// Holy shit why does this library use snake_case for variable names
exports.twitter = {
	consumer_key: "",
	consumer_secret: "",
	access_token: "",
	access_token_secret: "",
	app_only_auth: false
};

exports.giphy = {
	apiKey: ""
};

exports.google = {
  cx: ""
};
