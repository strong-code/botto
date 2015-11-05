var Twitter = require('twit');
var config = require('../config.js').twitter;

module.exports = function(opts, respond) {
  if (opts.args[0] == 'search') {
     respond("search!");
  } else {
    latestTweetsFromUser(opts.args[0], opts.args[1], respond);
  }
};

var client = new Twitter(config);

function latestTweetsFromUser(user, numTweets, respond) {
  numTweets = typeof numTweets !== 'undefined' ? numTweets : 1;


  if (typeof user == 'undefined') {
    respond("No username supplied. Syntax is !twitter <username> <[optional] number of tweets>");
  }

  var options = { screen_name: user, count: numTweets, trim_user: true };

  client.get('statuses/user_timeline', { options }, function(err, data, response) {
    if (err) {
      return(respond("[" + response.statusCode + "] " + err.message));
    }

    console.log(response);

  });
}
