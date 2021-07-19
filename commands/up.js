const needle = require('needle')
const config = require('../config.js').url
const _ = require('lodash')
const Command = require('./command.js')

module.exports = class Up extends Command {

  constructor() {
    super('up')
  }
  
  call(bot, opts, respond) {
    if (_.isEmpty(opts.args)) {
      return respond('Usage is !up <domain>');
    }

    this.check(opts.args[0], respond)
  }

  check(domain, respond) {
    const url = 'https://isitup.org/' + domain + '.json'

    needle.get(url, config.options, (err, res) => {
      if (err) {
        return respond(err.message)
      }

      const status = res.body['status_code']
      const http_status = res.body['response_code']
      const response_time = res.body['response_time']

      if (status === 1) {
        return respond(`[HTTP ${http_status}] ${domain} is up (response time: ${response_time} seconds)`)
      } else if (status === 2) {
        return respond(`${domain} is currently offline`)
      } else {
        return respond(`${domain} is not a valid domain`)
      }
    })
  }
}
