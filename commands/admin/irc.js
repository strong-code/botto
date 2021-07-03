const Command = require('../command.js')

module.exports = class Irc extends Command {

  constructor() {
    super('irc')
  }

  call(bot, opts) {
    if (opts.args) {
      switch (opts.args[0]) {
        case 'nick':
          return this.nick(bot, opts)
        case 'join':
          return this.join(bot, opts)
        case 'part':
          return this.part(bot, opts)
        case 'say':
          return this.say(bot, opts)
        case 'action':
          return this.action(bot, opts)
        case 'notice':
          return this.notice(bot, opts)
        case 'ctcp':
          return this.ctcp(bot, opts)
        case 'cycle':
          return this.cycle(bot, opts)
        case 'raw':
          return this.raw(bot, opts)
        default:
          return bot.say(opts.to, `No IRC action for ${opts.args[0]}`)
      }
    }
  }

  nick(bot, opts) {
    var nick = opts.args[1];
    if (nick) {
      return bot.send('raw NICK ' + nick);
    } else {
      return bot.say(opts.to, "No nick specified");
    }
  }

  join(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      return bot.join(chan)
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  }

  part(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      var msg = opts.args.length > 2 ? opts.args.slice(2).join(' ') : "cya nerds";
      return bot.part(chan, msg);
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  }

  say(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.say(receiver, message);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc say <receiver> <message>");
    }
  }

  action(bot, opts) {
    var receiver = opts.args[1];
    var action = opts.args.slice(2).join(' ');

    if (receiver && action) {
      return bot.action(receiver, action);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc action <receiver> <message>");
    }
  }

  notice(bot, opts) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.notice(receiver, message);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc notice <receiver> <message>");
    }
  }

  ctcp(bot, opts) {
    var receiver = opts.args[1];
    var type = opts.args[2];
    var text = opts.args.slice(3).join(' ');

    if (receiver && type) {
      return bot.ctcp(receiver, type, text);
    } else {
      return bot.say(opts.to, "Not enough parameters specified. Usage is !irc ctcp <receiver> <message>");
    }
  }

  cycle(bot, opts) {
    var chan = opts.args[1];

    if (chan) {
      return bot.part(chan);
      return bot.join(chan);
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  }

  raw(bot, opts) {
    if (opts.args[1]) {
      return bot.send(opts.args.join(' '));
    } else {
      return bot.say(opts.to, "No channel specified");
    }
  }

};
