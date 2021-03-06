const weather = require('../config.js').weather
const needle  = require('needle')
const _       = require('lodash')
const db      = require('../util/db.js')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')
const baseUrl = "http://api.weatherstack.com/current?"

module.exports = class Weather extends Command {

  constructor() {
    super('weather')
  }

  async call(bot, opts, respond) {
    if (opts.args[0] === '') {
      const city = await this.getUserLocation(opts.from)
      if (!city) {
        return respond('No city set for your nick. Set one with !weather set <city>')
      } else {
        const weather = await this.getWeather(city)
        return respond(weather)
      }
    }
    
    if (opts.args[0] === 'set') {
      opts.args.shift()
      const loc = opts.args.join(' ')
      const updated = await this.setLocation(opts.from, loc)
      return respond(updated)
    } else {
      const city = _.join(opts.args, '%20')
      const weather = await this.getWeather(city)
      return respond(weather)
    }
  }

  async getWeather(city) {
    const formedUrl = baseUrl + 'access_key=' + weather.apiKey + '&query=' + city + '&units=f'

    const res = await needle('get', formedUrl, Helpers.httpOptions)

    if (res.statusCode != 200) {
      return `Could not find weather info for location: ${city}`
    } else {

      const loc = res.body.location
      const current = res.body.current

      if (!current || typeof current === undefined) {
        return `Could not find weather info for location: ${city}`
      }

      const desc = _.toLower(current.weather_descriptions[0])

      const weather = `Weather for ${loc.name}, ${loc.region}: ${current.temperature}° (feels like ${current.feelslike}°) ` +
      `and ${desc} | Wind is ${current.wind_speed}mph ${current.wind_dir} | Humidity is at ${current.humidity}% ` +
      `| UV index of ${current.uv_index} | Cloud cover of ${current.cloudcover} | Visibility of ${current.visibility}`

      return weather
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
      return row.location
    }

    return
  }

}

