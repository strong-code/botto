var db = require('../core/_db.js');

module.exports = function(opts, respond) {

  if (opts.text == opts.text.toUpperCase()) {
    storeShout(opts);
    getShout(respond);
  }

  // Store an all-upcase quote in the `shouts` table
  function storeShout(opts) {
    db.executeQuery({
      text: "INSERT INTO shouts (nick, chan, message, date_spoken) VALUES ($1, $2, $3, $4)",
      values: [opts.from, opts.to, opts.text, new Date().toISOString()]
    }, function() {
      console.log("[" + opts.to + "] Shout quote from " + opts.from + " stored.");
    });
  }

  // Retrieve a random all-upcase quote from the `shouts` table
  function getShout(respond) {
    db.executeQuery('SELECT * FROM shouts ORDER BY RANDOM() LIMIT 1', function(result) {
      respond(result.rows[0]['message']);
    });
  }

};
