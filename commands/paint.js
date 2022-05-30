const needle = require('needle')
const Command = require('./command.js')
const API_URL = 'https://hf.space/embed/dalle-mini/dalle-mini/api/predict/'

module.exports = class Paint extends Command {

  constructor() {
    super('paint')
  }

  async call(bot, opts, respond) {
    respond('Please give me a moment to finish my painting...')

    const res = await needle('post', API_URL, { data: [opts.args.join(' ')], fn_index: 0, session_hash: "s08878x31cp" }, 
      {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
    })

    if (res.body.error || !res.body.data) {
      const e = res.body.error || { error_type: 'API timeout', message: 'API failed to return a response' }
      return respond(`${e.error_type}: ${e.message}. Please try again later`)
    }

    const idx = Math.floor(Math.random() * (res.body.data[0].length - 1))
    const imgData = res.body.data[0][idx].replace(/^data:image\/png;base64,/, "")

    const data = {
      file: {
        buffer: Buffer.from(imgData, 'base64'),
        filename: 'image.png',
        content_type: 'image/png'
      }
    }

    const upload = await needle('POST', 'https://strongco.de/api/paste', data, { multipart: true })
    
    return respond(`${opts.from}, I present to you my latest masterpiece: ${upload.body.path}`)
  }

}
