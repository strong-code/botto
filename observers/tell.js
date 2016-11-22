const db = require('../core/_db.js');
const _  = require('lodash');
let nickCache = [];

module.exports = {

  call: function(opts, respond) {
    if (_.includes(nickCache, opts.from)) {
      return module.exports.sendMessage(opts.from, opts.to, respond);
    }
  },

  sendMessage: function(receiver, chan, respond) {
    return db.executeQuery({
      text: 'SELECT * FROM tells WHERE receiver = $1 AND chan = $2 AND sent = false',
      values: [receiver, chan]
    }, (result) => {
      if (result.rows) {
        _.map(result.rows, (row) => {
          let msg = receiver + ', ' + row['sender'] + ' says: ' + row['message'];
          respond(msg);
          return module.exports.markSent(row['id']);
        });
      }
    });
  },

  markSent: function(rowId) {
    return db.executeQuery({
      text: 'UPDATE tells SET sent = true WHERE id = $1',
      values: [rowId]
    }, () => {
      return console.log(rowId + ' tell marked as sent');
    });
  }
};

setInterval(() => {
  return db.executeQuery({
    text: 'SELECT receiver FROM tells WHERE sent = false',
  }, (result) => {
    if (result.rows) {
      nickCache = _.map(result.rows, (row) => {
        return row['receiver'];
      });
    }
  });
}, 5000); //Every 30 seconds
