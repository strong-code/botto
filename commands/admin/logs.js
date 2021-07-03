const { exec } = require('child_process')
const needle = require('needle')
const _ = require('lodash')
const logs = require('../../config.js').logs
const Command = require('../command.js')

module.exports = class Logs extends Command {

  constructor() {
    super('logs')
  }

  call(bot, opts) {
    const options = { lines: '', since: '' }
    const argString = _.join(opts.args, ' ').trim()

    if (opts.args[0] === '') {
      return bot.say(opts.to, "Usage: '!logs 5' for last 5 lines. '!lines 5m ago' for time range logs. These can be combined")
    }

    if (this.isNumber(argString)) {
      options.lines = `-n ${argString}`
    }

    if (this.isTimeRange(argString)) {
      options.since = `--since "${argString}"`
    }

    this.getJournalLogs(options, (paste) => bot.say(opts.to, paste)) 
  }

  uploadLogs(data, cb) {
    needle.post(logs.api, `text=${data}`, {}, (err, res) => {
      if (err) {
        return cb(err.message)
      }
      if (!res.body.path) {
        return cb(`Error while uploading output to API: ${logs.api}`)
      }
      console.log(`Log output uploaded to: ${res.body.path}`)
      return cb(res.body.path)
    })
  }

  getJournalLogs(options, cb) {
    let cmd = `journalctl -u botto.service -q --no-pager --no-hostname `
    
    Object.keys(options).forEach(k => cmd += options[k] )

    return exec(cmd, (e, out, err) => {
      if (e) {
        console.log(e.message)
        return cb('Ironically, something went wrong and you need to check logs', true)
      }
      if (err) {
        console.log('Error retrieving local logs: ' + err)
        return cb(err, true)
      }

      this.uploadLogs(out, (url) => cb(url))
    })
  }

  // e.g. !logs 15
  isNumber(argString) {
    return /^\d+$/.test(argString)
  }

  // e.g. !logs 2 days ago OR !logs 2d ago
  isTimeRange(argString) {
    return /^((\d+\w)|(\d+\s\w+))\sago$/.test(argString)
  }

}
