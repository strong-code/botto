const needle = require('needle')
const qs = require('qs')
const config = require('../../config').url
const moment = require('moment')

module.exports = {

  hostMatch: /^(www\.)?youtube\.com$/,

  parse: function(url, cb) {
    const videoID = qs.parse(url.query).v
    if (!videoID) {
      return cb(false)
    }
    const API_KEY = config.youtube.apiKey
    const apiUrl  = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoID}&key=${API_KEY}`

    needle.get(apiUrl, config.options, (err, res) => {
      if (err) {
        console.log(err)
        return cb('Unable to parse details for YouTube video ID ' + videoId)
      } else {
        const data = res.body.items[0]
        const date = moment(data.snippet.publishedAt).format('MMM Do, YYYY')
        const views = Number(data.statistics.viewCount).toLocaleString()
        const likes = Number(data.statistics.likeCount).toLocaleString()
        const dislikes = Number(data.statistics.dislikeCount).toLocaleString()
        const duration = module.exports.formatDuration(data.contentDetails.duration)
        const info = `[YouTube] "${data.snippet.title}" by ${data.snippet.channelTitle} `
        +`| ${date} | ${duration} long | ${views} views | ${likes} ↑ - ${dislikes} ↓`
        return cb(info)
      }
    })
  },

  formatDuration: function(duration) {
    let timeStr = ''

    // Remove PT from string ref: https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration
    duration = duration.replace('PT','');

    // If the string contains hours parse it and remove it from our duration string
    if (duration.indexOf('H') > -1) {
      let hours_split = duration.split('H')
      let hours = parseInt(hours_split[0])
      timeStr += `${hours}h `
      duration = hours_split[1]
    }

    // If the string contains minutes parse it and remove it from our duration string
    if (duration.indexOf('M') > -1) {
      let minutes_split = duration.split('M')
      let minutes = parseInt(minutes_split[0])
      timeStr += `${minutes}m `
      duration = minutes_split[1]
    }

    // If the string contains seconds parse it and remove it from our duration string
    if (duration.indexOf('S') > -1) {
      let seconds = parseInt(duration.split('S')[0])
      timeStr += `${seconds}s`
    }

    return timeStr + ''
  }

}
