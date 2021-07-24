const pgp    = require('pg-promise')
const apiKey = require('../config.js').lastfm.apiKey
const needle = require('needle')
const db     = require ('../util/db.js')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

module.exports = class NowPlaying extends Command {

  constructor() {
    super('nowplaying')
  }
  
  call(bot, opts, respond) {
    if (opts.args[0] == 'add') {
      return this.registerUser(opts.args[1], opts.from, respond);
    } else {
      return this.nowPlaying(opts.from, respond);
    }
  }

  async nowPlaying(ircNick, respond) {
    try {
      const username = await db.one(
        'SELECT last_fm_username FROM last_fm_users WHERE irc_nick = $1', 
        [ircNick], 
        u => u.last_fm_username
      )
      
      const url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + ' +&format=json&nowplaying=true';

      const res =  await needle('get', url, Helpers.httpOptions)

      const nowPlaying = res.body.recenttracks.track[0]
      const artist     = nowPlaying.artist['#text']
      const track      = nowPlaying.name
      const album      = nowPlaying.album['#text']
      const date       = nowPlaying.date ? `(at ${nowPlaying.date['#text']}` : `` // sometimes we dont get date info back

      return respond(`♬ ${ircNick} is listening to "${track}" by ${artist} off of "${album}" ♬ ${date}`)
    } catch (e) {
      console.log(e)

      if (e instanceof pgp.errors.QueryResultError && e.received === 0) {
        return respond(`No last.fm username registered for ${ircNick}. Use !np add <username> to register`)
      }

      return respond(`Error fetching current track from Last.fm API`)
    }
  }

  async registerUser(lastFmNick, ircNick, respond) {
    await db.none(
      'INSERT INTO last_fm_users (last_fm_username, irc_nick, created_at) VALUES ($1, $2, $3)',
      [lastFmNick, ircNick, new Date().toISOString()]
    )
    .then(() => respond(`Registered ${lastFmNick} to ${ircNick}`))
  }

}

