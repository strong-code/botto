var db = require('../core/_db.js');
var admin = require('../core/admin.js');

module.exports = {

  call: function(opts, respond) {
    if (opts.args.length < 2) {
      return respond("Syntax is !ignore <add | del | check> <user> <host>");
    }

    if (opts.args[0] == 'add') {
      module.exports.ignoreUser(opts.args[1], opts.args[2], opts.from, opts.to, respond);
    } else if (opts.args[0] == 'del') {
      module.exports.unignoreUser(opts.args[1], respond);
    } else if (opts.args[0] == 'check') {
      module.exports.isIgnored(opts.args[1], opts.args[2], respond);
    }
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

  unignoreUser: function(nick, channel, respond) {
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

  isIgnored: function(nick, host, respond) {
    db.executeQuery({
      text: "SELECT * FROM ignored_users WHERE nick = $1 OR host = $2",
      values: [nick, host]
    }, function (result) {
      if (result.rows[0] && result.rows[0]['nick'] === nick) {
        cb(true);
      } else {
        cb (false);
      }
    });
  },

  // isIgnoredNick: function(nick, cb) {
  //   db.executeQuery({
  //     text: "SELECT * FROM ignored_users WHERE nick = $1",
  //     values: [nick]
  //   }, function(result) {
  //     if (result.rows[0] && result.rows[0]['nick'] == nick) {
  //       cb(true);
  //     } else {
  //       cb(false);
  //     }
  //   });
  // },
  //
  // isIgnoredHost: function(host, cb) {
  //   db.executeQuery({
  //     text: "SELECT * FROM ignored_users WHERE host = $1",
  //     values: [host]
  //   }, function(result) {
  //     if (result.rows[0] && result.rows[0]['host'] == host) {
  //       cb(true);
  //     } else {
  //       cb(false);
  //     }
  //   });
  // }

};
