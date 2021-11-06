const needle = require('needle')
const config = require('../../config').url
const Twit = require('twit')
const T = new Twit(require('../../config').twitter)
const cheerio = require('cheerio')
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(mobile\.)?twitter\.com$/,

  parse: async function(url) {
    if (!url.path.includes('/status/')) {
      throw Error('Not a tweet page, using default parser')
    }

    try {
      const tweetId = url.pathname.split('/')[3]
      const response = await T.get('statuses/show/:id', { id: tweetId, tweet_mode: 'extended' })
      const data = response.data
      const text = data.full_text.replace(/\r?\n|\r/g, ' ')
      const username = data.user.screen_name + (data.user.verified ? ' ✓ ' : '')
      return `[${Colors.wrap('light_blue', 'Twitter')}] @${username}: ${text}`
    } catch (e) {
      console.log(`Error retrieving tweet with Twit library, trying with HTTP request. \n ${e}`)
      const info = await module.exports.getHttp(url)
      return info
    }
  },

  getHttp: async function(url) {
    const res = await needle('get', url.href, config.options)
    const $ = cheerio.load(res.body)
    const username = '@' + url.path.split('/')[1]
    const description = $('meta[property="og:description"]').attr('content').replace(/\r?\n|\r/g, " ")
    return `[${Colors.wrap('light_blue', 'Twitter')}] ${username}: ${description}`
  }

}
