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
      apiUrl += `&q=${opts.args.join(' ')}`
    }

    const news = await this.fetchNews(apiUrl)
    return respond(news)
  }

  async fetchNews(url) {
    const res = await needle('get', url)

    if (res.body.status === 'error') {
      return `Error fetching news: ${res.body.message}`
    }

    if (res.body.articles.length === 0) {
      return `Unable to find any relevant headlines for "${url.split('&q=')[1]}"`
    }

    const news = []
    const limit = Math.min(3, res.body.articles.length)

    for (let i = 0; i < limit; i++) {
      let article = res.body.articles[i]
      let shortUrl = await this.shorten(article.url)
      news.push(`${article.title} ${shortUrl}`)
    }

    return news.join(' | ')
  }

  async shorten(url) {
    const shortenerUrl = 'https://strongco.de/api/shorten'
    const res = await needle('post', shortenerUrl, {url: url}, {json: true})
    return res.body.url
  }
}
