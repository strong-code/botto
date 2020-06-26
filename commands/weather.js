const weather = require('../config.js').weather;
const needle  = require('needle');
const colors  = require('irc').colors;
const _       = require('lodash');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === '') {
      return respond('Must provide city');
    } else {
      return module.exports.getWeather(opts, (response) => {
        return respond(response)
      });
    }
  },

  getWeather: function(opts, cb) {
    const city      = _.join(opts.args, '%20');
    const formedUrl = baseUrl + 'q=' + city + '&appid=' + weather.apiKey + "&units=imperial";

    needle.get(formedUrl, options, function(err, res) {
      if (err) {
        return cb(err.message + '; Check logs for details');
      }
      if (res.body.cod != 200) {
        return cb(`[HTTP ${res.body.cod}] ${res.body.message}`)
      }

      if (res.body.cod === 200) {
        const main = res.body['main']
        const wind = res.body['wind']
        const desc = res.body['weather'][0]

        const reply = 
          `${res.body['name']}: currently ${main['temp']}° with  ${desc['description']} | `+
          `Feels like ${main['feels_like']}° | `+
          `High of ${main['temp_max']}°, low of ${main['temp_min']}° | `+
          `Wind speed of ${wind['speed']} mph | Humidity at ${main['humidity']}%`
        return cb(reply)
      }
      
      return cb('Could not find weather conditions for ' + _.join(opts.args, ' '));
    });
  },

  colorizeTemp: function(temp) {
    let color;
    if (temp <= 65) {
      color ='cyan';
    } else if (temp > 65 && temp <= 80) {
      color = 'dark_green';
    } else {
      color = 'dark_red';
    }
    return colors.wrap(color, temp);
  },

  _parseCity: function(opts) {
    var args = _.drop(opts.args);
    return _.join(args, '%20');
  }
};

var baseUrl = "http://api.openweathermap.org/data/2.5/weather?";

var options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
};
