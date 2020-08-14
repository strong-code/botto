const _ = require('lodash')

module.exports = {

  call: function (bot, opts) {
    _.forEach(bot.chans, (chan) => {
      bot.part(chan.key, 'brb')
    })
    // https://nodejs.org/api/process.html#process_process_exitcode
    return process.exit(1)
  }
}
