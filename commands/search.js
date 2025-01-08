const Command = require('./command.js')
const Helpers = require('../util/helpers.js')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const serverName = require('../config.js').core.default.serverName
const logDir = `/var/log/irssi/${serverName}`
const OUTPUT_FILE = './tmp/out.txt'

module.exports = class Search extends Command {

  constructor() {
    super('search')
  }

  async call(bot, opts, respond) {
    const query = opts.args.join(' ').replace(/[^a-zA-Z0-9\s]/g, '')

    if (query.length < 3) {
      return respond('Must provide a longer string to search for')
    }

    const chan = opts.to
    const results = await this.search(chan, query)

    return respond(`Here is what I found: ${results}`)
  }

  async search(chan, query) {
    const dir = `${logDir}/${chan}`
    const cmd = `grep -r "${query}" ${dir} | sort -t/ -nrs -k5n -k6M -k7 > ${OUTPUT_FILE}`

    const { stdout, stderr } = await execPromise(cmd)

    if (stderr) {
      console.log(stderr)
      return 'Something went wrong. This error has been logged'
    }

    const res = await Helpers.uploadFile(OUTPUT_FILE)

    return res.body.path
  }
}
