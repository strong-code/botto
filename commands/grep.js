var sys = require('sys');
var exec = require('child_process').exec;
var _ = require('lodash');
var logPath = '~/irclogs/Rizon';

module.exports = {

  call: function (opts, respond) {
    if (opts.args.length < 1) {
      return respond('You must provide a query to grep')
    } else {
      var query = _.join(opts.args, " ");
      return module.exports.grep(query, opts.to, respond);
    }
  },

  grep: function (query, channel, respond) {
    var path = logPath + "/" + channel;
    var cmd = "grep -R \"" + query + "\" " + path + " | nc termbin.com 9999";
    return exec(cmd, function (err, stdout, stderr) {
      if (err) {
        return respond('[ERROR]: ' + err);
      }
      if (stdout === '') {
        return respond('No results found');
      }
      return respond('Search results: ' + stdout);
    });
  },

};
