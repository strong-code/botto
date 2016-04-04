var weather = require('../config.js').weather;
var needle  = require('needle');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === '') {
      return respond('Must provide city');
    } else {
      return getWeather(opts, respond);
    }
  },

  getWeather: function(opts, respond) {
    var city      = opts.args[1];
    var formedUrl = baseUrl + 'q=' + city + '&appid=' + weather.apiKey + "&units=imperial";
    needle.get(url, options, function(res, err) {
      if (err) {
        return respond(err.message + '; Check logs for details');
      }

      var conditions = res['weather']['main'];
      var temp       = res['main']['temp']
      var name       = res['name'];

      return respond('Current conditions for ' + name + ': currently ' + conditions +
        ' at ' + temp + ' degrees');
    });
  }
};

var baseUrl = "http://api.openweathermap.org/data/2.5/weather";
