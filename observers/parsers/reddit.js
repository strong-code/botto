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
      if (/^[a-z0-9]{7}$/.test(parts[6])) {
        return module.exports.parseComment(parts[6])
      }
      return module.exports.parseThread(parts[4])
    } else if (parts[1] === 'r') {
      return module.exports.parseSubreddit(parts[2])
    } else {
      throw Error('Not a parseable reddit thread, using default parser') 
    }

  },

  parseComment: async function(comment) {
    const c = await r.getComment(comment).fetch()
    const [date, ups, downs] = module.exports.parsePostInfo(c)
    const body = (c.body.length > 200 ? `${c.body.substr(0,200)}...` : c.body)
    
    return `[${Colors.wrap('orange', 'Reddit')}] u/${c.author_fullname}: "${body}"`
      + ` | ${date} | ${ups} ${downs}`
  },

  parseThread: async function(thread) {
    const t = await r.getSubmission(thread).fetch()
    const [date, ups, downs] = module.exports.parsePostInfo(t)

    return `[${Colors.wrap('orange', 'Reddit')}] ${t.subreddit_name_prefixed}: "${t.title}" posted by u/${t.author.name}`
      +` on ${date} | ${t.comments.length.toLocaleString()} comments | ${ups} ${downs}`
  },

  parseSubreddit: async function(subreddit) {
    const res = await needle('get', `https://old.reddit.com/r/${subreddit}/about.json`)
    const sub = res.body.data

    return `[Reddit] ${sub.url}: ${sub.public_description} ` + 
    `(${sub.subscribers.toLocaleString()} subscribers, ${sub.active_user_count.toLocaleString()} active users)`
  },

  parsePostInfo: function(p) {
    const date = new Date(p.created*1000).toLocaleString().split(' ')[0].slice(0, -1)
    const ups = Colors.wrap('light_green', `${p.ups.toLocaleString()} ↑`)
    const downs = Colors.wrap('light_red', `${p.downs.toLocaleString()} ↓`)

    return [date, ups, downs]
  }

}
