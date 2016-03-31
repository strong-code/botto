var exec = require('child_process').exec
/*
 * IRC-triggerable git commands for pulling in new changes
 */

module.exports = {

  call: function(bot, opts) {
    if (opts.args.length === 0) {
      return bot.say(opts.to, "Invalid usage. See !help")
    } else if (opts.args[0] === "pull") {
      return module.exports.pull(bot, opts)
    }
  },

  pull: function (bot, opts) {
    exec('git pull', function (err, stdout, stderr) {
      if (err) {
        return bot.say(opts.to, err.message + "; Check logs for more info");
      }

      return bot.say(opts.to, stdout);
    });
  }
};
