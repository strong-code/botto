const needle = require('needle')
const cheerio = require('cheerio')
const qs = require('qs')
const config = require('../../config.js').url
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?goodreads\.com$/,

  parse: async function(url) {
    const html = await needle('get', url.href, config.options)
    const $ = cheerio.load(html.body)
    const title = $('head > title').text().trim()
    const desc = $('meta[property="og:description"]').attr('content').trim()
    const rating = $('span[itemprop = "ratingValue"]').text().trim()
    const reviews = parseInt($('meta[itemprop = "ratingCount"]').attr('content').trim()).toLocaleString()
    
    return `[Goodreads] ${title} | ${Colors.wrap('yellow', `★ ${rating}`)} / 5 | ${reviews} reviews | ${desc}`
  }

}
