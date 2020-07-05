const db = require('../core/_db.js');
const _  = require('lodash');
const msgCache = {};

(function () {
  return db.executeQuery('SELECT * FROM tells WHERE sent = false', res => {
    if (res.rows && res.rows[0]) {
      _.forEach(res.rows, (row) => {
        let tell = { chan: row['chan'], sender: row['sender'], msg: row['message'] }
        module.exports.addTell(row['receiver'], tell)
      })
    }
    console.log(`Tell message cache warmed with ${res.rows.length} tells`)
  })
})()

module.exports = {

  call: function(opts, respond) {
    const receiver = opts.from

    if (_.includes(_.keys(msgCache), receiver)) {
      console.log(`Sending ${msgCache[receiver].length} tells to ${receiver}`)
      _.forEach(msgCache[receiver], (tell) => {
        module.exports.sendMessage(receiver, tell, (info) => respond(info))
      })
    }
  },

  // key: receiver nick
  // value: array of tell objects
  // msgCache[receiver] = [ { chan, sender, message } ]
  addTell: function(receiver, tell) {
    if (msgCache[receiver]) {
      msgCache[receiver].push(tell)
    } else {
      msgCache[receiver] = [tell]
    }
  },

  msgCache: msgCache,

  sendMessage: function(receiver, tell, cb) {
    module.exports.markSent(receiver, tell.msg, () => {
      return cb(receiver + ', ' + tell.sender + ' says: ' + tell.msg);
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
