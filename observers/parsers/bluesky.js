const needle = require('needle')
const config = require('../../config').bluesky
const parser = require('url')
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(web-cdn\.)?bsky\.app$/,

  parse: async function(url) {
    const user = url.path.split(/\/profile\/(.+)\/post\/.+/)[1]
    const pid = url.path.split('/').pop()
    const did = await this.fetchDid(user)
    const uri = `at://did:plc:${did}/app.bsky.feed.post/${pid}`
    const endpoint = `https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri=${uri}`
    const sessionToken = await this.getSession()
    const headers = {
      headers: { "Authorization": `Bearer ${sessionToken}`, "Content-Type": "application/json" }
    }
    const res = await needle('GET', endpoint, {}, headers)
    const text = res.body.thread.post.record.text
    const date = res.body.thread.post.record.createdAt
    const likes = res.body.thread.post.likeCount
    const replies = res.body.thread.post.replyCount
    const author = res.body.thread.post.author.displayName

    return `[${Colors.wrap('light_blue', 'Bluesky')}] @${user} ${author} "${text}" (${likes} likes, ${replies} replies)`
  },

  async getSession() {
    const opts = { 
      identifier: "bottodev.bsky.social",
      password: config.password
    }
    const headers = {
      headers: { "Content-Type": "application/json" }
    }

    const res = await needle('POST', `https://bsky.social/xrpc/com.atproto.server.createSession`, opts, headers)
    return res.body.accessJwt
  },

  async fetchDid(user) {
    const res = await needle('GET', `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${user}`)
    return res.body.did.split(':')[2]
  }
}

