const _ = require('lodash')
const moment = require('moment')
const regex = /(\d+) (seconds?|minutes?|hours?|days?) (.+)/
const Command = require('./command.js')
const reminders = {}

module.exports = class Remind extends Command {

  constructor() {
    super('remind')
  }
  
  call(opts, respond) {
    if (opts.args[0] === 'clear') {
      const cleared = this.clearReminders(opts.from)
      return respond(cleared)
    }

    if (opts.args[0] === 'list') {
      const reminders = this.listReminders(opts.from)
      return respond(reminders)
    }

    try {
      let [, count, unit, reminder] = regex.exec(_.join(opts.args, ' '))

      this.createReminder(opts.from, count, unit, reminder, respond)
      
      respond(`I will remind you in ${count} ${unit}`)
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

  createReminder(user, count, unit, reminder, respond) {
    const convertedCount = this.toMillis(count, unit)

    if (convertedCount > Math.pow(2,31)-1) { // limitation of setTimeout max millis
      return respond('Just use a calendar at that point')
    }

    const r = setTimeout(() => {
      respond(`${user}: ${reminder} (from ${count} ${unit} ago)`)
      this.clearReminder(user, reminder)
    }, convertedCount)

    const end = moment().add(convertedCount, 'ms')

    const obj = { text: reminder, reminder: r, end: end }

    if (reminders[user]) {
      reminders[user].push(obj) 
    } else {
      reminders[user] = [obj]
    }
  }

  listReminders(user) {
    if (!reminders[user] || _.isEmpty(reminders[user])) {
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
        console.log(`Cleared reminder for ${user} (${r,text})`)
      }
    })
  }

  clearReminders(user) {
    if (typeof reminders[user] === 'undefined') { return }

    reminders[user].forEach(r => clearTimeout(r.reminder))
    reminders[user] = []

    return 'All reminders have been cleared'
  }

  toMillis(count, unit) {
    let secs = count

    if (/^minute(s?)$/.test(unit)) {
      secs = count * 60
    } else if (/^hour(s?)$/.test(unit)) {
      secs = count * 3600
    } else if (/^day(s?)$/.test(unit)) {
      secs = count * 86400
    }
    return secs * 1000
  }
}

