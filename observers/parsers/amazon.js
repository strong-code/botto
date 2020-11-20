const needle = require('needle')
const cheerio = require('cheerio')
const config = require('../../config').url
const client = require('amazon-paapi')
const _ = require('lodash')
const ratingsUrl = 'https://amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='

module.exports = {

  hostMatch: /^(www\.)?(smile\.)?amazon\.com$/,

  parse: function(url, cb) {
    const asin = url.href.match(module.exports.asinRegex)[1]

    if (!asin) {
      console.log('Unable to extract ASIN from ' + url.href)
      return cb(false)
    }

    const requestOpts = { 
      'ItemIds': [asin], 
      'Resources': [
        'ItemInfo.Title', 
        'Offers.Listings.Price', 
        'CustomerReviews.StarRating'
      ]
    }

    client.GetItems(config.amazon, requestOpts)
      .then(data => {
        const item = data.ItemsResult.Items[0]
        const price = item.Offers.Listings[0].Price.Amount
        const desc = _.truncate(item.ItemInfo.Title.DisplayValue, {length: 120})
        
        return { price: price, desc: desc }
      })
      .then(data => {
        return needle.get(ratingsUrl + asin, config.options, (err, res) => {
          
          if (err) {
            console.log(err)
            return cb(`[Amazon] $${data.price} | ${data.desc}`)
          }

          const $ = cheerio.load(res.body)
          const stars = $('.a-icon-alt').text().split(' ')[0]
          const ratings = $('.totalRatingCount').text().split(' ')[0]

          return cb(`[Amazon] $${data.price} | ★ ${stars} (${ratings} ratings) | ${data.desc}`)
        })
      })
      .catch(e => {
        console.log(e)
        cb(false)
      })

  },

  asinRegex: /(?:dp|o|gp|product|-)\/(B[0-9]{2}[0-9A-Z]{7}|[0-9]{9}(?:X|[0-9]))/ 

}
