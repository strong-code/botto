const needle = require('needle')
const config = require('../../config').url
const he = require('he')
const _ = require('lodash')

module.exports = {

  hostMatch: /^boards\.4chan(nel)?\.org$/,

  parse: async function(url) {
    const endpoint = module.exports.cleanUrl(url)
    const res = await needle('get', endpoint, config.options)
    const board = '/' + url.path.split('/')[1] + '/'

    // it's an anchor link to specific post
    if (url.hash) {
      const id = parseInt(url.hash.split('#p')[1])
      return module.exports.getComment(res.body, board, id)
    } else {
      return module.exports.getOp(res.body, board)
    }
  },

  cleanUrl: function(url) {
    if (!url.path.includes('/thread/')) {
      throw new Error('Not a thread page, using default parser')
    }

    const parts = url.href.split('/')
    const last = parts.pop()

    // clean URL, need to strip last parts
    if (isNaN(parseInt(last))) {
      url.href = parts.join('/')
    }

    return url.href.split('#')[0] + '.json'
  },

  getComment: async function(json, board, id) {
    const post = _.find(json.posts, { 'no': id }) 
    const content = he.decode(post.com).replace(/<(.|\n)*?>/g, ' ')
    const posted = post.now.split('(')[0]
    return `[4chan] ${board} "${content.slice(0, 240).trim()}" (${posted})`
  },

  getOp: async function(json, board) {
    const op = json.posts[0]
    const posted = op.now.split('(')[0]

    let content = ''
    if (typeof op.sub !== 'undefined' && op.sub) {
      content += op.sub + ': '
    }

    if (op.com) {
      content += he.decode(op.com).replace(/<(.|\n)*?>/g, ' ')
    }

    content = _.truncate(content, { length: 160 })

    return `[4chan] ${board} - ${content} | ${op.replies} replies, ${op.images} images, ${op.unique_ips} uniques | ${posted}`

  }

}
