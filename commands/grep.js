var sys = require('sys');
var exec = require('child_process').exec;
var logPath = '~/irclogs/Rizon';

module.exports = {

  call: function (opts, respond) {
    if (opts.args.length < 1) {
      return responsd('You must provide a query to grep')
    } else {
      var query = _.join(opts.args);
      return respond(grep(query));
    }
  },

  grep: function (query, channel) {
    var path = logPath + "/" + channel;
    return exec("grep -R \"" + query + "\" " + path, function (err, stdout, stderr) {
      if (err) {
        return err;
      }
      return module.exports.upload(stdout);
    })
  },

  upload: function (results) {
    // TODO figure out the best way to paste & serve
  }

};
