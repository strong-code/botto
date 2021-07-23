const needle = require('needle')
const Helpers = require('../../util/helpers.js')

module.exports = {

  hostMatch: /^(www\.)?(store\.)?steampowered\.com$/,

  parse: async function(url) {
    const appId = url.path.split('/')[2]
    const res = await needle('get', `https://store.steampowered.com/api/appdetails?appids=${appId}`)

    const game = res.body[appId]
    const name = game.data.name
    const desc = game.data.short_description
    const site = game.data.website
    const genres = game.data.genres.map(g => g.description).join(', ')
    let price
    let release

    if (game.data.release_date.coming_soon) {
      price = ''
      release = `Comes out on ${game.data.release_date.date}`
    } else {
      price = game.data.price_overview.final_formatted
      release = game.data.release_date.date
    }

    return `[Steam] ${name}: ${desc}. (${genres}) ${release} ${price}`
  }

}
