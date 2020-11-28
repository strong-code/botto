const needle = require('needle')
const cheerio = require('cheerio')
const config = require('../../config').url
const client = require('amazon-paapi')
const _ = require('lodash')
const ratingsUrl = 'https://amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='

module.exports = {

  hostMatch: /^(www\.)?(smile\.)?amazon\.com$/,

  parse: async function(url) {
    const asin = url.href.match(module.exports.asinRegex)[1]

    if (!asin) {
      throw Error('Unable to extract ASIN from ' + url.href)
    }

    const requestOpts = { 
      'ItemIds': [asin], 
      'Resources': [
        'ItemInfo.Title', 
        'Offers.Listings.Price', 
        'CustomerReviews.StarRating'
      ]
    }

    const data = await client.GetItems(config.amazon, requestOpts)
    const item = data.ItemsResult.Items[0]
    const price = item.Offers.Listings[0].Price.Amount
    const desc = _.truncate(item.ItemInfo.Title.DisplayValue, {length: 120})
        
    let info = `[Amazon] $${price} | `

    try {
      const res = await needle('get', ratingsUrl + asin, config.options)
      const $ = cheerio.load(res.body)
      const stars = $('.a-icon-alt').text().split(' ')[0]
      const ratings = $('.totalRatingCount').text().split(' ')[0]

      info += `★ ${stars} (${ratings} ratings) | `
    } catch (error) {
      console.log(`Unable to fetch ratings from ratingsUrl\n  ${error.message}`)
    }

    info += desc

    return info
  },

  asinRegex: /(?:dp|o|gp|product|-)\/(B[0-9]{2}[0-9A-Z]{7}|[0-9]{9}(?:X|[0-9]))/ 

}
