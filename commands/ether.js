const needle = require('needle');
let lastCheck = 0;

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] == '') {
      module.exports.getPrice(respond);
    } else if (opts.args[0] == 'val') {
      module.exports.getValue(opts.args[1], respond)
    }
  },

  getPrice: function(respond) {
    needle.get(url, options, function(err, response) {
      if (err) {
        return respond('Error fetching price. API might be down');
      }

      var results = response.body;
      var eth_usd = parseFloat(results['USDT_ETH']['last']).toFixed(2);
      var message;

      if (eth_usd == lastCheck) {
        message = 'No change | $' + eth_usd;
      } else if (eth_usd > lastCheck) {
        message = 'Upwards movement ^  | $' + eth_usd;
      } else {
        message = 'Downwards movement v | $' + eth_usd
      }

      lastCheck = eth_usd;
      return respond(message);
    });
  },

  getValue: function(amount, respond) {
    needle.get(url, options, function(err, response) {
      if (err) {
        return respond('Error fetching price. API might be down');
      }

      var results = response.body;
      var eth_usd = results['USDT_ETH']['last'];
      var usd_val = (parseFloat(eth_usd) * parseFloat(amount)).toFixed(2)

      return respond('$' + usd_val);
    });
  }

};

var url = 'https://poloniex.com/public?command=returnTicker';

var options = {
  follow: 3,
  open_timeout: 20000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
