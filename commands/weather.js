const weather = require('../config.js').weather;
const needle  = require('needle');
const _       = require('lodash');

module.exports = {

  call: function(opts, respond) {
    if (!opts.args || opts.args[0] === '') {
      respond('Usage is !weather <city>, <state>. State is optional')
    } else {
      module.exports.getWeather(opts, (data) => respond(data))
    }
  },

  getWeather: function(opts, cb) {
    const city      = _.join(opts.args, '%20');
    const formedUrl = baseUrl + 'access_key=' + weather.apiKey + '&query=' + city + '&units=f'

    needle.get(formedUrl, options, function(err, res) {
      if (err) {
        return cb(err.message + '; Check logs for details');
      }
      
      if (res.statusCode === 200) {
        const loc = res.body.location
        const current = res.body.current
        const desc = _.toLower(current.weather_descriptions[0])

        const reply = `Weather for ${loc.name}, ${loc.region}: ${current.temperature}° (feels like ${current.feelslike}°) and ${desc} ` +
        `| Wind is ${current.wind_speed}mph ${current.wind_dir} | Humidity is at ${current.humidity}% ` +
        `| UV index of ${current.uv_index} | Cloud cover of ${current.cloudcover} | Visibility of ${current.visibility}`

        return cb(reply)
      }
      
      return cb('Could not find weather conditions for ' + _.join(opts.args, ' '));
    });
  },

  _parseCity: function(opts) {
    var args = _.drop(opts.args);
    return _.join(args, '%20');
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
