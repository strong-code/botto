const Command = require('./command.js')
const needle = require('needle')
const apiKey = require('../config.js').newsapi.apiKey

module.exports = class News extends Command {

  constructor() {
    super('news')
  }

  async call(bot, opts, respond) {
    let apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`

    if (opts.args[0] !== '') {
      apiUrl += `country=us&apiKey=${apiKey}`
    } else {
      apiUrl += `q=${opts.args.join(' ')}&apiKey=${apiKey}`
    }

    const news = await this.fetchNews(apiUrl)
    return respond(news)
  }

  async fetchNews(url) {
    const res = await needle('get', url)

    if (res.body.status === 'error') {
      return `Error fetching news: ${res.body.message}`
    }

    let str = ''
    const limit = Math.min(3, res.body.articles.length)

    for (let i = 0; i < limit; i++) {
      let article = res.body.articles[i]
      str += `${article.title} (${article.source.name}) | `
    }

    return str
  }
}
