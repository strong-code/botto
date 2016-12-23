const needle = require('needle');
const _ = require('lodash');

module.exports = {
  
  call: function (opts, respond) {
    if (_.isEmpty(opts.args)) {
      return respond('Usage is !up <domain>');
    }
    return module.exports.check(opts.args[0], respond);
  },

  check: function (domain, respond) {
    const url = 'https://isitup.org/' + domain + '.json';

    return needle.get(url, options, (err, res) => {
      if (err) {
        return respond(err.message);
      }

      const status = res.body['status_code'];

      if (status === 1) {
        return respond(domain + ' is up (response time: ' + res.body['response_time'] + ' seconds)');
      } else if (status === 2) {
        return respond(domain + ' is currently offline');
      } else {
        return respond(domain + ' is not a valid domain');
      }
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
