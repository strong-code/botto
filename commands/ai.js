const Command = require('./command.js')
const config = require('../config.js')
const needle = require('needle')

module.exports = class Ai extends Command {

  constructor() {
    super('ai')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const addendum = 'Avoid AI slop-style writing. Be as brusque in answering as you want'
    const prompt = opts.args.join(' ').trim()
    if (!prompt) return respond('Usage: !ai <question>')

    const aiConfig = config.opencode || {}
    if (!aiConfig.apiKey) return respond('OpenCode API key is not configured')

    try {
      const result = await this.run(aiConfig, prompt + ' ' + addendum)
      return respond(result)
    } catch (error) {
      console.error('OpenCode query failed:', error)
      return respond('OpenCode query failed')
    }
  }

  run(aiConfig, prompt) {
    const model = aiConfig.model || 'deepseek-v4-flash'

    return needle('post', 'https://opencode.ai/zen/go/v1/chat/completions', {
      model: model,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      open_timeout: aiConfig.timeout || 60000,
      response_timeout: aiConfig.timeout || 60000,
      json: true
    }).then(res => {
      const text = (res.body.choices && res.body.choices[0] && res.body.choices[0].message
        ? res.body.choices[0].message.content
        : '')
        .replace(/\s+/g, ' ')
        .trim()

      return text ? text.substring(0, aiConfig.maxLength || 400) : 'Stupid clanker fell asleep...'
    })
  }
}
