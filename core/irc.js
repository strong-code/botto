var admins = require('./admin.js');

module.exports = {

  // Routing logic
  call: function(bot, opts) {
    if (opts.args) {
      switch (opts.args[0]) {
        case 'join':
          module.exports.join(bot, opts);
          break;
        case 'part':
          module.exports.part(bot, opts);
          break;
        case 'say':
          module.exports.say(bot, opts);
          break;
      }
    }
  },

  join: function(bot, opts) {
    if (opts.args[1]) {
      bot.join(opts.args[1])
    } else {
      bot.say(opts.to, "No channel specified");
    }
  },

  part: function(bot, opts) {
    if (opts.args[1]) {
      bot.part(opts.args[1]);
    } else {
      bot.say(opts.to, "No channel specified");
    }
  },

  say: function(bot, opts) {
    if (opts.args[1] && opts.args[2]) {
      bot.say(opts.args[1], opts.args.slice(2).join(' '));
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc say <receiver> <message>");
    }
  }

};
