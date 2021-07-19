const { exec } = require('child_process')
const needle = require('needle')
const _ = require('lodash')
const logs = require('../../config.js').logs
const Command = require('../command.js')

module.exports = class Logs extends Command {

  constructor() {
    super('logs')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable) return

    const options = { lines: '', since: '' }
    const argString = _.join(opts.args, ' ').trim()

    if (opts.args[0] === '') {
      return respond("Usage: '!logs 5' for last 5 lines. '!lines 5m ago' for time range logs. These can be combined")
    }

    if (this.isNumber(argString)) {
      options.lines = `-n ${argString}`
    }

    if (this.isTimeRange(argString)) {
      options.since = `--since "${argString}"`
    }

    this.getJournalLogs(options, (paste) => respond(paste)) 
  }

  uploadLogs(data, respond) {
    needle.post(logs.api, `text=${data}`, {}, (err, res) => {
      if (err) {
        return respond(err.message)
      }
      if (!res.body.path) {
        return respond(`Error while uploading output to API: ${logs.api}`)
      }
      console.log(`Log output uploaded to: ${res.body.path}`)
      return respond(res.body.path)
    })
  }

  getJournalLogs(options, respond) {
    let cmd = `journalctl -u botto.service -q --no-pager --no-hostname `
    
    Object.keys(options).forEach(k => cmd += options[k] )

    return exec(cmd, (e, out, err) => {
      if (e) {
        console.log(e.message)
        return respond('Ironically, something went wrong and you need to check logs', true)
      }
      if (err) {
        console.log('Error retrieving local logs: ' + err)
        return respond(err, true)
      }

      this.uploadLogs(out, (url) => respond(url))
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
