const Command = require('../command.js')

module.exports = class Irc extends Command {

  constructor() {
    super('irc')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable) return

    if (opts.args) {
      switch (opts.args[0]) {
        case 'nick':
          return this.nick(bot, opts, respond)
        case 'join':
          return this.join(bot, opts, respond)
        case 'part':
          return this.part(bot, opts, respond)
        case 'say':
          return this.say(bot, opts, respond)
        case 'action':
          return this.action(bot, opts, respond)
        case 'notice':
          return this.notice(bot, opts, respond)
        case 'ctcp':
          return this.ctcp(bot, opts, respond)
        case 'cycle':
          return this.cycle(bot, opts, respond)
        case 'raw':
          return this.raw(bot, opts, respond)
        default:
          return respond(`No IRC action for '${opts.args[0]}'`)
      }
    }
  }

  nick(bot, opts, respond) {
    var nick = opts.args[1];
    if (nick) {
      return bot.send('raw NICK ' + nick);
    } else {
      return respond("No nick specified");
    }
  }

  join(bot, opts, respond) {
    var chan = opts.args[1];

    if (chan) {
      return bot.join(chan)
    } else {
      return respond("No channel specified");
    }
  }

  part(bot, opts, respond) {
    var chan = opts.args[1];

    if (chan) {
      var msg = opts.args.length > 2 ? opts.args.slice(2).join(' ') : "cya nerds";
      return bot.part(chan, msg);
    } else {
      return respond("No channel specified");
    }
  }

  say(bot, opts, respond) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.say(receiver, message);
    } else {
      return respond("Not enough parameters specified. Usage is !irc say <receiver> <message>");
    }
  }

  action(bot, opts, respond) {
    var receiver = opts.args[1];
    var action = opts.args.slice(2).join(' ');

    if (receiver && action) {
      return bot.action(receiver, action);
    } else {
      return respond("Not enough parameters specified. Usage is !irc action <receiver> <message>");
    }
  }

  notice(bot, opts, respond) {
    var receiver = opts.args[1];
    var message = opts.args.slice(2).join(' ');

    if (receiver && message) {
      return bot.notice(receiver, message);
    } else {
      return respond("Not enough parameters specified. Usage is !irc notice <receiver> <message>");
    }
  }

  ctcp(bot, opts, respond) {
    var receiver = opts.args[1];
    var type = opts.args[2];
    var text = opts.args.slice(3).join(' ');

    if (receiver && type) {
      return bot.ctcp(receiver, type, text);
    } else {
      return respond("Not enough parameters specified. Usage is !irc ctcp <receiver> <message>");
    }
  }

  cycle(bot, opts, respond) {
    var chan = opts.args[1];

    if (chan) {
      return bot.part(chan);
      return bot.join(chan);
    } else {
      return respond("No channel specified");
    }
  }

  raw(bot, opts, respond) {
    if (opts.args[1]) {
      return bot.send(opts.args.join(' '));
    } else {
      return respond("No channel specified");
    }
  }

}
