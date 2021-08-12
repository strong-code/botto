const needle = require('needle')
const clientId = require('../../config.js').imgur.clientId
const auth = { headers: { 'Authorization': `Client-ID ${clientId}` } }

module.exports = {

  hostMatch: /^(www\.)?(i\.)?imgur\.com$/,

  parse: async function(url) {
    const type = url.path.split('/')[1]

    if (type === 'a' || 'gallery') {
      return await module.exports.parseAlbum(url)
    }

    console.log(`Unable to parse Imgur url: ${url.href}`)
    return
  },

  parseAlbum: async function(url) {
    const albumId = url.path.split('/')[2]
    const res = await needle('get', `https://api.imgur.com/3/album/${albumId}`, auth)

    const gallery = res.body.data
    const datetime = new Date(gallery.datetime * 1000).toLocaleString().split(',')[0]

    return `[Imgur] ${gallery.title} | ${gallery.images_count} images | ${gallery.views} views ` +
    `| posted ${datetime}`
  }

}
