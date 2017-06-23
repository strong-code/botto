var db = require('../core/_db.js');
var _  = require('lodash');

module.exports = {

  call: function (opts, respond) {
    if (opts.text === 'who said that') {
      if (module.exports.last) {
        return respond('This shitpost brought to you by ' + module.exports.last['added_by']);
      } else {
        return respond('who said what?');
      }
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

  last: undefined

};
