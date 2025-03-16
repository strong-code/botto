const db = require('../../util/db.js');
const Command = require('../command.js')

module.exports = class Ignore extends Command {

  // Use cached values so we don't hit db every message check 
  static ignoredUsers = []

  constructor() {
    super('ignore')
    this.#refresh()
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const command = opts.args[0]

    if (['add', 'list', 'del', 'check'].includes(command)) {
      bot.whois(opts.args[1], (data) => {
        const host = data.host

        if (command === 'add') {
          return this.ignoreUser(opts.from, opts.args[1], host, respond)
        } else if (command === 'list') {
          return this.listIgnored(opts.to, respond)
        } else if (command === 'del') {
          return this.unignoreUser(opts.args[1], host, respond)
        } else if (command === 'check') {
          return this.check(opts.args[1].trim(), host, respond)
        }
      })
    } else {
      return respond('Valid subcommands are add, list, del, check')
    }

  }

  async listIgnored(chan, respond) {
    await this.#refresh()
    const ignoredNicks = Ignore.ignoredUsers.flatMap((o) => o.nick)
    return respond('BAD USERS LIST: ' + ignoredNicks.join(', '))
  }

  ignoreUser(requester, target, host, respond) {
    if (Ignore.isIgnored(target, host)) {
      return respond(`I am already ignoring ${target}`)
    }

    db.none(
      'INSERT INTO ignored_users (nick, host, banned_by, date_added) VALUES($1, $2, $3, $4)',
      [target, host, requester, new Date().toISOString()]
    )
    .then(() => {
      this.#refresh()
      respond(`Ignoring user: ${target}@${host}. Bot privilege has been revoked`)
    })
  }

  unignoreUser(target, host, respond) {
    if (!Ignore.isIgnored(target, host)) {
      return respond('I am not currently ignoring ' + target)
    }

    db.none(
      'DELETE FROM ignored_users WHERE nick = $1 OR host = $2',
      [target, host]
    )
    .then(() => {
      this.#refresh()
      respond(`No longer ignoring user: ${target}. Please be better behaved from now on.`)
    })
  }

  check(nick, host, respond) {
    if (Ignore.isIgnored(nick, host)) {
      return respond(`User ${nick} is currently ignored`)
    } else {
      return respond(`User ${nick} is NOT currently ignored`)
    }
  }

  async #refresh() {
    Ignore.ignoredUsers = []

    await db.each('SELECT nick, host FROM ignored_users', [], row => {
      Ignore.ignoredUsers.push({nick: row.nick, host: row.host})
    })
    console.log(`Refreshed ignoredUser list with ${Ignore.ignoredUsers.length} users`)
  }

  // Used to check if an incoming message is from an ignored user
  static isIgnored(nick, host) {
    if (process.argv[2] === 'test') { 
      return false
    }

    // Special check for default hostmasks, to allow for fuzzy matches
    // e.g. match '42FB06A4:639776FF:9FEBD2AC:IP' to '*::9FEBD2AC:IP'
    if (/^\w*[:\.]\w*[:\.]\w*[:\.]IP$/.test(host)) {
      if (host.split(':').length >= 3) { 
        // colon-delimited host
        host = host.split(':').slice(2).join(':')
      } else { 
        // period-delimited host
        host = host.split('.').slice(2).join('.')
      }
    }

    return Ignore.ignoredUsers.some(u => u.nick === nick || u.host.includes(host))
  }

};
