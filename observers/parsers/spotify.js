const needle = require('needle')
const config = require('../../config.js').spotify
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?open\.spotify\.com$/,

  parse: async function(url) {
    if (url.pathname.split('/')[1] !== 'track') {
      console.log('Not a track URL, ignoring')
      return
    }

    const trackId = url.pathname.split('/')[2]

    const tokenPayload = {
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret
    }

    const token = await needle('post', 'https://accounts.spotify.com/api/token', tokenPayload)

    if (token && token.body.access_token) {
      const trackEndpoint = `https://api.spotify.com/v1/tracks/${trackId}`
      const opts = { headers: { 'Authorization': `Bearer ${token.body.access_token}` } }
      const res = await needle('get', trackEndpoint, opts)

      const track = res.body.name
      const album = res.body.album.name
      const albumRelease = res.body.album.release_date
      const artist = res.body.artists[0].name
      const popularity = res.body.popularity

      return `[${Colors.wrap('light_green', 'Spotify')}] "${track}" by ${artist} off of ${album} (${albumRelease}). Rated ${popularity}%`
    } else {
      return console.log('Unable to retrieve access token with current creds')
    }
  }

}
