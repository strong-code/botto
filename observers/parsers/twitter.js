const needle = require('needle')
const config = require('../../config').url
const cheerio = require('cheerio')

module.exports = {

  hostMatch: "twitter.com",

  parse: function(url, cb) {
    // Use general parser if its not a tweet (e.g. homepage)
    if (!url.path.includes('/status/')) { return cb(false) } 

    needle.get(url.href, config.options, (err, res) => {
      if (err) {
        console.log(err)
        return cb(false)
      }

      const $ = cheerio.load(res.body)
      const username = '@' + url.path.split('/')[1]
      const description = $('meta[property="og:description"]').attr('content').replace(/\r?\n|\r/g, " ")

      return cb(`${username}: ${description}`)
    })
  }

}
