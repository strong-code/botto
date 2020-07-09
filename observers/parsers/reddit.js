const snoowrap = require('snoowrap')
const config = require('../../config.js').url.reddit
const r = new snoowrap(config)

module.exports = {

  hostMatch: "reddit.com",

  parse: function(url, cb) {
    const parts = url.path.split('/')

    // it's not a reddit thread, use general parser
    if (parts[3] != 'comments') {
      return cb(false)
    }

    let thread = url.path.split('/')[4]
    return r.getSubmission(thread).fetch().then(t => {
      const date = new Date(t.created*1000).toLocaleString().split(' ')[0].slice(0,-1)
      const info = `${t.subreddit_name_prefixed}: "${t.title}" posted by u/${t.author.name} on ${date} `+
        `| ${t.comments.length} comments | ${t.ups}↑ - ${t.downs}↓` 
      return cb(info)
    })
  }

}
