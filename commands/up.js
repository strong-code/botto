const needle = require('needle');
const config = require('../config.js').url
const _ = require('lodash');

module.exports = {
  
  call: function (opts, respond) {
    if (_.isEmpty(opts.args)) {
      return respond('Usage is !up <domain>');
    }

    module.exports.check(opts.args[0], (info) => respond(info))
  },

  check: function (domain, cb) {
    const url = 'https://isitup.org/' + domain + '.json'

    needle.get(url, config.options, (err, res) => {
      if (err) {
        return cb(err.message)
      }

      const status = res.body['status_code']
      const response_time = res.body['response_time']

      if (status === 1) {
        return cb(`${domain} is up (response time: ${response_time} seconds)`)
      } else if (status === 2) {
        return cb(`${domain} is currently offline`)
      } else {
        return cb(`${domain} is not a valid domain`)
      }
    })
  }
}
