const db = require('../core/_db.js');
const _  = require('lodash');
const msgCache = require('../observers/tell').msgCache;

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
    module.exports.toCache(chan, sender, receiver, msg);
    module.exports.toDisk(chan, sender, receiver, msg);
    return respond('Message saved. I will tell ' + receiver + ' next time they are around.');
  },

  toCache: function(chan, sender, receiver, msg) {
    msgCache[receiver] = {chan: chan, sender: sender, msg: msg};
  },

  toDisk: function(chan, sender, receiver, msg) {
    return db.executeQuery({
      text: 'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      values: [chan, sender, receiver, msg, new Date().toISOString()]
    }, () => {
      console.log('message saved to disk');
      //return respond('Message saved. I will tell ' + receiver + ' next time they are around.');
    });
  }

};
