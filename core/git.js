const exec = require('child_process').exec
/*
 * IRC-triggerable git commands for pulling in new changes
 */

module.exports = {

  call: function(bot, opts) {
    const cmd = opts.args[0]

    if (!cmd) {
      return bot.say(opts.to, 'Must provide a command');
    } else if (cmd === "pull") {
      return module.exports.pull(bot, opts);
    } else if (cmd === "status") {
      return module.exports.status(bot, opts);
    }
  },

  pull: function (bot, opts) {
    exec('git pull', function (err, stdout, stderr) {
      if (err) {
        return bot.say(opts.to, err.message + "; Check logs for more info");
      }
      return bot.say(opts.to, stdout);
    });
  },

  status: function (bot, opts) {
    exec('git status -sb', function (err, stdout, stderr) {
      if (err) {
        return bot.say(opts.to, err.message + "; Check logs for more info");
      }

      return bot.say(opts.to, stdout);
    });
  }
};
