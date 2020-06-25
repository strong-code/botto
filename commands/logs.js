const { exec } = require('child_process')
const needle = require('needle')
const logs = require('../config.js').logs

module.exports = {

  call: function(opts, respond) {
    const lines = opts.args[0] || 25
    
    module.exports.getLocalLogs(lines, (out) => {
      respond(out)
    })
  },

  upload: function(data, cb) {
    return needle.post(logs.api, `text=${data}`, {}, (err, res) => {
      if (err) {
        return cb(err.message)
      }
      console.log(`Log out uploaded to: ${res.body.path}`)
      cb(res.body.path)
    })
  },

  getLocalLogs: function(lines, cb) {
    const cmd = `tail -n ${lines} ${logs.path}`
    exec(cmd, (e, out, err) => {
      if (e) {
        console.log(e.message)
        return cb('Ironically, something went wrong and you need to check logs')
      }
      if (err) {
        console.log('Error retrieving local logs: ' + err)
        return cb(err)
      }
      if (lines < 3) {
        return cb(out)
      } else {
        return module.exports.upload(out, (url) => {
          return cb(url)
        })
      }
    })
  }
}
