module.exports = {

  // Routing logic
  call: function(bot, opts) {
    if (opts.args) {
      let fn = module.exports[opts.args[0]];
      if (fn) {
        return fn(bot, opts);
      }
    }
  },

  nick: function(bot, opts) {
    var nick = opts.args[1];
    if (nick) {
      return bot.send('raw NICK ' + nick);
    } else {
      return bot.say(opts.to, "No nick specified");
    }
  },

  join: function(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      return bot.join(chan)
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  },

  part: function(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      var msg = opts.args.length > 2 ? opts.args.slice(2).join(' ') : "cya nerds";
      return bot.part(chan, msg);
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  },

  say: function(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.say(receiver, message);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc say <receiver> <message>");
    }
  },

  action: function(bot, opts) {
    var receiver = opts.args[1];
    var action = opts.args.slice(2).join(' ');

    if (receiver && action) {
      return bot.action(receiver, action);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc action <receiver> <message>");
    }
  },

  notice: function(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.notice(receiver, message);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc notice <receiver> <message>");
    }
  },

  ctcp: function(bot, opts) {
    var receiver = opts.args[1];
    var type = opts.args[2];
    var text = opts.args.slice(3).join(' ');

    if (receiver && type) {
      return bot.ctcp(receiver, type, text);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc ctcp <receiver> <message>");
    }
  },

  cycle: function(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      return bot.part(chan);
      return bot.join(chan);
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  },

  raw: function(bot, opts) {
    if (opts.args[1]) {
      return bot.send(opts.args.join(' '));
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  }

};
