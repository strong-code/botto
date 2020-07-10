const needle = require('needle')
const qs = require('qs')
const config = require('../../config').url

module.exports = {

  hostMatch: "youtube.com",

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
        const views = Number(data.statistics.viewCount).toLocaleString()
        const likes = Number(data.statistics.likeCount).toLocaleString()
        const dislikes = Number(data.statistics.dislikeCount).toLocaleString()
        const duration = module.exports.formatDuration(data.contentDetails.duration)
        const info = `[YouTube] "${data.snippet.title}" by ${data.snippet.channelTitle} `
        +`| ${duration} long | ${views} views | ${likes} ↑ - ${dislikes} ↓`
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
      hours_split = duration.split('H');
      hours       = parseInt(hours_split[0]);
      timeStr += `${hours}h `
      duration    = hours_split[1];
    }

    // If the string contains minutes parse it and remove it from our duration string
    if (duration.indexOf('M') > -1) {
      minutes_split = duration.split('M');
      minutes       = parseInt(minutes_split[0]);
      timeStr += `${minutes}m `
      duration      = minutes_split[1];
    }

    // If the string contains seconds parse it and remove it from our duration string
    if (duration.indexOf('S') > -1) {
      seconds_split = duration.split('S');
      timeStr += `${seconds}s`
      seconds       = parseInt(seconds_split[0]);
    }

    // Math the values to return seconds
    return timeStr + ''
  }

}
