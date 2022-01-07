const needle = require('needle')
const cheerio = require('cheerio')
const config = require('../../config').url
const client = require('amazon-paapi')
const _ = require('lodash')
const ratingsUrl = 'https://amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='
const Colors = require('irc').colors

module.exports = {

  hostMatch: /^(www\.)?(smile\.)?amazon\.com$/,

  parse: async function(url) {
    const asin = url.href.match(module.exports.asinRegex)[1]

    if (!asin) {
      throw Error('Unable to extract ASIN from ' + url.href)
    }

    let info = await module.exports.getBaseInfo(asin)

    try {
      const ratings = await module.exports.getRatingInfo(asin)
      info += ' ' + ratings
    } catch (e) {
      console.log(`Unable to fetch stars/rating info. Continuing without ratings`)
    }

    return info
  },

  getBaseInfo: async function(asin) {
    const requestOpts = { 
      'ItemIds': [asin], 
      'Resources': [
        'ItemInfo.Title', 
        'Offers.Listings.Price', 
        'CustomerReviews.StarRating'
      ]
    }

    try {
      const data = await client.GetItems(config.amazon, requestOpts)
      const item = data.ItemsResult.Items[0]
      const price = item.Offers.Listings[0].Price.Amount 
      const desc = _.truncate(item.ItemInfo.Title.DisplayValue, {length: 120})
      return `[${Colors.wrap('orange', 'Amazon')}] $${price} | ${desc}`
    } catch (e) {
      if (e.status === 429) {
        const error = JSON.parse(e.response.error.text).Errors[0]
        throw new Error(`[429] ${error.Message}`)
      }
    }
        
  },

  getRatingInfo: async function(asin) {
    const res = await needle('get', ratingsUrl + asin, config.options)
    const $ = cheerio.load(res.body)
    const stars = $('.a-icon-alt').text().split(' ')[0]
    const ratings = $('.totalRatingCount').text().split(' ')[0]

    if (stars === '' || ratings === '') {
      throw new Error('Triggered bot detection on ratings URL, ignoring')
    }

    return `${Colors.wrap('yellow', `★ ${stars}`)} (${ratings} ratings)`
  },

  asinRegex: /(?:dp|o|gp|product|-)\/(B[0-9]{2}[0-9A-Z]{7}|[0-9]{9}(?:X|[0-9]))/ 

}
