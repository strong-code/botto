const needle = require('needle')
const qs = require('qs')
const config = require('../../config').url
const moment = require('moment')
const API_BASE = 'https://www.googleapis.com/youtube/v3'
const API_KEY = config.youtube.apiKey
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(youtube\.com)|(youtu\.be)$/,

  parse: async function(url) {
    if (!url.search && url.pathname.startsWith('/c/')) {
      return await module.exports.parseChannel(url)
    } else {
      return await module.exports.parseVideo(url)
    }
  },

  parseChannel: async function(url) {
    const channel = url.path.split('/')[2]
    let apiUrl = `${API_BASE}/search?part=snippet&type=channel&maxResults=1&q=${channel}&key=${API_KEY}`

    let res = await needle('get', apiUrl, config.options)
    res = res.body.items[0]

    const channelName = res.snippet.title
    const snippet = res.snippet.description
    const channelId = res.snippet.channelId

    apiUrl = `${API_BASE}/channels?part=statistics&id=${channelId}&key=${API_KEY}`
    res = await needle('get', apiUrl, config.options)
    res = res.body.items[0].statistics

    const viewcount = parseInt(res.viewCount).toLocaleString()
    const subs = parseInt(res.subscriberCount).toLocaleString()

    let nameAndDesc = `${channelName}`
    if (snippet && snippet.length > 0) {
      nameAndDesc += ` - ${snippet}`
    }

    return `[YouTube] ${nameAndDesc} | ${subs} subscribers | ${viewcount} total views`
  },

  parseVideo: async function(url) {
    const videoID = module.exports.extractVideoId(url) 
    const apiUrl = `${API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoID}&key=${API_KEY}`

    const res = await needle('get', apiUrl, config.options)
    const data = res.body.items[0]
    const date = moment(data.snippet.publishedAt).format('MMM Do, YYYY')
    const views = Number(data.statistics.viewCount).toLocaleString()
    const duration = module.exports.formatDuration(data.contentDetails.duration)

    return `[${Colors.wrap('light_red', 'YouTube')}] "${data.snippet.title}" by ${data.snippet.channelTitle} `
    +`| ${date} | ${duration} long | ${views} views `
  },

  extractVideoId: function(url) {
    if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2]
    }

    if (url.host === 'youtu.be') {
      return url.pathname.substring(1)
    } else {
      return qs.parse(url.query).v
    }
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
