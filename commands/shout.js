var db = require('../core/_db.js');

module.exports = {

  call: function(opts, respond) {
    var forNick;
    if (opts.args[0]) {
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
      text: "SELECT * FROM shouts WHERE nick like '%$1%'",
      values: [nick]
    }, function (result) {
      if (result.rows && result.rows[0]) {
        return respond(result.rows[0]['message']);
      }
    });
  }
}
