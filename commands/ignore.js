var db = require('../core/_db.js');
var admin = require('../core/admin.js');
var _  = require('lodash');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] == 'add') {
      return module.exports.ignoreUser(opts.args[1], opts.args[2], opts.from, opts.to, respond);
    } else if (opts.args[0] == 'del') {
      return module.exports.unignoreUser(opts.from, opts.args[1], opts.to, respond);
    } else if (opts.args[0] == 'check') {
      return module.exports.isIgnored(opts.args[1], respond);
    } else if (opts.args[0] == 'list') {
      return module.exports.listIgnored(respond);
    } else {
      return respond("Syntax is !ignore <add | del | check> <user> <host>");
   }
  },

  listIgnored: function(respond) {
    return db.executeQuery({
      text: "SELECT nick FROM ignored_users"
    }, function (result) {
      var ignoredUsers = _.map(result.rows, function (row) {
        return row['nick'];
      });
      return respond("Currently ignored users: " + _.join(ignoredUsers, ', '));
    });
  },

  ignoreUser: function(nick, host, requester, channel, respond) {
    if (!admin.isAdmin(requester, channel)) {
      return;
    } else {
      db.executeQuery({
        text: "INSERT INTO ignored_users (nick, host, banned_by, date_added) VALUES ($1, $2, $3, $4)",
        values: [nick, host, requester, new Date().toISOString()]
      }, function() {
        respond("Ignoring user: " + nick + ". Bot privilege has been revoked");
      });
    }
  },

  unignoreUser: function(requester, nick, channel, respond) {
    if (!admin.isAdmin(requester, channel)) {
      return;
    } else {
      db.executeQuery({
        text: "DELETE FROM ignored_users WHERE nick = $1",
        values: [nick]
      }, function(result) {
        respond("No longer ignoring user: " + nick + ". Please be better behaved from now on.");
      });
    }
  },

  // Lookup if a user (by nick) is ignored. Not meant for programmatic use.
  isIgnored: function(nick, respond) {
    module.exports._isIgnoredBool(nick, 'null', function (ignored) {
      if (ignored) {
        respond('User ' + nick + ' is currently ignored');
      } else {
        respond('User ' + nick + ' is NOT currently ignored');
      }
    });
  },

  // Used to check if an incoming message is from an ignored user
  _isIgnoredBool: function (nick, host, cb) {
    db.executeQuery({
      text: "SELECT * FROM ignored_users WHERE nick = $1 OR host = $2",
      values: [nick, host]
    }, function (result) {
      var userData = result.rows[0];
      if (userData && (userData['nick'] === nick || userData['host'] === host)) {
        cb(true);
      } else {
        cb(false);
      }
    });
  }

};
