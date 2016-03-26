var needle = require('needle');

module.exports = {

  call: function(opts, respond) {
    var url = 'https://poloniex.com/public?command=returnTicker';

    needle.get(url, options, function(err, response) {
      if (err) {
        return respond('Error fetching price. API might be down');
      }

      var results = response.body;
      var btc     = results['BTC_ETH']['last'].slice(0, 7);
      var btc_usd = results['USDT_BTC']['last'].slice(0, 7);
      var eth_vol = parseFloat(results['BTC_ETH']['last']);
      var eth_usd = Math.round(parseFloat(btc) * parseFloat(btc_usd) * 100) / 100;


      return respond('$' + eth_usd);
    });
  }

};

var options = {
  follow: 3,
  open_timeout: 5000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
}
