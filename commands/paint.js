const needle = require('needle')
const Command = require('./command.js')

module.exports = class Paint extends Command {

  constructor() {
    super('paint')
  }

  async call(bot, opts, respond) {
    const prompt = opts.args.join(' ').trim()
    if (!prompt) {
      return respond('Usage is !paint <prompt>')
    }

    respond('Please give me a moment to finish my painting...')

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&nologo=true`
    const res = await needle('get', url, { follow: 3 })

    if (res.statusCode < 200 || res.statusCode >= 300 || !res.body || !res.body.length) {
      return respond(`[${res.statusCode}] Failed to generate image. Please try again later`)
    }

    const contentType = res.headers['content-type'] || 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' : 'jpg'

    const data = {
      file: {
        buffer: res.body,
        filename: `image.${extension}`,
        content_type: contentType
      }
    }

    const upload = await needle('POST', 'https://strongco.de/api/paste', data, { multipart: true })

    if (!upload.body || !upload.body.path) {
      return respond('Failed to upload generated image. Please try again later')
    }

    return respond(`${opts.from}, I present to you my latest masterpiece: ${upload.body.path}`)
  }

}
