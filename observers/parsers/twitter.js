const needle = require('needle')
const BEARER_TOKEN = require('../../config.js').twitter.bearer_token
const config = require('../../config').url
const cheerio = require('cheerio')
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(mobile\.)?(twitter|x)\.com$/,

  parse: async function(url) {
    if (!url.path.includes('/status/')) {
      throw Error('Not a tweet page, using default parser')
    }

    try {
      const tweetId = url.pathname.split('/')[3]
      const username = url.pathname.split('/')[1]
      const tweet = await module.exports.getJson(tweetId)
      // const username = data.user.screen_name + (data.user.verified ? ' ✓ ' : '')
      return `[${Colors.wrap('light_blue', 'Twitter')}] @${username}: ${tweet.text}`
    } catch (e) {
      console.log(`Error retrieving tweet with API access, trying with HTTP request. \n ${e}`)
      const info = await module.exports.getHttp(url)
      return info
    }
  },

  getJson: async function(tweetId) {
    const url = `https://api.twitter.com/2/tweets/${tweetId}`
    const params = {
      'tweet.fields': 'text,author_id,created_at',
      'expansions': 'author_id',
      'user.fields': 'name,username'
    }
    const opts = { headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` } }
    const res = await needle('GET', url, params, opts)

    if (res.statusCode !== 200) {
      throw new Error(`Request failed: ${res.statusCode}`)
    }

    console.log(res.body.data)

    return {
      text: res.body.data.text.replace(/(\r\n|\n|\r)/gm, ""),
      name: res.body.data.author_name,
      username: res.body.data.author_username,
      created_at: res.body.data.created_at
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
