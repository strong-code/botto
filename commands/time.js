const needle = require('needle')
const Command = require('./command.js')
const Helpers = require('../util/helpers.js')

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const TIME_URL = 'https://timeapi.io/api/Time/current/coordinate'

module.exports = class Time extends Command {

  constructor() {
    super('time')
  }

  async call(bot, opts, respond) {
    if (!opts.args[0]) {
      return respond('Usage is !time <city>')
    }

    const city = opts.args.join(' ')
    const coords = await this.geocode(city)

    if (!coords) {
      return respond(`Could not find time info for location: ${city}`)
    }

    const time = await this.getTime(coords.latitude, coords.longitude)

    if (!time) {
      return respond(`Could not find time info for location: ${city}`)
    }

    return respond(
      `Time in ${coords.name}, ${coords.country}: ${time.time} (${time.dayOfWeek}, ${time.date}) ` +
      `| ${time.timeZone} | DST: ${time.dstActive ? 'yes' : 'no'}`
    )
  }

  async geocode(city) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1`
    const res = await needle('get', url, Helpers.httpOptions)

    if (res.statusCode != 200 || !res.body.results || res.body.results.length === 0) {
      return
    }

    const result = res.body.results[0]
    return {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude
    }
  }

  async getTime(latitude, longitude) {
    const url = `${TIME_URL}?latitude=${latitude}&longitude=${longitude}`
    const res = await needle('get', url, Helpers.httpOptions)

    if (res.statusCode != 200 || !res.body.dateTime) {
      return
    }

    return res.body
  }

}
