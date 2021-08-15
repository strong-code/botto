const needle   = require('needle')
const API_URL = `https://api.etherscan.io/api?module=gastracker&action=gasoracle`
const Command  = require('./command.js')

module.exports = class Gas extends Command {
  
  constructor() {
    super('gas')
  }

  call(bot, opts, respond) {
    needle.get(API_URL, (err, res, body) => {
      if (err)
        return respond(err.message)

      if (res.statusCode != 200)
        return respond(`[Error ${body.status.error_code}] ${body.status.error_message}`)

      const block = parseInt(body.result.LastBlock).toLocaleString()
      const avg = body.result.SafeGasPrice
      const fast = body.result.FastGasPrice

      respond(`Average gas price is ${avg} gwei. Fast gas price is ${fast} gwei. Current block is #${block}`)
    })
  }

}
