const needle = require('needle')
const config = require('../../config').url
const cheerio = require('cheerio')
const Colors = require('irc').colors

module.exports = {
  hostMatch: /^(www\.)?(mobile\.)?(twitter|x)\.com$/,
  parse: async function(url) {
    const match = url.pathname.match(/^\/(?:([A-Za-z0-9_]{1,15})\/status|i\/web\/status)\/(\d+)(?:\/.*)?$/)
    if (!match) {
      throw Error('Not a tweet page, using default parser')
    }

    // The embed endpoint accepts /i/status/ID, but not /i/web/status/ID.
    const postUrl = `https://x.com/${match[1] || 'i'}/status/${match[2]}`
    try {
      const post = await module.exports.getOEmbed(postUrl)
      return `[${Colors.wrap('light_blue', 'Twitter')}] @${post.username}: ${post.text}`
    } catch (e) {
      console.log(`oEmbed unavailable (${e && e.message ? e.message : String(e)}); trying public page metadata`)
      return module.exports.getHttp(postUrl, match[1] === 'i' ? null : match[1])
    }
  },

  getOEmbed: async function(postUrl) {
    const res = await needle('get', 'https://publish.x.com/oembed',
      { url: postUrl, omit_script: 1 }, config.options)
    if (res.statusCode !== 200) {
      throw Error(`oEmbed returned HTTP ${res.statusCode}`)
    }

    const body = res.body
    const author = body && typeof body.author_url === 'string' &&
      body.author_url.match(/^https:\/\/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/?$/)
    if (!author || typeof body.html !== 'string') {
      throw Error('oEmbed response is missing author or HTML')
    }

    const $ = cheerio.load(body.html)
    const paragraph = $('blockquote.twitter-tweet p').first()
    paragraph.find('br').replaceWith(' ')
    paragraph.find('img[alt]').each(function() {
      $(this).replaceWith($('<span></span>').text($(this).attr('alt')))
    })
    const text = paragraph.text().replace(/\s+/g, ' ').trim()
    if (!text) {
      throw Error('oEmbed response is missing post text')
    }
    return { username: author[1], text }
  },

  getHttp: async function(postUrl, username) {
    const res = await needle('get', postUrl, config.options)
    if (res.statusCode !== 200) {
      throw Error(`Public post page returned HTTP ${res.statusCode}`)
    }
    const $ = cheerio.load(res.body)
    const description = $('meta[property="og:description"]').attr('content')
    if (!description || !description.trim()) {
      throw Error('Public post page has no description')
    }
    const author = username ? `@${username}: ` : ''
    return `[${Colors.wrap('light_blue', 'Twitter')}] ${author}${description.replace(/\s+/g, ' ').trim()}`
  }
}
