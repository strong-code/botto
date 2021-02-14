const db = require('../core/_db.js');
const _  = require('lodash');
const addTell = require('../observers/tell').addTell;

module.exports = {

  call: function(opts, respond) {
    const receiver = opts.args.shift()
    const msg      = opts.args.join(' ')

    if (msg && receiver) {
      return module.exports.saveMessage(opts.to, opts.from, receiver, msg, respond)
    } else {
      return respond('Usage is !tell <nick> <message>')
    }
  },

  saveMessage: function(chan, sender, receiver, msg, respond) {
    module.exports.toCache(chan, sender, receiver, msg);
    module.exports.toDisk(chan, sender, receiver, msg);
    return respond('Message saved. I will tell ' + receiver + ' next time they are around.');
  },

  toCache: function(chan, sender, receiver, msg) {
    addTell(receiver, { chan: chan, sender: sender, msg: msg })
  },

  toDisk: function(chan, sender, receiver, msg) {
    return db.executeQuery({
      text: 'INSERT INTO tells (chan, sender, receiver, message, created_at) VALUES ($1, $2, $3, $4, $5)',
      values: [chan, sender, receiver, msg, new Date().toISOString()]
    }, () => {
      console.log('message saved to disk');
    });
  }

};
