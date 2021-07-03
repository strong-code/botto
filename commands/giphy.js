const _ = require('lodash');
const needle = require('needle');
const giphy = require('../config.js').giphy
const Command = require('./command.js')
const baseUrl = 'http://api.giphy.com/v1/gifs/search?q='

// HTTP client options
const options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}

module.exports = class Giphy extends Command {

  constructor() {
    super('giphy')
  }

  call(opts, respond) {
    if (opts.args.length < 1) {
      respond('Usage is !giphy <query>');
    } else {
      const query = _.join(opts.args, '+');
      this.getResults(query, opts.from, (info) => respond(info));
    }
  }

  getResults(query, _from, cb) {
    const url = baseUrl + query + '&api_key=' + giphy.apiKey + '&limit=100';
    return needle.get(url, options, function (err, response) {
      if (err || response.statusCode != 200) {
        const errMsg = `[${response.statusCode}] ${response.body.message}` || 'API might be down'
        return cb(errMsg)
      }
      if (response.body.data.length === 0) {
        return cb('couldnt find a dank enough meme 4 that one');
      }
      const gifData = response.body.data[_.random(0, response.body.data.length)];
      return cb('made this dank meme 4 u ' + _from + ': ' + gifData.bitly_url);
    });
  }

}

