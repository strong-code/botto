const RedisSMQ = require('rsmq')
const radioQueue = new RedisSMQ({ ns: 'botto' })

module.exports = {

  call: function(opts, respond) {
    if (opts.args.length < 1) {
      return respond('Botto radio! Listen in at <some url>. Add a song with !radio add <youtube url>')
    }
  },

  add: function(msg) {
    radioQueue.sendMessage({ qname: 'radio', message: msg }, (err, res) => {
      if (res) {
        console.log('New track added: ' + msg)
      } else (
        console.log(err.message)
      )
    })
  }
}

radioQueue.createQueue({ qname: 'radio' }, (err, res) => {
  if (res === 1) {
    console.log('Radio queue created!')
  } else {
    console.log(err.message)
  }
})

module.exports.add()
