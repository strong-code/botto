const apiKey = require('../config.js').lastfm.apiKey;
const needle = require('needle');
const _      = require('lodash');
const db     = require ('../core/_db.js');

module.exports = {
  
  call: function(opts, respond) {
    if (opts.args[0] == 'add') {
      return module.exports.registerUser(opts.args[1], opts.from, respond);
    } else {
      return module.exports.nowPlaying(opts.from, respond);
    }
  },

  nowPlaying: function(ircNick, respond) {
    return module.exports.getUser(ircNick, (err, username) => {
      if (err) {
        return respond('No last.fm username registered for ' + ircNick + '. Use !np add <username> to register');
      }
      const url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + ' +&format=json&nowplaying=true';
      needle.get(url, options, (err, response) => {
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
    });
  },

  registerUser: function(lastFmNick, ircNick, respond) {
    return db.executeQuery({
      text: "INSERT INTO last_fm_users (last_fm_username, irc_nick, created_at) VALUES ($1, $2, $3)",
      values: [lastFmNick, ircNick, new Date().toISOString()]
    }, () => {
      return respond('Registered ' + lastFmNick);
    });
  },

  getUser: function(username, cb) {
    return db.executeQuery({
      text: "SELECT last_fm_username FROM last_fm_users WHERE irc_nick = $1",
      values: [username]
    }, (result) => {
      let err, nick;
      if (!result || !result.rows[0]) {
        err = {message: 'No such user'};
      } else {
        nick = result.rows[0]['last_fm_username'];
      }
      cb(err, nick);
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
