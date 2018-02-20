const db = require('../core/_db.js')
const admin = require('../core/admin.js')

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] == 'delete' && admin.isAdmin(opts.from, opts.to)) {
      return module.exports.deleteShoutsForNick(opts.args[1], respond)
    }
    if (opts.args[0].length) {
      return module.exports.getShoutForNick(opts.args[0], respond);
    } else {
      return module.exports.getShout(respond);
    }
  },

  getShout: function(respond) {
    return db.executeQuery(
      "SELECT * FROM shouts ORDER BY RANDOM() LIMIT 1", function (result) {
        if (result.rows && result.rows[0]) {
          return respond(result.rows[0]['message']);
        }
    });
  },

  getShoutForNick: function(nick, respond) {
    return db.executeQuery({
      text: "SELECT * FROM shouts WHERE nick = $1 ORDER BY RANDOM() LIMIT 1",
      values: [nick]
    }, function (result) {
      if (result.rows && result.rows[0]) {
        return respond(result.rows[0]['message']);
      }
    });
  },

  deleteShoutsForNick(nick, respond) {
    return db.executeQuery({
      text: "DELETE FROM shouts WHERE NICK = $1",
      values: [nick]
    }, (result) => {
      if (result.rows && result.rows[0]) {
        return respond(result.rows[0]['message'])
      }
    })
  }
}
