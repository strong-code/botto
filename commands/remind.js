const _ = require('lodash');
const regex = /(\d+) (seconds?|minutes?|hours?|days?) (.+)/

module.exports = {
  
  call: function (opts, respond) {
    try {

      let [, count, unit, reminder] = regex.exec(_.join(opts.args, ' '))
      
      const convertedCount = module.exports.toMillis(count, unit)

      if (convertedCount > Math.pow(2,31)-1) { // limitation of setTimeout max millis
        return respond('bruh')
      }

      setTimeout(() => {
        respond(`${opts.from}: ${reminder} (from ${count} ${unit} ago)`)
      }, convertedCount)

      respond(`I will remind you in ${count} ${unit}`)
    } catch (e) {
      console.log(e)
      // TypeError thrown when regex cant match array destructuring
      if (e instanceof TypeError) {
        return respond('Usage is !remind <count> <unit> <message>. <unit> can be seconds, minutes, hours or days.')
      } else {
        return respond('Something went wrong, please check !logs')
      }
    }

  },

  toMillis: function(count, unit) {
    let secs = count
    switch (unit) {
      case 'seconds':
        break
      case 'minutes':
        secs = count * 60
        break
      case 'hours':
        secs = count * 3600
        break
      case 'days':
        secs = count * 86400
        break
    }
    return secs * 1000
  }
}

