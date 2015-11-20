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
        case 'action':
          module.exports.action(bot, opts);
          break;
        case 'notice':
          module.exports.notice(bot, opts);
          break;
        case 'ctcp':
          module.exports.ctcp(bot, opts);
          break;
        case 'cycle':
          module.exports.cycle(bot, opts);
          break;
        case 'raw':
          module.exports.raw(bot, opts);
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
      var msg = opts.args.length > 2 ? opts.args.slice(2).join(' ') : "cya nerds";
      bot.part(opts.args[1], msg);
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
  },

  action: function(bot, opts) {
    if (opts.args[1] && opts.args[2]) {
      bot.action(opts.args[1], opts.args.slice(2).join(' '));
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc action <receiver> <message>");
    }
  },

  notice: function(bot, opts) {
    if (opts.args[1] && opts.args[2]) {
      bot.notice(opts.args[1], opts.args.slice(2).join(' '));
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc notice <receiver> <message>");
    }
  },

  ctcp: function(bot, opts) {
    if (opts.args[1] && opts.args[2]) {
      bot.ctcp(opts.args[1], opts.args.slice(2).join(' '));
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc ctcp <receiver> <message>");
    }
  },

  cycle: function(bot, opts) {
    if (opts.args[1]) {
      bot.part(opts.args[1]);
      bot.join(opts.args[1]);
    } else {
      bot.say(opts.to, "No channel specified");
    }
  },

  raw: function(bot, opts) {
    if (opts.args[1]) {
      bot.send(opts.args.join(' '));
    } else {
      bot.say(opts.to, "No channel specified");
    }
  }

};
