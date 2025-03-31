const needle = require('needle');
const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const Command = require('./command.js')
const Colors = require('irc').colors

module.exports = class Stock extends Command {
  
  constructor() {
    super('stock')
  }

  async call(bot, opts, respond) {
    const url = `${BASE_URL}${opts.args[0]}?range=1y&interval=1d`
    const res = await needle('GET', url)

    if (res.body.chart.error) {
      return respond(`${res.body.chart.error.code}: ${res.body.chart.error.description}`)
    }

    const data = this.parseInfo(res.body.chart.result[0])
    const color = ( data.dollarChange > 0 ? 'light_green' : 'light_red' )

    return respond(`[${data.symbol}] (${data.name}) ${Colors.wrap('yellow', data.price)} | 24 hour change: ${Colors.wrap(color, `$${data.dollarChange}`)} (${Colors.wrap(color, data.percentChange)})`)
  }

  parseInfo(payload) {
    const symbol = payload.meta.symbol
    const name = payload.meta.shortName
    const price = `$${payload.meta.regularMarketPrice}`

    const closes = payload.indicators.quote[0].close
    const lastClose = closes[closes.length - 1]
    const prevClose = closes[closes.length - 2]

    const dollarChange = lastClose - prevClose
    const percentChange = (dollarChange / prevClose) * 100

    return {
      symbol: symbol,
      name: name,
      price: price,
      dollarChange: Math.round(dollarChange * 100) / 100,
      percentChange: `${Math.round(percentChange * 100) / 100} %`
    }
  }

}
