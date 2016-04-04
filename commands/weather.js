var weather = require('../config.js').weather;
var needle  = require('needle');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === '') {
      return respond('Must provide city');
    } else {
      return module.exports.getWeather(opts, respond);
    }
  },

  getWeather: function(opts, respond) {
    var city      = opts.args[0];
    var formedUrl = baseUrl + 'q=' + city + '&appid=' + weather.apiKey + "&units=imperial";
    needle.get(formedUrl, options, function(err, res) {
      if (err) {
        return respond(err.message + '; Check logs for details');
      }
      var conditions = res.body['weather']['main'];
      var temp       = res.body['main']['temp']
      var name       = res.body['name'];

      return respond('Current conditions for ' + name + ': currently ' + conditions +
        ' at ' + temp + ' degrees');
    });
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
