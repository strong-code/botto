const config = require('../../config').twitch
const { ApiClient } = require('twitch')
const { ClientCredentialsAuthProvider } = require('twitch-auth')

const authProvider = new ClientCredentialsAuthProvider(config.clientId, config.clientSecret)
const client = new ApiClient({ authProvider })

module.exports = {

  hostMatch: /^(www\.)?(clips\.)?twitch\.tv$/,

  parse: async function(url) {
    if (url.host.indexOf('clips') > -1) {
      info = await module.exports.clipData(url)
    } else {
      info = await module.exports.streamData(url)
    }

    return info
  },

  streamData: async function(url) {
    const username = url.path.split('/')[1]

    if (!username || typeof username === undefined) {
      throw new Error('Unable to find username from supplied url')
    }

    const user = await client.helix.users.getUserByName(username)
    let stream = await client.helix.streams.getStreamByUserId(user.id)

    if (stream && stream._data) {
      stream = stream._data
    } else {
      throw new Error(`Unable to get live stream data from API for ${username}. Falling back to default parser.`)
    }

    const viewers = stream.viewer_count.toLocaleString()
    return `[Twitch] ${stream.user_name} is playing ${stream.game_name}: "${stream.title}" | ${viewers} viewers (LIVE)`
  },

  clipData: async function(url) {
    const clipId = url.pathname.split('/')[1]
    let clip = await client.helix.clips.getClipById(clipId)

    if (clip && clip._data) {
      clip = clip._data
    } else {
      throw new Error(`Unable to get clip data from API for ${url.href}. Falling back to default parser.`)
    }

    const views = clip.view_count.toLocaleString()
    const date = new Date(clip.created_at).toDateString()
    return `[Twitch] "${clip.title.trim()}" from ${clip.broadcaster_name} | ${views} views | Clipped on ${date}`
  }
}
