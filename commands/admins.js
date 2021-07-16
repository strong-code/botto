const Command = require('./command.js')
const config = require("../config.js")

module.exports = class Admins extends Command {

  constructor() {
    super('admins')
  }

  // List all admins for a specified channel
  call(opts, respond) {
    let admins = `No administrators specified for ${opts.to}`
    const globalAdmins = config.globalAdmins.join(', ')

    if (config.admin[opts.to]) {
      admins = `Admins for ${opts.to}: ${config.admin[opts.to].join(', ')}`
    }
    
    return respond(`${admins}. Global admins: ${globalAdmins}`)    
  }

}
