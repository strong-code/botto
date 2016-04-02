var needle = require('needle');
var lastCheck = 0;

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
      var btc     = results['BTC_ETH']['last'].slice(0, 7);
      var btc_usd = results['USDT_BTC']['last'].slice(0, 7);
      var eth_vol = parseFloat(results['BTC_ETH']['last']);
      var eth_usd = Math.round(parseFloat(btc) * parseFloat(btc_usd) * 100) / 100;
      var message;

      if (eth_usd > lastCheck) {
        message = '^ $' + eth_usd;
      } else {
        message = 'v $' + eth_usd
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
      var btc     = results['BTC_ETH']['last'].slice(0, 7);
      var btc_usd = results['USDT_BTC']['last'].slice(0, 7);
      var eth_usd = Math.round(parseFloat(btc) * parseFloat(btc_usd) * 100) / 100;
      var usd_val = Math.round(parseFloat(eth_usd) * parseFloat(amount) * 100) / 100;

      return respond('$' + usd_val);
    });
  }

};

var url = 'https://poloniex.com/public?command=returnTicker';

var options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
