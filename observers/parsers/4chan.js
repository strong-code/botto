const needle = require('needle')
const config = require('../../config').url
const he = require('he')
const _ = require('lodash')

module.exports = {

  hostMatch: /^boards\.4chan(nel)?\.org$/,

  parse: async function(url) {
    if (!url.path.includes('/thread/')) {
      throw Error('Not a thread page, using default parser')
    }

    const res = await needle('get', url.href + '.json', config.options)
    const board = '/' + url.path.split('/')[1] + '/'
    const op = res.body.posts[0]
    const posted = op.now.split('(')[0]

    let content = ''
    if (typeof op.sub !== 'undefined' && op.sub) {
      content += op.sub + ': '
    }
    content += he.decode(op.com).replace(/<(.|\n)*?>/g, ' ')
    content = _.truncate(content, { length: 120 })

    return `[4chan] ${board} - ${content} | ${op.replies} replies, ${op.images} images, ${op.unique_ips} uniques | ${posted}`
  }

}
