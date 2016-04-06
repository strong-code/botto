var db = require('../core/_db.js');

module.exports = {

  call: function(opts, respond) {
    var forNick;
    if (opts.args[1]) {
      forNick = opts.args[1];
    }
    return module.exports.getShout(forNick, respond);
  },

  getShout: function(forNick, respond) {
    var queryText;
    if (typeof forNick !== undefined) {
      queryText = "SELECT * FROM shouts WHERE nick like '%$1%'";
    } else {
      queryText = "SELECT * FROM shouts ORDER BY RANDOM() LIMIT 1";
    }

    return db.executeQuery({
      text: queryText,
      values: [forNick]
    }, function (result) {
      if (result.rows && result.rows[0]) {
        return respond(result.rows[0]['message']);
      }
    });
  }
}
