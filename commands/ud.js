const _ = require('lodash');
const needle = require('needle');
const baseUrl = 'http://api.urbandictionary.com/v0/define?term=';

module.exports = {

  call: function (opts, respond) {
    if (_.isEmpty(opts.args)) {
      return respond('Usage is !ud <phrase>');
    } else {
      return module.exports.getDefinition(opts.args, respond);
    }
  },

  getDefinition: function (phraseArray, respond) {
    const phrase = _.join(phraseArray, ' ');
    const apiUrl = baseUrl + _.join(phraseArray, '+');

    return needle.get(apiUrl, options, (err, res) => {
      if (err) {
        return respond(err.message);
      }

      if (!res.body.list) {
        return respond('No definition found for: ' + phrase)
      }
      
      const upper = res.body.list.length - 1;
      const item = res.body.list[_.random(0, upper)]
      if (item) {
        return respond(phrase + ': ' + item.definition + '. Example: ' + item.example);
      }

      return respond('No definition found for: ' + phrase);
    });
  }
}

const options = { 
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
