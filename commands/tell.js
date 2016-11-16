const db = require('../core/_db.js');
const _  = require('lodash');

module.exports = {

  call: function(opts, respond) {
    if (!opts.args[0] || !opts.args[1]) {
      return respond('Usage is !tell <nick> <message>');
    }
    const receiver = opts.args[0];
    const msg      = _.join(_.drop(opts.args), ' ');
    return module.exports.saveMessage(opts.to, opts.from, receiver, msg, respond);
  },

  saveMessage: function(chan, sender, receiver, msg, respond) {
    return db.executeQuery({
      text: 'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      values: [chan, sender, receiver, msg, new Date().toISOString()]
    }, () => {
      return respond('Message saved. I will tell ' + receiver + ' next time they are around.');
    });
  }

};
