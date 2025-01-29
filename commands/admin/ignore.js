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

    if (command === 'add') {
      return this.ignoreUser(bot, opts.from, opts.args[1], opts.to, respond)
    } else if (command === 'list') {
      return this.listIgnored(opts.to, respond)
    } else if (command === 'del') {
      return this.unignoreUser(opts.args[1], opts.to, respond)
    } else if (command === 'check') {
      return await this.check(bot, opts.args[1].trim(), respond)
    }
  }

  async listIgnored(chan, respond) {
    await this.#refresh()
    const ignoredNicks = Ignore.ignoredUsers.flatMap((o) => o.nick)
    return respond('BAD USERS LIST: ' + ignoredNicks.join(', '))
  }

  ignoreUser(bot, requester, target, chan, respond) {
    if (Ignore.isIgnored(target)) {
      return respond(`I am already ignoring ${target}`)
    }

    bot.whois(target, (data) => {
      db.none(
        'INSERT INTO ignored_users (nick, host, banned_by, date_added) VALUES($1, $2, $3, $4)',
        [target, data.host, requester, new Date().toISOString()]
      )
      .then(() => {
        this.#refresh()
        respond(`Ignoring user: ${target}@${data.host}. Bot privilege has been revoked`)
      })
      .catch(e => respond(`There is no one named '${target}' in this channel`))
    })

  }

  unignoreUser(target, chan, respond) {
    if (!Ignore.isIgnored(target)) {
      return respond('I am not currently ignoring ' + target)
    }

    db.none('DELETE FROM ignored_users WHERE nick = $1', [target]).then(() => this.#refresh())


    return respond(`No longer ignoring user: ${target}. Please be better behaved from now on.`)
  }

  async check(bot, nick, respond) {
    bot.whois(nick, (data) => {
      if (Ignore.isIgnored(nick, data.host)) {
        console.log(`${nick}@${data.host} is currently ignored`)
        return respond(`User ${nick} is currently ignored`)
      } else {
        return respond(`User ${nick} is NOT currently ignored`)
      }
    })
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
