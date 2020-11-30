const needle = require('needle');
const config = require('../config').url
const API_KEY = require('../config').stock.apiKey
const BASE_URL = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE' 

module.exports = {

  call: async function(opts, respond) {
    const ticker = opts.args[0];
    if (ticker === '') {
      return respond('Usage is !stock <ticker>');
    }

    const info = await module.exports.stockInfo(ticker)
    return respond(info)
  },

  stockInfo: async function(ticker) {
    const API_URL = `${BASE_URL}&symbol=${ticker}&apikey=${API_KEY}`

    const res = await needle('get', API_URL, config)
    const data = res.body['Global Quote']

    if (Object.keys(data).length === 0) {
      return `Unable to fetch stock data for ticker: ${ticker}`
    }

    const price = parseFloat(data['05. price'])
    const vol = data['06. volume'].toLocaleString()
    const change = data['09. change']
    const percent_change = data['10. change percent']

    return `${ticker.toUpperCase()} - $${price} | Volume: ${vol} | Change: ${change} pts (${percent_change})`
  }

}
