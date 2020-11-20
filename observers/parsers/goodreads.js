const needle = require('needle')
const cheerio = require('cheerio')
const qs = require('qs')
const config = require('../../config.js').url

module.exports = {

  hostMatch: /^(www\.)?goodreads\.com$/,

  // TODO: return cb(false) if it isn't a book page
  parse: function(url, cb) {
    needle.get(url.href, config.options, (err, res) => {
      if (err) {
        return cb(false)
      }
      if (res.statusCode != 200) {
        return cb(`[${res.statusCode}] Unable to open url ${url.href}`)
      }

      const $ = cheerio.load(res.body)
      const title = $('head > title').text().trim()
      const desc = $('meta[property="og:description"]').attr('content').trim()
      const rating = $('span[itemprop = "ratingValue"]').text().trim()
      const reviews = $('meta[itemprop = "ratingCount"]').attr('content').trim()
      
      cb(`[Goodreads] ${title} | ★ ${rating} / 5 | ${reviews} reviews | ${desc}`)
    })
  }

}
