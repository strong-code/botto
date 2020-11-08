const _ = require('lodash');
const regex = /(\d+) (seconds?|minutes?|hours?|days?) (.+)/

module.exports = {
  
  call: function (opts, respond) {
    try {
      let [, count, unit, reminder] = regex.exec(_.join(opts.args, ' '))
      count = module.exports.convertCount(count, unit)

      setTimeout(() => {
        respond(opts.from + ': ' + reminder)
      }, count*1000)

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

  validateUnit: function(count, unit) {
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
    return secs
  }
}

