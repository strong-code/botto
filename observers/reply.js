var db = require('../util/db.js')
var _  = require('lodash');

module.exports = {

  call: function (opts, respond) {
    if (opts.text === 'who added that') {
      return module.exports.who(respond);
    } else {
      db.executeQuery({
        text: 'SELECT * FROM replies WHERE trigger=$1 ORDER BY RANDOM() LIMIT 1',
        values: [opts.text]
      }, function (result) {
        if (result.rows[0] && result.rows[0]['enabled'] === true) {
          module.exports.last = result.rows[0];
          return respond(result.rows[0]['reply']);
        }
      });
    }
  },

  who: function(respond) {
    if (module.exports.last) {
      return respond('This shitpost brought to you by ' + module.exports.last['added_by']);
    } else {
      return respond('who said what?');
    }
  },

  lastReply: undefined

};
