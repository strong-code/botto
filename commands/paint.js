const needle = require('needle')
const { writeFile, readFile } = require('fs/promises')
const Command = require('./command.js')
const API_URL = 'https://api.algorithmia.com/v1/web/algo/josephmiller/VQGAN_CLIP_Text_to_Image/1.1.2'

module.exports = class Paint extends Command {

  constructor() {
    super('paint')
  }

  async call(bot, opts, respond) {
    const res = await needle('post', API_URL, { prompt: opts.args.join(' ') }, 
      {
        headers: { 
          'Host': 'api.algorithmia.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'http://axal-arm.s3-website-eu-west-1.amazonaws.com/',
          'Content-Type': 'application/json',
          'Authorization': 'Simple simjNGR47E12ZVInXco8f5+A4TK1',
          'Origin': 'http://axal-arm.s3-website-eu-west-1.amazonaws.com',
          'Content-Length': '32',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
    })

    if (res.body.error) {
      const error = res.body.error
      return respond(`${error.error_type}: ${error.message}. Please try again later`)
    }

    const data = {
      file: {
        buffer: Buffer.from(res.body.result, 'base64'),
        filename: 'image.jpg',
        content_type: 'image/jpg'
      }
    }
    const upload = await needle('POST', 'https://strongco.de/api/paste', data, { multipart: true })
    
    return respond(`${opts.from}, I present to you my latest masterpiece: ${upload.body.path}`)
  }

}
