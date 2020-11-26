const needle   = require('needle')
const _        = require('lodash')
const config   = require('../config').coinmarketcap
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol='

module.exports = {

  // !crypto <coin>
  call: function(opts, respond) {
    const coin = opts.args[0]
    if (!coin || coin == '') {
      return respond('Usage is !crypto <coin name>')
    }

    module.exports.coinInfo(coin, (info) => respond(info))
  },

  coinInfo: function(coin, cb) {
    coin = _.toUpper(coin).trim()
    const opts = { headers: { 'X-CMC_PRO_API_KEY': config.apiKey } }
    const endpoint = BASE_URL + coin + '&convert=USD'

    needle.get(endpoint, opts, (err, res, body) => {
      if (err) {
        return cb(err.message)
      }
      if (res.statusCode != 200) {
        return cb(`[Error ${body.status.error_code}] ${body.status.error_message}`)
      }

      const data = body.data[coin]
      let prices = data.quote.USD
      if (!prices.market_cap) {
        // sometimes we don't get mcap data back
        prices.market_cap = 0
      }
      const digits = { minimumFractionDigits: 3 }
      let info = `[${data.name}] 1 ${data.symbol} = $${prices.price.toLocaleString(undefined, digits)} ` +
        `| Market cap: $${prices.market_cap.toLocaleString().split('.')[0]} `

      // Map % change values so we cut off after 2 decimal places
      prices = _.mapValues(data.quote.USD, (v) => parseFloat(v).toFixed(2))
      info += `| 1h change: ${prices.percent_change_1h}% | 24h change: ${prices.percent_change_24h}% ` +
        `| 7d change: ${prices.percent_change_7d}%`

      cb(info)
    })
  }
}
