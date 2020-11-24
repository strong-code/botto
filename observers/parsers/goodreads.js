const needle = require('needle')
const cheerio = require('cheerio')
const qs = require('qs')
const config = require('../../config.js').url

module.exports = {

  hostMatch: /^(www\.)?goodreads\.com$/,

  parse: async function(url) {
    const html = await needle('get', url.href, config.options)
    const $ = cheerio.load(html.body)
    const title = $('head > title').text().trim()
    const desc = $('meta[property="og:description"]').attr('content').trim()
    const rating = $('span[itemprop = "ratingValue"]').text().trim()
    const reviews = $('meta[itemprop = "ratingCount"]').attr('content').trim()
    
    return `[Goodreads] ${title} | ★ ${rating} / 5 | ${reviews} reviews | ${desc}`
  }

}
