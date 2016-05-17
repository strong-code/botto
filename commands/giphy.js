var _ = require('lodash');
var needle = require('needle');
var giphy = require('../config.js').giphy

module.exports = {

  call: function (opts, respond) {
    if (opts.args.length < 1) {
      return respond('Usage is !giphy <query>');
    } else {
      var query = _.join(opts.args, '+');
      return module.exports.getResults(query, opts.from, respond);
    }
  },

  getResults: function (query, _from, respond) {
    var url = baseUrl + query + '&api_key=' + giphy.apiKey + '&limit=100';
    return needle.get(url, options, function (err, response) {
      if (err) {
        return respond('Error fetching results, API might be down');
      }
      var gifData = response.body.data[_.random(0, 99)];
      return respond('made this dank meme 4 u ' + _from + ': ' + gifData.bitly_url);
    });
  }

};

var baseUrl = 'http://api.giphy.com/v1/gifs/search?q=';

// HTTP client options
var options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
