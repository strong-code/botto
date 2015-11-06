var Twitter = require('twit');
var config = require('../config.js').twitter;

module.exports = function(opts, respond) {
  if (opts.args[0] == 'search') {
     respond("search!");
  } else {
    tweetByUser(opts.args[0], opts.args[1], respond);
  }
};

var client = new Twitter(config);

function tweetByUser(user, index, respond) {
  if (index == 'random') {
    index = Math.floor(Math.random() * 100 + 1);
  } else {
    index = typeof index !== 'undefined' ? index : 1;
  }

  if (typeof user == 'undefined') {
    respond("No username supplied. Syntax is !twitter <username> <[optional] number of tweets>");
  }

  var options = { screen_name: user, count: index, trim_user: true };

  client.get('statuses/user_timeline', options, function(err, data, response) {
    if (err) {
      console.log(err);
      respond("[" + response.statusCode + "] " + err.message);
    } else {
      var bound = Math.floor(Math.random() * data.length + 1);
      try {
        var tweet = "[@" + options.screen_name + "] " + data[bound]["text"].replace(/[\r\n]/g, " ");
        respond(tweet);
      } catch (e) {
        respond("Error fetching tweets for @" + options.screen_name + "...");
      }
    }
  });
}
