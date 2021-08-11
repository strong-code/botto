const config = require("../config.js")
const _ = require('lodash')
const needle = require('needle')
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

}
