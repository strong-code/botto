var sys = require('sys');
var exec = require('child_process').exec;
var _ = require('lodash');
var logPath = '~/irclogs/Rizon';

module.exports = {

  call: function (opts, respond) {
    if (opts.args.length < 1) {
      return respond('You must provide a query to grep')
    } else {
      var query = _.join(opts.args, " ").replace(/[^a-z0-9\s+]+/gi, '');
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
      if (stdout === '' || stdout == 'Use netcat') {
        return respond('No results found');
      }
      return respond('Search results: ' + stdout);
    });
  },

};
