const Command = require('./command.js')
const Helpers = require('../util/helpers.js')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const serverName = require('../config.js').core.default.serverName
const logDir = `/var/log/irssi/${serverName}`

module.exports = class Search extends Command {

  constructor() {
    super('search')
  }

  async call(bot, opts, respond) {

    if (opts.args === '') {
      return respond('Must provide a string to search for')
    }

    const chan = opts.to
    const query = opts.args.join(' ')
    const results = await this.search(chan, query)

    return respond(`Here is what I found: ${results}`)
  }

  async search(chan, query) {
    const dir = `${logDir}/${chan}`
    const cmd = `grep -r "${query}" ${dir}`
    console.log(`running command: ${cmd}`)

    const { stdout, stderr } = await execPromise(cmd)

    if (stderr) {
      console.log(stderr)
      return 'Something went wrong. This error has been logged'
    }

    const res = await Helpers.uploadText(stdout)

    return res.body.path
  }
}
