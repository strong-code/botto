const db = require('../core/_db.js');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0]) {
      return module.exports.showPoints(opts.args[0], respond);
    }
    return respond('Usage is !points <username>');
  },

  showPoints: function(nick, respond) {
    return db.executeQuery({
      text: 'SELECT score FROM points WHERE nick = $1',
      values: [nick]
    }, (result) => {
      if (result.rows && result.rows[0]) {
        return respond(nick + ' has ' + result.rows[0].score + ' points');
      }
      return respond(nick + ' has 0 points');
    });
  }

};
