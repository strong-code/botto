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
  if (user == '') {
    respond("No username supplied. Syntax is !twitter <username> <[optional] number of tweets>");
    return;
  }

  var options = { screen_name: user, offset: getOffset(index), trim_user: true };

  client.get('statuses/user_timeline', options, function(err, data, response) {
    if (err) {
      console.log(err);
      respond("[" + response.statusCode + "] " + err.message);
    } else {
      try {
        respond("[@" + options.screen_name + "] " + data[options.offset]["text"].replace(/[\r\n]/g, " "));
      } catch (e) {
        console.log(e);
        respond("Error fetching tweets for @" + options.screen_name + "...");
      }
    }
  });
}

/*
 * If second arg is an integer, attempt to retrieve that many tweets. If it is 'random'
 * then retrieve 100 latest tweets and select at random.
 */
function getOffset(index) {
  if (index == 'random') {
    return Math.floor(Math.random() * 20 + 0);
  } else {
    return typeof index !== 'undefined' ? index : 0;
  }
}
