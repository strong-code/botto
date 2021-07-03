const exec = require('child_process').exec
const _ = require('lodash')
const needle = require('needle')
const LOGS_API = require('../../config.js').logs.api
const Command = require('../command.js')

module.exports = class Git extends Command {

  constructor() {
    super('git')
  }

  call(opts, respond) {
    const cmd = opts.args[0]

    if (!cmd) {
      return respond('Must provide a command');
    } else if (cmd === "pull") {
      return this.pull(opts, respond);
    } else if (cmd === "status") {
      return this.status(opts, respond);
    }
  }

  pull(opts, respond) {
    exec('git pull', function (err, stdout, stderr) {
      if (err) {
        return respond(err.message + "; Check logs for more info");
      }

      // split on newline, drop first 2 lines and last line
      let updated = stdout.split(/\r?\n/).slice(2).slice(0,-1)

      // if not undefined and has length (e.g. there was at least 1 file update)
      if (updated.length > 0) {
        // Parse out relative file paths
        updated = _.map(updated, (entry) => entry.split(' | ')[0].trim())
        // Only the .js files
        const modules = _.filter(updated, (entry) => entry.substr(-2) === 'js')

        _.forEach(modules, (f) => {
          delete require.cache[require.resolve('../'+f)] 
        })

        let updateMsg = `${modules.length} modules updated [${updated.length-1} files total]. Full output: `

        needle.post(LOGS_API, `text=${stdout}`, {}, (err, res) => {
          if (err) {
            return respond(err.message)
          }
          if (!res.body.path) {
            return respond(`Error while uploading output to API: ${logs.api}`)
          }
          updateMsg += res.body.path
          respond(updateMsg)
        })
      } else {
        // Normal stdout from `git pull`
        return respond(stdout)
      }
    });
  }

  status(opts, respond) {
    exec('git status -sb', function (err, stdout, stderr) {
      if (err) {
        return respond(err.message + "; Check logs for more info");
      }

      return respond(stdout);
    });
  }
};
