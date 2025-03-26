const Redis = require('./redis.js')
const MAX_MSG_CACHE_LENGTH = 100

module.exports = class MessageCache {

  constructor() {}

  static async put(to, text, from = '') {
    const list = `${to}:msgCache`
    const quotes = `${to}:${from}`


    if (Redis.lLen(quotes) >= MAX_MSG_CACHE_LENGTH) {
      if (Math.floor(Math.random() * 5) + 1 === 1) {
        console.log(`Trimming Redis list for ${quotes}`)
        Redis.lTrim(quotes, 0, MAX_MSG_CACHE_LENGTH)
      }
    }

    if (Redis.lLen(list) >= MAX_MSG_CACHE_LENGTH) {
      if (Math.floor(Math.random() * 5) + 1 === 1) {
        console.log(`Trimming Redis list for ${list}`)
        Redis.lTrim(list, 0, MAX_MSG_CACHE_LENGTH)
      }
    }

    const msg = `<${from}>: ${text}`
    Redis.lPush(quotes, text)
    Redis.lPush(list, msg)
  }

  // All messages in a chan
  static async get(to) {
    const list = `${to}:msgCache`
    return await Redis.lRange(list, 0, -1)
  }

  // All quotes for a user in a chan
  static async getQuoteList(to, nick) {
    const quotes = `${to}:${nick}`
    return await Redis.lRange(quotes, 0, -1)
  }

  static clear(to) {
    Redis.del(`${to}:msgCache`)
  }

}
