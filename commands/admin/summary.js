const Command = require('../command.js')
const Helpers = require('../../util/helpers.js')
const MsgCache = require('../../util/messageCache.js')
const apiKey = require('../../config.js').groq.apiKey
const needle = require('needle')

module.exports = class Summary extends Command {

  constructor() {
    super('summary')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    let response
    let logLines

    if (opts.args[0]) {
      const nick = opts.args[0]
      logLines = await MsgCache.get(opts.to, 150)
      logLines = logLines.filter(l => l.startsWith(`<${nick}>:`)).slice(-10)
      response = await this.summarizeNick(logLines)
    } else {
      logLines = await MsgCache.get(opts.to, 30)
      response = await this.summarizeChat(logLines)
    }

    respond(response)
  }

  async summarizeChat(logLines) {
    const prompt = `Write a 1-2 paragraph analysis of the following IRC chat logs. Write a brief summary of the types of chatters involved and their overall contribution to the chat. Only respond with paragraphs shorter than 500 characters. Analyze the general tone, contents, and add some statements about who is contributing and who is subtracting from the overall chat:\n${logLines}`

    const response = await this.sendToGroq(prompt)
    return response
  }

  async summarizeNick(logLines) {
    const prompt = `Write a 1 paragraph analysis of the following IRC user based on the following supplied chat logs of that user. Maximum 500 characters:\n${logLines}`

    const response = await this.sendToGroq(prompt)
    return response
  }

  async sendToGroq(prompt) {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
    const model = 'llama3-70b-8192'

    const payload = {
      model,
      messages: [{ role: 'user', content: prompt }]
    }

    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }

    const res = await needle('POST', apiUrl, payload, { headers, json: true })

    if (res.statusCode !== 200) {
      return `Groq API error: ${res.statusCode} - ${res.body.error.message}`
    }

    return res.body.choices[0].message.content
  }
}
