var db = require('../core/_db.js');
var admin = require('../core/admin.js');

module.exports = {

  call: function(opts, respond) {
    if (opts.args.length != 2) {
      return respond("Syntax is !ignore <add | del | check> <user>");
    }

    if (opts.args[0] == 'add') {
      module.exports.ignoreUser(opts.args[1], opts.from, respond);
    } else if (opts.args[0] == 'del') {
      module.exports.unignoreUser(opts.args[1], respond);
    } else if (opts.args[0] == 'check') {
      module.exports.isIgnored(opts.args[1], respond);
    }
  },

  ignoreUser: function(user, requester, respond) {
    if (!admin.isAdmin(requester)) {
      return;
    }

    db.executeQuery({
      text: "INSERT INTO ignored_users (nick, banned_by, date_added) VALUES ($1, $2, $3)",
      values: [user, requester, new Date().toISOString()]
    }, function() {
      respond("Ignoring user: " + user + ". Bot privilege has been revoked");
    });
  },

  unignoreUser: function(user, respond) {
    if (!admin.isAdmin(requester)) {
      return;
    }

    db.executeQuery({
      text: "DELETE FROM ignored_users WHERE nick = $1",
      values: [user]
    }, function(result) {
      respond("No longer ignoring user: " + user + ". Please be better behaved from now on.");
    });
  },

  isIgnored: function(user, respond) {
    module.exports._isIgnored(user, function(ignored) {
      if (ignored) {
        respond(user + " is currently being ignored");
      } else {
        respond(user + " is not currently ignored");
      }
    })
  },

  _isIgnored: function(user, cb) {
    db.executeQuery({
      text: "SELECT * FROM ignored_users WHERE nick = $1",
      values: [user]
    }, function(result) {
      if (result.rows[0] && result.rows[0]['nick'] == user) {
        cb(true);
      } else {
        cb(false);
      }
    })
  }

};
