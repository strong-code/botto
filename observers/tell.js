const db = require('../core/_db.js');
const _  = require('lodash');
const msgCache = {};

(function () {
  return db.executeQuery('SELECT * FROM tells WHERE sent = false', res => {
    if (res.rows && res.rows[0]) {
      _.forEach(res.rows, (row) => {
        msgCache[row['receiver']] = {
          chan: row['chan'], 
          sender: row['sender'], 
          receiver: row['receiver'], 
          msg: row['message']
        } 
      })
    }
    console.log(`Tell message cache warmed with ${res.rows.length} tells`)
  })
})()

module.exports = {

  call: function(opts, respond) {
    if (_.includes(_.keys(msgCache), opts.from)) {
      return module.exports.sendMessage(opts.from, opts.to, respond);
    }
  },

  msgCache: msgCache,

  sendMessage: function(receiver, chan, respond) {
    const msg = msgCache[receiver];
    delete msgCache[receiver];
    return module.exports.markSent(receiver, msg.msg, () => {
      return respond(receiver + ', ' + msg.sender + ' says: ' + msg.msg);
    });
  },

  markSent: function(receiver, msg, cb) {
    return db.executeQuery({
      text: 'UPDATE tells SET sent = true WHERE receiver = $1 AND message = $2',
      values: [receiver, msg]
    }, () => {
      console.log('Tell marked as sent');
      return cb();
    });
  }
};
