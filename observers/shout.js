const db = require('../core/_db.js');
const moment = require('moment');

module.exports = {

  call: function(opts, respond) {
    const last = module.exports.lastShout;
    if (opts.text == 'who said that' && last) {
      return respond(last['nick'] + " said that in " + last['chan'] + " on " + moment(last['date_spoken']).format("dddd, MMMM Do YYYY"))
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
    }, function(err) {
      if (err) {
        console.log(`Error storing shout quote: ${err.message}`)
      } else {
        console.log("[" + opts.to + "] Shout quote from " + opts.from + " stored.");
      }
    });
  },

  getShout: function(respond) {
    db.executeQuery('SELECT * FROM shouts ORDER BY RANDOM() LIMIT 1', function(result) {
      if (result.rows && result.rows[0]) {
        module.exports.lastShout = result.rows[0];
        respond(result.rows[0]['message']);
      }
    });
  }

}
