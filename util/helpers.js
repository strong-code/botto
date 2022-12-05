const config = require("../config.js")
const _ = require('lodash')
const needle = require('needle')
const { execSync } = require('child_process')
const STRONGCODE_API = require('../config.js').logs.api

module.exports = class Helpers {

  // Strip carriage returns and newline from a given string
  static strip(str, nospace) {
    if (nospace) {
      return str.replace(/\r?\n|\r/g, "")
    } else {
      return str.replace(/\r?\n|\r/g, " ")
    }
  }

  // Common HTTP request options
  static httpOptions = {
    follow: 3,
    open_timeout: 20000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  }
  
  // Check if a user is an admin for a specified channel
  static isAdmin(user, channel) {
    if (_.includes(config.globalAdmins, user)) {
      return true
    } else if (config.admin[channel]) {
      return _.includes(config.admin[channel], user)
    }
    return false
  }

  // Uploads supplied text to strongco.de API and returns paste url
  static uploadText(text) {
    return needle('post', STRONGCODE_API, `text=${text}`)
  }

  static truncate(str, length, trail = '') {
    if (length >= str.length) {
      return str
    }

    return `${str.substr(0, length)}${trail}`
  }

  // Perform cb() against array of usernames in supplied channel
  static async usersInChan(bot, chan, cb) {
    bot.addListener(`names${chan}`, (nicks) => {
      cb(Object.keys(nicks))
      bot.removeAllListeners(`names${chan}`)
    })

    bot.send('NAMES', chan)
  }

  static didYouMean(seed) {
    let results = execSync(`find ./commands/ -name '${seed}*' -printf "%f\n"`).toString().split('\n')
    results = results
      .filter(x => x.length > 0)
      .map(x => x.substring(0, x.length - 3))
      .map(x => '!'+x)
      .join(', ')

    if (results.length == 0) {
      return `I don't know that command`
    } else {
      return `Did you mean ${results} or something else?`
    }
  }

}
