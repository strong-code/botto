var db = require('../core/_db.js');
var admin = require('../core/admin.js');
var _ = require('lodash');
var lastReply = require('../observers/reply.js').last;
var sys = require('sys');
var exec = require('child_process').exec;

module.exports = {

  call: function (opts, respond) {
    if (opts.args[0] === 'add') {
      return module.exports.addReply(_.drop(opts.args), opts.from, respond);
    } else if (opts.args[0] === 'stop' && admin.isAdmin(opts.from, opts.to)) {
      return module.exports.disable(respond);
    } else if (_.join(opts.args, ' ') === 'list disabled') {
      return module.exports.list(respond, false);
    } else if (_.join(opts.args, ' ') === 'list enabled') {
      return module.exports.list(respond, true);
    }
  },

  addReply: function (opts, nick, respond) {
    var args    = _.join(opts, ' ');
    var data    = _.split(args, ' <reply> ');
    var trigger = data[0];
    var reply   = data[1];

    return db.executeQuery({
      text: 'INSERT INTO replies (added_by, trigger, reply, enabled, date_added) ' +
        'VALUES ($1, $2, $3, $4, $5)',
      values: [nick, trigger, reply, true, new Date().toISOString()]
    }, function (res, err) {
      if (err) {
        return respond(err.message)
      }
      return respond('Trigger added');
    });
  },

  disable: function (respond) {
    if (lastReply === undefined) {
      return respond('I\'m not sure what the last reply was');
    } else {
      return db.executeQuery({
        text: 'UPDATE replies SET enabled = false WHERE id=$1',
        values: [lastReply['id']]
      }, function (res) {
        return respond('Trigger disabled');
      });
    }
  },

  list: function (respond, enabled) {
    return db.executeQuery({
      text: 'SELECT added_by AS creator, trigger, reply AS response FROM replies WHERE enabled=$1',
      values: [enabled]
    }, function (result) {
      if (result.rows.length > 0) {
        var response = (enabled ? 'CURRENTLY ENABLED TRIGGERS' : 'CURRENTLY DISABLED TRIGGERS');
        var response = response + '\nTRIGGER | RESPONSE';
         _.each(result.rows, function (row) {
          response = response + '\n' + row.trigger + ' | ' + row.response + ' (Added by ' + row.creator + ')';
        });
        var cmd = "echo \"" + response + "\"" + " | nc termbin.com 9999";

        return exec(cmd, function (err, stdout, stderr) {
          if (err || stdout === 'User netcat.') {
            return respond('Something went wrong');
          }
          return respond(stdout);
        });
      }
    });
  }

};
