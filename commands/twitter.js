var Twitter = require('twit');
var config = require('../config.js').twitter;
var client = new Twitter(config);

module.exports = {

  call: function(opts, respond) {
    module.exports.tweetByUser(opts.args[0], opts.args[1], respond);
  },

  tweetByUser: function(user, index, respond) {
    if (user == '') {
      respond("No username supplied. Syntax is !twitter <username> <[optional] number of tweet>");
      return;
    }

    var options = { screen_name: user, offset: module.exports.getOffset(index), trim_user: true };

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
  },

  /*
   * If second arg is an integer, attempt to retrieve that many tweets. If it is 'random'
   * then retrieve 100 latest tweets and select at random.
   */
  getOffset: function(index) {
    if (index == 'random') {
      return Math.floor(Math.random() * 20 + 0);
    } else {
      return typeof index !== 'undefined' ? index : 0;
    }
  }

};
