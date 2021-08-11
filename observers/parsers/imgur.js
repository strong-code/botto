const needle = require('needle')
const clientId = require('../../config.js').imgur.clientId

module.exports = {

  hostMatch: /^(www\.)?imgur\.com$/,

  parse: async function(url) {
    if (url.path[1] === 'a') {
      return await module.exports.parseGallery(url)
    }

    return
  },

  parseGallery: async function(url) {
    const albumId = url.path.split('/')[2]
    const options = { headers: { 'Authorization': `Client-ID ${clientId}` } }
    const res = await needle('get', `https://api.imgur.com/3/album/${albumId}`, options)

    const gallery = res.body.data
    const datetime = new Date(gallery.datetime * 1000).toLocaleString().split(',')[0]

    return `[Imgur] ${gallery.title} | ${gallery.images_count} images | ${gallery.views} views ` +
    `| posted ${datetime}`
  }

}
