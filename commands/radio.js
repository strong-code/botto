const ytdl = require('ytdl-core')
const fs = require('fs')
const RedisSMQ = require('rsmq')
const radioQueue = new RedisSMQ({ ns: 'botto' })

module.exports = {

  call: function(opts, respond) {
    if (opts.args.length < 1) {
      return respond('Botto radio! Listen in at <some url>. Add a song with !radio add <youtube url>')
    }
  },

  add: function(url) {
    ytdl.getInfo(url, { filter: 'audioonly'}, (err, info) => {
      if (err) { throw err }
      console.log(`[RADIO] Downloading song: ${info.title}`)

      const download = ytdl.downloadFromInfo(info, { filter: 'audioonly'})
      const fp = `${info.title}.mp3`
      download.pipe(fs.createWriteStream(fp))

      download.on('end', () => {
        console.log(`[RADIO] Finished downloading: ${info.title}`)
        radioQueue.sendMessage({ qname: 'radio', message: fp }, (err, res) => {
          if (res) {
            console.log(`[RADIO] Track added to queue: ${info.title}`)
          } else (
            console.log(err.message)
          )
        })
      })
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

module.exports.add('https://www.youtube.com/watch?v=H7HmzwI67ec')
