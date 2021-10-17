const snoowrap = require('snoowrap')
const config = require('../../config.js').url.reddit
const r = new snoowrap(config)
const needle = require('needle')
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(old\.)?reddit\.com$/,

  parse: async function(url) {
    const parts = url.path.split('/')

    if (parts[3] === 'comments') {
      return module.exports.parseThread(parts[4])
    } else if (parts[1] === 'r') {
      return module.exports.parseSubreddit(parts[2])
    } else {
      throw Error('Not a parseable reddit thread, using default parser') 
    }

  },

  parseThread: async function(thread) {
    const t = await r.getSubmission(thread).fetch()
    const date = new Date(t.created*1000).toLocaleString().split(' ')[0].slice(0,-1)
    const formattedUps = Colors.wrap('light_green', `${t.ups.toLocaleString()} ↑`)
    const formattedDowns = Colors.wrap('light_red', `${t.downs.toLocaleString()} ↓`)

    return `[${Colors.wrap('orange', 'Reddit')}] ${t.subreddit_name_prefixed}: "${t.title}" posted by u/${t.author.name}`
      +` on ${date} | ${t.comments.length.toLocaleString()} comments | ${formattedUps} ${formattedDowns}`
  },

  parseSubreddit: async function(subreddit) {
    const res = await needle('get', `https://old.reddit.com/r/${subreddit}/about.json`)
    const sub = res.body.data

    return `[Reddit] ${sub.url}: ${sub.public_description} ` + 
    `(${sub.subscribers.toLocaleString()} subscribers, ${sub.active_user_count.toLocaleString()} active users)`
  }

}
