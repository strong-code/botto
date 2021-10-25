const Command  = require('./command.js')
const needle   = require('needle')
const _        = require('lodash')
const config   = require('../config').coinmarketcap
const Colors   = require('irc').colors
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol='

module.exports = class Crypto extends Command {

  constructor() {
    super('crypto')
  }

  call(bot, opts, respond) {
    const coin = opts.args[0]
    if (!coin || coin == '') {
      return respond('Usage is !crypto <coin name>')
    }

    this.coinInfo(coin, (info) => respond(info))
  }

  coinInfo(coin, cb) {
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
      if (_.isEmpty(body.data)) {
        return cb(`Unable to find market data for ${coin}`)
      }

      const data = body.data[coin]
      let prices = data.quote.USD
      if (!prices.market_cap) {
        // sometimes we don't get mcap data back
        prices.market_cap = 0
      }

      // Map % change values so we cut off after 2 decimal places and colorize them
      Object.keys(data.quote.USD)
        .filter(k => /^percent_change_.*$/.test(k))
        .forEach(k => {
          const val = parseFloat(prices[k]).toFixed(2)
          const color = ( val > 0 ? 'light_green' : 'light_red') 
          prices[k] = Colors.wrap(color, `${val}%`)
        })

      const curPrice = Colors.wrap('yellow', this.currencyFormat(prices.price))

      const info = `[${data.name}] 1 ${data.symbol} = ${curPrice} ` +
        `| Market cap: ${this.currencyFormat(prices.market_cap, { maximumFractionDigits: 0 })} ` +
        `| 1h: ${prices.percent_change_1h} | 24h: ${prices.percent_change_24h} ` +
        `| 7d: ${prices.percent_change_7d}`

      cb(info)
    })
  }

  currencyFormat(num, _opts) {
    num = Number(num)
    let decimals = 2
    let prefix = ''

    if (num < 1) {
      num = num.toPrecision(2)
      decimals = num.toString().split('.')[1]?.length
      prefix = '$'
    }

    let opts = Object.assign(
      {
        maximumFractionDigits: decimals, 
        minimumFractionDigits: 0,
        style: 'currency',
        currency: 'USD'
      }, _opts)

    return `${prefix}${num.toLocaleString(undefined, opts)}`
  }
}

