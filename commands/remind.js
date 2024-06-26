const moment = require('moment')
const regex = /(\d+) (seconds?|minutes?|hours?|days?) (.+)/
const Helpers = require('../util/helpers.js')
const Command = require('./command.js')
const Redis = require('../util/redis.js')
const reminders = {};

module.exports = class Remind extends Command {

  constructor() {
    (async () => {
      const existingReminders = await Redis.hGetAll('reminders')
      console.log('Existing reminders from redis:')
      console.log(existingReminders)
    })();
    super('remind')
  }
  
  call(bot, opts, respond) {
    console.log(moment().milliseconds())
    if (opts.args[0] === 'clear') {
      const cleared = this.clearReminders(opts.from)
      return respond(cleared)
    }

    if (opts.args[0] === 'list') {
      const reminders = this.listReminders(opts.from)
      return respond(reminders)
    }

    try {
      let [, count, unit, reminder] = regex.exec(opts.args.join(' '))

      const r = this.createReminder(opts.from, count, unit, reminder, respond)

      if (r) {
        respond(`I will remind you in ${count} ${unit}`)
      }
    } catch (e) {
      console.log(e)
      // TypeError thrown when regex cant match array destructuring
      if (e instanceof TypeError) {
        return respond('Usage is !remind <count> <unit> <message>. <unit> can be seconds, minutes, hours or days.')
      } else {
        return respond('Something went wrong, please check !logs')
      }
    }

  }

  async flushToRedis() {
    const stringifiedReminders = JSON.stringify(reminders)
    console.log(stringifiedReminders)
    await Redis.hSet('reminders', stringifiedReminders)
  }

  createReminder(user, count, unit, reminder, respond) {
    if (!/^(second|minute|hour|day)s?$/.test(unit)) {
      return respond('Unit must be second(s), minute(s), hour(s) or day(s)')
    } 

    const duration = moment.duration(count, unit).asMilliseconds()

    if (duration > Math.pow(2,31)-1) { // limitation of setTimeout max millis
      return respond('Just use a calendar at that point')
    }

    const r = setTimeout(() => {
      respond(`${user}: ${reminder} (from ${count} ${unit} ago)`)
      this.clearReminder(user, reminder)
    }, duration)

    const end = moment().add(duration, 'ms')

    const obj = { text: reminder, reminderId: r, end: end }

    if (reminders[user]) {
      reminders[user].push(obj) 
    } else {
      reminders[user] = [obj]
    }

    this.flushToRedis()

    return r
  }

  listReminders(user) {
    if (!reminders[user] || reminders[user] === []) {
      return "You don't have any reminders set"
    }

    let allReminders = ''

    reminders[user].forEach((r, i) => {
      const timeLeft = moment().to(r.end)
      allReminders += `[${i+1}] ${r.text} (${timeLeft}) `
    })

    return allReminders
  }

  clearReminder(user, text) {
    reminders[user].forEach((r, i) => {
      if (r.text === text) {
        reminders[user].splice(i, 1)
        console.log(`Cleared reminder for ${user} (${text})`)
      }
    })
  }

  clearReminders(user) {
    if (typeof reminders[user] === 'undefined') { return }

    reminders[user].forEach(r => clearTimeout(r.reminderId))
    reminders[user] = []

    return 'All reminders have been cleared'
  }

}

