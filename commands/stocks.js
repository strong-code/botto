const needle = require('needle');
const _ = require('lodash');
const BASE_URL = 'https://finance.google.com/finance';

module.exports = {
  // !stock <stock>
  call: function(opts, respond) {
    let stock = opts.args[0];
    if (stock ==''){
      return respond('Usage is !stock <stock>');
    }

    return module.exports.stockInfo(stock, respond);
  },
  stockInfo: function(stock, respond){
    stock = _.toLower(stock);
    return needle.get(BASE_URL+'?q='+stock+'&output=json', httpOpts, (err, res, body) => {
      if (err) {
        return 'Error fetching data from Google Finance';
      }

      const _stock = JSON.parse(body.substring(3))[0]; // ugly
      return respond(`1 ${_stock.symbol} (${_stock.name}) = $${_stock.l} {_stock.c}%`)
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
