const needle = require('needle')
const Command = require('./command.js')
const config = require('../config.js')

module.exports = class Paint extends Command {

  constructor() {
    super('paint')
  }

  async call(bot, opts, respond) {
    respond('Please give me a moment to finish my painting...')

    const gemini = config.gemini || {}
    const apiKey = gemini.apiKey
    const model = gemini.model || 'nano-banana-2-lite'

    if (!apiKey) return respond('Gemini API key is not configured')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
    const res = await needle('post', url, {
      contents: [{ parts: [{ text: opts.args.join(' ') }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    }, { json: true })

    if (res.statusCode < 200 || res.statusCode >= 300 || res.body.error) {
      const error = res.body.error || { message: 'Gemini API failed to return a response' }
      return respond(`[${res.statusCode}] ${error.message}. Please try again later`)
    }

    const parts = res.body.candidates && res.body.candidates[0] && res.body.candidates[0].content
      ? res.body.candidates[0].content.parts
      : []
    const image = parts.find(part => part.inlineData && part.inlineData.data)

    if (!image) {
      return respond('Gemini API did not return an image. Please try again later')
    }

    const mimeType = image.inlineData.mimeType || 'image/png'
    const extension = mimeType.split('/')[1] || 'png'

    const data = {
      file: {
        buffer: Buffer.from(image.inlineData.data, 'base64'),
        filename: `image.${extension}`,
        content_type: mimeType
      }
    }

    const upload = await needle('POST', 'https://strongco.de/api/paste', data, { multipart: true })
    
    return respond(`${opts.from}, I present to you my latest masterpiece: ${upload.body.path}`)
  }

}
