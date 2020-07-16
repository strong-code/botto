const { exec } = require('child_process')
const needle = require('needle')
const _ = require('lodash')
const logs = require('../config.js').logs

// TODO: the respond() cb is being passed around a lot
// so that it can be called early with error messages. Would
// be better to throw exceptions on error and catch in call()
module.exports = {

  call: function(opts, respond) {
    // if first arg is NaN e.g. !logs foo
    // get user logs, else use args[0]
    if (opts.args[0] && isNaN(parseInt(opts.args[0]))) { 
      module.exports.getUserLogs(opts.args, (out) => respond(out))
    } else {
      module.exports.getLocalLogs(opts.args[0], (out) => respond(out))
    }
  },

  upload: function(data, cb) {
    return needle.post(logs.api, `text=${data}`, {}, (err, res) => {
      if (err) {
        return cb(err.message)
      }
      if (!res.body.path) {
        return cb(`Error while uploading output to API: ${logs.api}`)
      }
      console.log(`Log output uploaded to: ${res.body.path}`)
      return cb(res.body.path)
    })
  },

  // Always take first filter, then iterate over remainder
  // and build grep chain
  getUserLogs: function(filters, cb) {
    let cmd = `grep '${filters[0]}' ${logs.path}`
    _.forEach(_.tail(filters), (filter) => {
       cmd += ` | grep '${filter}'`
    })
    module.exports.runCommand(cmd, cb)
  },

  getLocalLogs: function(lines, cb) {
    lines = lines || 50
    const cmd = `tail -n ${lines} ${logs.path}`
    module.exports.runCommand(cmd, cb)
  },

  runCommand: function(cmd, cb) {
    return exec(cmd, (e, out, err) => {
      if (e) {
        console.log(e.message)
        return cb('Ironically, something went wrong and you need to check logs', true)
      }
      if (err) {
        console.log('Error retrieving local logs: ' + err)
        return cb(err, true)
      }

      return module.exports.upload(out, (url) => cb(url))
    })
  }
}
