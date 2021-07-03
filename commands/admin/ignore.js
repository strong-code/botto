const db = require('../../util/db.js');
const _  = require('lodash');
const Command = require('../command.js')

module.exports = class Ignore extends Command {

  // Use cached values so we don't hit db every message check 
  static ignoredUsers = []

  constructor() {
    super('ignore')

    db.each('SELECT nick FROM ignored_users', [], row => {
      Ignore.ignoredUsers.push(row.nick)
    })
  }

  call(bot, opts) {
    const command = opts.args[0];

    if (command === 'add') {
      return this.ignoreUser(bot, opts.from, opts.args[1], opts.to);
    } else if (command === 'list') {
      return this.listIgnored(bot, opts.to);
    } else if (command === 'del') {
      return this.unignoreUser(bot, opts.args[1], opts.to);
    } else if (command === 'check') {
      return this.check(bot, opts.args[1], opts.to);
    }
  }

  async listIgnored(bot, chan) {
    Ignore.ignoredUsers = [] // overwrite with fresh DB data 
    await db.each('SELECT nick FROM ignored_users', [], row => {
      Ignore.ignoredUsers.push(row.nick)
    })
    return bot.say(chan, 'BAD USERS LIST: ' + _.join(Ignore.ignoredUsers, ', '))
  }

  ignoreUser(bot, requester, target, chan) {
    if (Ignore.isIgnored(target)) {
      return bot.say(chan, `I am already ignoring ${target}`)
    }

    bot.whois(target, (data) => {
      db.none('INSERT INTO ignored_users (nick, host, banned_by, date_added) VALUES($1, $2, $3, $4)',
        [target, data.host, requester, new Date().toISOString()])

      Ignore.ignoredUsers.push(target)
      
      return bot.say(chan, `Ignoring user: ${target}. Bot privilege has been revoked`)
    })
  }

  unignoreUser(bot, target, chan) {
    if (!Ignore.isIgnored(target)) {
      return bot.say(chan, 'I am not currently ignoring ' + target)
    }

    db.none('DELETE FROM ignored_users WHERE nick = $1', [target])

    Ignore.ignoredUsers = Ignore.ignoredUsers.filter(n => n !== target)

    return bot.say(chan, `No longer ignoring user: ${target}. Please be better behaved from now on.`)
  }

  check(bot, nick, chan) {
    if (Ignore.isIgnored(nick)) {
      return bot.say(chan, `User ${nick} is currently ignored`)
    } else {
      return bot.say(chan, `User ${nick} is NOT currently ignored`)
    }
  }

  // Used to check if an incoming message is from an ignored user
  static isIgnored(nick, host) {
    if (process.argv[2] === 'test') { 
      return false
    }

    return Ignore.ignoredUsers.includes(nick)
  }

};
