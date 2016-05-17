var db = require('../core/_db.js');
var admin = require('../core/admin.js');
var _ = require('lodash');

module.exports = {

  call: function (opts, respond) {
    if (opts.args[0] === 'add') {
      return module.exports.addReply(_.drop(opts.args), respond);
    } else if (opts.args[0] === 'remove' && admin.isAdmin(opts.from, opts.to)) {
      // return module.exports.removeReply(_.drop(opts.args), respond);
    }
  },

  addReply: function (opts, respond) {
    var args = _.join(opts.args, ' ');
    var data = _.split(args, ' <reply> ');
    var trigger = data[0];
    var reply = data[1];
    return db.executeQuery({
      text: 'INSERT INTO replies (added_by, trigger, reply, enabled, date_added) ' +
        'VALUES ($1, $2, $3, $4, $5)',
      values: [opts.from, trigger, reply, true, new Date().toISOString()]
    }, function () {
      return respond('Trigger added');
    });
  }

};
