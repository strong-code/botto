const Command = require('./command.js')
const config = require('../config.js')
const { execFile } = require('child_process')

module.exports = class Ai extends Command {

  constructor() {
    super('ai')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const prompt = opts.args.join(' ').trim()
    if (!prompt) return respond('Usage: !ai <question>')

    const aiConfig = config.opencode || {}
    const model = aiConfig.model
    if (!model) return respond('OpenCode model is not configured')

    try {
      const result = await this.run(aiConfig, model, prompt)
      return respond(result)
    } catch (error) {
      console.error('OpenCode query failed:', error)
      return respond('OpenCode query failed')
    }
  }

  run(aiConfig, model, prompt) {
    return new Promise((resolve, reject) => {
      const request = JSON.stringify({
        model: { providerID: model.split('/')[0], modelID: model.split('/').slice(1).join('/') },
        parts: [{ type: 'text', text: prompt }]
      })
      const args = [
        '-fsS', '--max-time', String(Math.ceil((aiConfig.timeout || 60000) / 1000)),
        '-H', 'Content-Type: application/json',
        '-X', 'POST', `${aiConfig.endpoint || 'https://opencode.ai/zen/v1/chat/completions'}`
      ]

      execFile('curl', args, { input: request, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) return reject(new Error(stderr.trim() || error.message))

        try {
          const response = JSON.parse(stdout)
          const text = response.choices && response.choices[0] && response.choices[0].message
            ? response.choices[0].message.content
            .replace(/\s+/g, ' ')
            .trim()
            : ''
          resolve(text ? text.substring(0, aiConfig.maxLength || 380) : 'OpenCode returned no text')
        } catch (parseError) {
          reject(parseError)
        }
      })
    })
  }
}
