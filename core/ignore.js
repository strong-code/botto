const db = require('./_db.js');
const admin = require('./admin.js');
const _  = require('lodash');

module.exports = {

  call: function (bot, opts) {
    if (!admin.isAdmin(opts.from)) {
      return;
    }

    const command = opts.args[0];

    if (command === 'add') {
      return module.exports.ignoreUser(bot, opts.from, opts.args[1], opts.to);
    } else if (command === 'list') {
      return module.exports.listIgnored(bot, opts.to);
    } else if (command === 'del') {
      return module.exports.unignoreUser(bot, opts.args[1], opts.to);
    } else if (command === 'check') {
      return module.exports.isIgnored(bot, opts.args[1], opts.to);
    }
  },

  listIgnored: function(bot, chan) {
    return db.executeQuery({
      text: 'SELECT nick FROM ignored_users'
    }, function (result) {
      const ignoredUsers = _.map(result.rows, function (row) {
        return row['nick'];
      });
      return bot.say(chan, 'BAD USERS LIST: ' + _.join(ignoredUsers, ', '));
    });
  },

  ignoreUser: function (bot, requester, target, chan) {
    return bot.whois(target, (data) => {
      return db.executeQuery({
        text: 'INSERT INTO ignored_users (nick, host, banned_by, date_added) VALUES ($1, $2, $3, $4)',
        values: [target, data.host, requester, new Date().toISOString()]
      }, () => {
        return bot.say(chan, 'Ignoring user: ' + target + '. Bot privilege has been revoked');
      });
    });
  },

  unignoreUser: function(bot, target, chan) {
    return module.exports._isIgnoredBool(target, 'null', (ignored) => {
      if (!ignored) {
        return bot.say(chan, 'I am not currently ignoring ' + target);
      }

      return db.executeQuery({
        text: 'DELETE FROM ignored_users WHERE nick = $1',
        values: [target]
      }, (result) => {
        return bot.say(chan, 'No longer ignoring user: ' + target + '. Please be better behaved from now on.');
      });
    });
  },

  // Lookup if a user (by nick) is ignored. Not meant for programmatic use.
  isIgnored: function(bot, nick, chan) {
    module.exports._isIgnoredBool(nick, 'null', (ignored) => {
      if (ignored) {
        return bot.say(chan, 'User ' + nick + ' is currently ignored');
      } else {
        return bot.say(chan, 'User ' + nick + ' is NOT currently ignored');
      }
    });
  },

  // Used to check if an incoming message is from an ignored user
  _isIgnoredBool: function (nick, host, cb) {
    db.executeQuery({
      text: 'SELECT * FROM ignored_users WHERE nick = $1 OR host = $2',
      values: [nick, host]
    }, (result) => {
      var userData = result.rows[0];
      if (userData && (userData['nick'] === nick || userData['host'] === host)) {
        cb(true);
      } else {
        cb(false);
      }
    });
  }

};
