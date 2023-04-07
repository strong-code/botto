const { exec } = require('child_process')
const config = require('../config.js').url
const Command = require('./command.js')

module.exports = class Up extends Command {

  constructor() {
    super('up')
  }
  
  call(bot, opts, respond) {
    if (opts.args[0] === '') {
      return respond('Usage is !up <domain>');
    }

    this.check(opts.args[0], respond)
  }

  check(domain, respond) {
    const cmd = `curl -LI ${domain} 2>/dev/null | grep -o '^HTTP.*' | tail -1 | cut -d ' ' -f2`

    exec(cmd, (_, out, err) => {
      out = out.trim()
      let stat 

      switch (true) {
        case /^2.*/.test(out):
          stat = 'is up'
          break
        case /^4.*/.test(out):
          stat = 'was not found or is unreachable'
          break
        case /^5.*/.test(out):
          stat = 'is offline'
          break
        default:
          stat = `Unable to get a response for ${domain}`
          return respond(`Unable to get response for ${domain} (invalid domain)`)
          break
      }

      return respond(`[HTTP ${out}] ${domain} ${stat}`)
    })
  }
}
