const needle = require('needle');
const config = require('../config').url
const API_KEY = require('../config').stock.apiKey
const BASE_URL = 'https://api.stockdata.org/v1/data/quote' 
const Command = require('./command.js')
const Colors = require('irc').colors
const Helpers = require('../util/helpers.js')

module.exports = class Stock extends Command {
  
  constructor() {
    super('stock')
  }

  async call(bot, opts, respond) {
    const ticker = opts.args[0]

    if (ticker === '') {
      return respond('Usage is !stock <ticker>')
    }

    const info = await this.stockInfo(ticker)
    return respond(info)
  }

  async stockInfo(ticker) {
    const API_URL = `${BASE_URL}?symbols=${ticker}&api_token=${API_KEY}` 
    const res = await needle('get', API_URL, config)
    
    if (res.statusCode == 401 || res.statusCode == 429) {
      return 'Rate limit exceeded. Try again later'
    }

    if (res.statusCode == 404 || res.body.data.length == 0) {
      return `Unable to find price data for ticker $${ticker}`
    }

    const stock = res.body.data[0]

    const name = stock.name || stock.ticker
    const color = ( parseFloat(stock.day_change) >= 0 ? 'light_green' : 'light_red' )
    const price = Colors.wrap('yellow', `$${stock.price}`)
    const change = Colors.wrap(color, parseFloat(stock.price - stock.previous_close_price).toFixed(2))
    const changePercent = Colors.wrap(color, stock.day_change) 
    const vol = stock.volume.toLocaleString() 
    const high = stock.day_high 
    const low = stock.day_low 
    const url = await Helpers.shortenUrl(`https://finance.yahoo.com/quote/${ticker}`)

    return `${name}: ${price}`
      + ` | Change: ${change} pts (${changePercent})%`
      + ` | High: $${high} Low: $${low}`
      + ` | Vol: ${vol}`
      + ` | ${url}`
  }

}
