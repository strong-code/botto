const apiKey = require('../config.js').lastfm.apiKey;
const needle = require('needle');
const _      = require('lodash');

module.exports = {
  
  call: function(opts, respond) {
    if (opts.args[0] == '') {
      respond('Usage is !np <username>');
    } else {
      const username = opts.args[0];
      respond(module.exports.nowPlaying(username, respond));
    }
  },

  nowPlaying: function(username, respond) {
    const url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + ' +&format=json&nowplaying=true';
    needle.get(url, options, function(err, response) {
      if (err) {
        console.error(err.message);
        return respond('Error fetching current track for user ' + username);
      }

      const nowPlaying = response.body['recenttracks']['track'][0];
      const artist     = nowPlaying['artist']['#text'];
      const track      = nowPlaying['name'];
      const album      = nowPlaying['album']['#text'];

      return respond(username + ' is listening to ' + track + ' by ' + artist + ' off of ' + album);
    });
  }
}

const options = {
  follow: 3,
  open_timeout: 20000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
