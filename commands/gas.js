const needle   = require('needle')
const API_URL  = 'https://ethgasstation.info/json/ethgasAPI.json' 
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

      const avgGasInGwei = body.average / 10
      const blockTime = parseInt(body.block_time)
      const block = body.blockNum.toLocaleString()

      respond(`Average gas price is ${avgGasInGwei} gwei. Current block time is ${blockTime} seconds. Current block #${block}.`)
    })
  }

}
