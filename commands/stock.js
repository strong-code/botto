const needle = require('needle');
const _ = require('lodash');
const BASE_URL = 'https://finance.google.com/finance';

module.exports = {
  // !stock <stock>
  call: function(opts, respond) {
    let stock = opts.args[0];
    if (stock === ''){
      return respond('Usage is !stock <stock>');
    }

    return module.exports.stockInfo(stock, respond);
  },

  stockInfo: function(stock, respond) {
    stock = _.toLower(stock);
    return needle.get(BASE_URL+'?q='+stock+'&output=json', httpOpts, (err, res, body) => {
      if (err) {
        return respond('Error fetching data from Google Finance');
      }

      try {
        const _stock = JSON.parse(body.substring(3))[0] // drop invalid data
        return respond(`$${_stock.symbol} (${_stock.name}) = $${_stock.l} (${_stock.cp}%)`)
      } catch (e) {
        console.log(e)
        return respond(`Unable to find information for ticker symbol ${stock}`)
      }
    });
  }
};

const httpOpts = {
  follow: 10,
  open_timeout: 10000,
  headers: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  }
};
