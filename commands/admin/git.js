const exec = require('child_process').exec
const needle = require('needle')
const Helpers = require('../../util/helpers.js')
const Command = require('../command.js')

module.exports = class Git extends Command {

  constructor() {
    super('git')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const cmd = opts.args[0]

    if (!cmd) {
      return respond('Must provide a command')
    } else if (cmd === "pull") {
      return this.pull(bot, opts, respond)
    } else if (cmd === "status") {
      return this.status(bot, opts, respond)
    }
  }

  pull(bot, opts, respond) {
    exec('git pull', async (err, stdout, stderr) => {
      if (err) {
        return respond(`${Helpers.strip(err.message)} Check logs for more info`)
      }

      if (stdout === 'Already up to date') {
        return resopnd(stdout)
      }

      const res = await Helpers.uploadText(stdout)
      return respond(`Pulled in new changes from upstream. Full output: ${res.body.path}`)
    })
  }

  status(bot, opts, respond) {
    const cmd = `echo -n "[$(git rev-parse --abbrev-ref HEAD)]" ; echo " $(git log --pretty=format:'%h %s' -n1)"`

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        return respond(`${err.message}; Check logs for more info`)
      }

      return respond(stdout)
    })
  }

}
