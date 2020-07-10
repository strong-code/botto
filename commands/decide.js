const _ = require('lodash')

module.exports = {

  call: function(opts, respond) {
    let choices = opts.args.join(' ').split('or')

    if (choices.length === 1) {
      choices = ['yes', 'no']
    }

    const decision = choices[_.random(choices.length - 1)]
    respond(decision.trim())
  }

}
