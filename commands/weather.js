const weather = require('../config.js').weather
const needle  = require('needle')
const db      = require('../util/db.js')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')
const baseUrl = "http://api.weatherstack.com/current?"

module.exports = class Weather extends Command {

  constructor() {
    super('weather')
  }

  async call(bot, opts, respond) {
    let weather

    if (!opts.args[0]) {
      weather = await this.getWeatherForNick(opts.from)
      return respond(weather)
    }
    
    if (opts.args[0] === 'set') {
      opts.args.shift()
      const loc = opts.args.join(' ')
      const updated = await this.setLocation(opts.from, loc)
      return respond(updated)
    } else {
      Helpers.usersInChan(bot, opts.to, async (nicks) => {
        let match = nicks.find(n => opts.args[0].toLowerCase() == n.toLowerCase())
        if (match) {
          weather = await this.getWeatherForNick(match)
          return respond(weather)
        } else {
          const city = opts.args.join('+')
          weather = await this.getWeather(city)
          return respond(weather)
        }
      })
    }
  }

  async getWeatherForNick(nick) {
    const city = await this.getUserLocation(nick)

    if (!city) {
      return `No city set for ${nick}. They can set one with !weather set <city>`
    } else {
      const weather = await this.getWeather(city)
      return weather
    }
  }

  async getWeather(city) {
    const formedUrl = baseUrl + 'access_key=' + weather.apiKey + '&query=' + city + '&units=f'
    const res = await needle('get', formedUrl, Helpers.httpOptions)

    if (res.statusCode != 200 || !res.body.current) {
      return `Could not find weather info for location: ${city}`
    }

    const loc = res.body.location
    const current = res.body.current
    const desc = current.weather_descriptions[0].toLowerCase()
    current.emoji = await this.getWeatherEmoji(city)

    return `Weather for ${loc.name}, ${loc.region}: ${current.emoji} ${current.temperature}° (feels like ${current.feelslike}°) ` +
    `and ${desc} | Wind is ${current.wind_speed}mph ${current.wind_dir} | Humidity is at ${current.humidity}% ` +
    `| UV index of ${current.uv_index} | Cloud cover of ${current.cloudcover} | Visibility of ${current.visibility}`
  }

  // Return weather forecast emoji, or empty string if none found
  async getWeatherEmoji(city) {
    try {
      const res = await needle('get', `wttr.in/${city}?format='%c\n'`, Helpers.httpOptions)
      return res.body[1]
    } catch (e) {
      console.error(e)
      return ''
    }
  }

  async setLocation(nick, city) {
    const oldCity = await this.getUserLocation(nick)

    if (oldCity) {
      db.none('UPDATE weather_locations SET location = $1 WHERE nick = $2', [city, nick])
      .then(() => console.log(`Location updated for user ${nick}`))
    } else {
      db.none(
        'INSERT INTO weather_locations (nick, location, date_updated) VALUES ($1, $2, $3)',
        [nick, city, new Date().toISOString()]
      ).then(() => console.log(`Location added to weather_locations table for user ${nick}`))
    }

    return `User location set to ${city}`
  }

  async getUserLocation(nick) {
    const row = await db.oneOrNone('SELECT * FROM weather_locations WHERE nick = $1', [nick])
    
    if (row) {
      return row.location.replace(' ', '+')
    }

    return
  }

}

