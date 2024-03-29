const Command = require('./command.js')
const needle = require('needle')
const config = require('../config').url.youtube
const API_BASE = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
const Colors = require('irc').colors
const decode = require('unescape')

module.exports = class Youtube extends Command {

  constructor() {
    super('youtube')
  }

  async call(bot, opts, respond) {
    if (opts.args.length === 0) {
      return
    }

    const query = opts.args.join(' ')
    const res = await needle('get', `${API_BASE}&q=${query}&key=${config.apiKey}`)

    if (!res.body.items || res.body.items.length === 0) {
      return respond('Unable to find any matching videos')
    }

    const url = 'https://youtu.be/' + res.body.items[0].id.videoId
    const vid = res.body.items[0].snippet
    const title = decode(vid.title, 'all')

    let description = `[${Colors.wrap('light_red', 'YouTube')}] "${title}" by ${vid.channelTitle} | ${url}`

    return respond(description)
  }
}
