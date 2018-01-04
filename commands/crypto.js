const needle   = require('needle');
const _        = require('lodash');
const BASE_URL = 'http://api.coinmarketcap.com/v1/ticker/?limit=0';

module.exports = {

  // !crypto <coin>
  call: function(opts, respond) {
    let coin = opts.args[0];
    if (coin == '') {
      return respond('Usage is !crypto <coin name>');
    }

    return module.exports.coinInfo(coin, respond);
  },

  coinInfo: function(coin, respond) {
    coin = _.toLower(coin);
    return needle.get(BASE_URL, httpOpts, (err, res, body) => {
      if (err) {
        return 'Error fetching data from API. It may be down';
      }

      const _coin = _.find(body, (c) => {
        return _.toLower(c.symbol) === coin || _.toLower(c.id) === coin || _.toLower(c.name) === coin;
      });

      if (!_coin) {
        return respond(`Could not find any information for coin '${coin}'`);
      }

      return respond(`1 ${_coin.symbol} (${_coin.name}) = $${_coin.price_usd} | Hourly: ${_coin.percent_change_1h}% | Daily: ${_coin.percent_change_24h}% | Weekly: ${_coin.percent_change_7d}%`)
    });
  }

}

const httpOpts = {
  follow: 10,
  open_timeout: 10000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
};
