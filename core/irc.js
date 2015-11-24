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
    var chan = opts.args[1];

    if (chan) {
      bot.join(chan)
    } else {
      bot.say(opts.to, "No channel specified");
    }
  },

  part: function(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      var msg = opts.args.length > 2 ? opts.args.slice(2).join(' ') : "cya nerds";
      bot.part(chan, msg);
    } else {
      bot.say(opts.to, "No channel specified");
    }
  },

  say: function(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args[2],join(' ');

    if (receiver && message) {
      bot.say(receiver, message);
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc say <receiver> <message>");
    }
  },

  action: function(bot, opts) {
    var receiver = opts.args[1];
    var action = opts.args[2],join(' ');

    if (receiver && action) {
      bot.action(receiver, action);
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc action <receiver> <message>");
    }
  },

  notice: function(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      bot.notice(receiver, message);
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc notice <receiver> <message>");
    }
  },

  ctcp: function(bot, opts) {
    var receiver = opts.args[1];
    var type = opts.args[2];
    var text = opts.args.slice(3).join(' ');

    if (receiver && type) {
      bot.ctcp(receiver, type, text);
    } else {
      bot.say(opts.to, "Not enough parameters specified. Usage is !irc ctcp <receiver> <message>");
    }
  },

  cycle: function(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      bot.part(chan);
      bot.join(chan);
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
