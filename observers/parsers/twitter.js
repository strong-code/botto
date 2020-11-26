const needle = require('needle')
const config = require('../../config').url
const cheerio = require('cheerio')

module.exports = {

  hostMatch: /^(www\.)?twitter\.com$/,

  parse: async function(url) {
    if (!url.path.includes('/status/')) {
      throw Error('Not a tweet page, using default parser')
    }

    const res = await needle('get', url.href, config.options)
    const $ = cheerio.load(res.body)
    const username = '@' + url.path.split('/')[1]
    console.log($('meta[property="og:description"]').attr('content'))
    const description = $('meta[property="og:description"]').attr('content').replace(/\r?\n|\r/g, " ")

    return `[Twitter] ${username}: ${description}`
  }

}
