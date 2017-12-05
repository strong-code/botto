var db = require('../core/_db.js');

module.exports = {

  call: function(opts, respond) {
    if (opts.text == 'who said that' && lastShout) {
      return respond(lastShout['nick'] + " said that in " + lastShout['chan'] + " on " + lastShout['date_spoken'])
    }
    // Store only all uppercase quotes longer than 3 chars
    if (opts.text.length > 3 && opts.text == opts.text.toUpperCase()) {
      module.exports.storeShout(opts);
      module.exports.getShout(respond);
    }
  },

  lastShout: null,

  storeShout: function(opts) {
    db.executeQuery({
      text: "INSERT INTO shouts (nick, chan, message, date_spoken) VALUES ($1, $2, $3, $4)",
      values: [opts.from, opts.to, opts.text, new Date().toISOString()]
    }, function() {
      console.log("[" + opts.to + "] Shout quote from " + opts.from + " stored.");
    });
  },

  getShout: function(respond) {
    db.executeQuery('SELECT * FROM shouts ORDER BY RANDOM() LIMIT 1', function(result) {
      if (result.rows && result.rows[0]) {
        lastShout = result.rows[0];
        respond(result.rows[0]['message']);
      }
    });
  }
};
