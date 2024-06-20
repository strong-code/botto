const Redis = require('./redis.js')
const MAX_MSG_CACHE_LENGTH = 100

module.exports = class MessageCache {

  constructor() {}

  static async put(to, text) {
    const list = `${to}:msgCache`

    if (Redis.lLen(list) >= MAX_MSG_CACHE_LENGTH) {
      if (Math.floor(Math.random() * 5) + 1 === 1) {
        console.log(`Trimming Redis list for ${list}`)
        Redis.lTrim(list, 0, MAX_MSG_CACHE_LENGTH)
      }
    }

    Redis.rPush(list, text)
  }

  static async get(to) {
    const list = `${to}:msgCache`
    return await Redis.lRange(list, 0, MAX_MSG_CACHE_LENGTH)
  }

}
