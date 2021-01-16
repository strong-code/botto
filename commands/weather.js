const weather = require('../config.js').weather
const needle  = require('needle')
const _       = require('lodash')
const db      = require('../core/_db.js')

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === '') {
      return module.exports.getUserLocation(opts.from, (city) => {
        if (!city) {
          return respond('No city set for your nick. Set one with !weather set <city>')
        }
        module.exports.getWeather(city, (info) => respond(info))
      })
    } 
    
    if (opts.args[0] === 'set') {
      opts.args.shift()
      const loc = opts.args.join(' ')
      module.exports.setLocation(opts.from, loc, respond, (info) => respond(info))
    } else {
      const city = _.join(opts.args, '%20')
      module.exports.getWeather(city, (info) => respond(info))
    }
  },

  getWeather: function(city, cb) {
    const formedUrl = baseUrl + 'access_key=' + weather.apiKey + '&query=' + city + '&units=f'

    needle.get(formedUrl, options, function(err, res) {
      if (err) {
        return cb(err.message + '; Check logs for details');
      }
      
      if (res.statusCode === 200) {
        const loc = res.body.location
        const current = res.body.current

        if (!current || typeof current === undefined) {
          return cb(`Could not find weather info for location: ${city}`)
        }

        const desc = _.toLower(current.weather_descriptions[0])

        const reply = `Weather for ${loc.name}, ${loc.region}: ${current.temperature}° (feels like ${current.feelslike}°) and ${desc} ` +
        `| Wind is ${current.wind_speed}mph ${current.wind_dir} | Humidity is at ${current.humidity}% ` +
        `| UV index of ${current.uv_index} | Cloud cover of ${current.cloudcover} | Visibility of ${current.visibility}`

        return cb(reply)
      }
      
      return cb('Could not find weather conditions for ' + _.join(opts.args, ' '));
    });
  },

  setLocation: function(nick, city, cb) {
    db.executeQuery({
      text: "INSERT INTO weather_locations (nick, location, date_updated) VALUES ($1, $2, $3)",
      values: [nick, city, new Date().toISOString()]
    }, (res, err) => {
      if (err) {
        return cb('Error setting user weather location. Check logs for more info')
      } else {
        return cb('User location has been set to ' + city)
      }
    })
  },

  getUserLocation: function(nick, cb) {
    db.executeQuery({
      text: "SELECT * FROM weather_locations WHERE NICK = $1",
      values: [nick]
    }, (res, err) => {
      if (err || res.rows.length === 0) {
        return cb(false)
      }
      return cb(res.rows[0]['location'])
    })
  }

};

const baseUrl = "http://api.weatherstack.com/current?"

var options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
};
