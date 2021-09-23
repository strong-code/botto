const Observer = require('./observer.js')
const needle = require('needle')
const Helpers = require('../util/helpers.js')

module.exports = class Markov extends Observer {

  constructor() {
    const regex = new RegExp(/(^|.*\s)botto(\s.*|$)/i)
    super('markov', regex)
  }
  
  async call(opts, respond) {
    const url = 'https://bellard.org/textsynth/api/v1/engines/gptj_6B/completions'
    const data = {
      prompt: opts.text,
      seed: 0,
      stream: false,
      temperature: 1,
      top_k: 40,
      top_p: 0.8
    }

    const res = await needle('post', url, data, { json: true })
    const limit = Math.ceil(Math.random() * 3) // 1 - 3 sentence limit
    const text = res.body.text
      .split('\n')
      .map(s => s.trim()) 
      .filter(s => s.length > 0)
      .slice(0, limit)
      .join(' ')
      // .substring(0, 225)

    return respond(text)
  }

}

