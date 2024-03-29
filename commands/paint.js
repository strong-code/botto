const needle = require('needle')
const Command = require('./command.js')
const API_URL = 'https://bf.dallemini.ai/generate'

module.exports = class Paint extends Command {

  constructor() {
    super('paint')
  }

  async call(bot, opts, respond) {
    respond('Please give me a moment to finish my painting...')

    const res = await needle('post', API_URL, { prompt: opts.args.join(' ') },
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

    if (/50\d/.test(res.statusCode)) {
      return respond(`[${res.statusCode}] Painting queue full. Please try again later`)
    }

    if (res.body.error || !res.body.images) {
      const e = res.body.error || { error_type: 'API timeout', message: 'API failed to return a response (check !logs for error)' }
      return respond(`[${res.statusCode}] ${e.error_type}: ${e.message}. Please try again later`)
    }

    const idx = Math.floor(Math.random() * (res.body.images.length - 1))

    const data = {
      file: {
        buffer: Buffer.from(res.body.images[idx], 'base64'),
        filename: 'image.png',
        content_type: 'image/png'
      }
    }

    const upload = await needle('POST', 'https://strongco.de/api/paste', data, { multipart: true })
    
    return respond(`${opts.from}, I present to you my latest masterpiece: ${upload.body.path}`)
  }

}
