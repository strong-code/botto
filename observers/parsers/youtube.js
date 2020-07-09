const needle = require('needle')
const qs = require('qs')
const config = require('../../config').url

module.exports = {

  hostMatch: "youtube.com",

  parse: function(url, cb) {
    const videoID = qs.parse(url.query).v
    const API_KEY = config.youtube.apiKey
    const apiUrl  = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoID}&key=${API_KEY}`

    needle.get(apiUrl, config.options, (err, res) => {
      if (err) {
        console.log(err)
        return respond('Unable to parse details for YouTube video ID ' + videoId)
      } else {
        const data = res.body.items[0]
        const views = Number(data.statistics.viewCount).toLocaleString()
        const likes = Number(data.statistics.likeCount).toLocaleString()
        const dislikes = Number(data.statistics.dislikeCount).toLocaleString()
        const info = `[YouTube] "${data.snippet.title}" by ${data.snippet.channelTitle} `
        +`| ${views} views | ${likes} ↑ - ${dislikes} ↓`
        return cb(info)
      }
    })
  }

}
