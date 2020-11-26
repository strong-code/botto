const snoowrap = require('snoowrap')
const config = require('../../config.js').url.reddit
const r = new snoowrap(config)

module.exports = {

  hostMatch: /^(www\.)?(old\.)?reddit\.com$/,

  parse: async function(url) {
    const parts = url.path.split('/')

    // it's not a reddit thread, use general parser
    if (parts[3] != 'comments') {
      throw Error('Not a reddit thread, using default parser') 
    }

    let thread = url.path.split('/')[4]
    const t = await r.getSubmission(thread).fetch()
    const date = new Date(t.created*1000).toLocaleString().split(' ')[0].slice(0,-1)

    return `[Reddit] ${t.subreddit_name_prefixed}: "${t.title}" posted by u/${t.author.name} on ${date} `+
      `| ${t.comments.length} comments | ${t.ups}↑ - ${t.downs}↓` 
  }

}
