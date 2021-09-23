const { exec } = require('child_process')
const Command = require('./command.js')

module.exports = class Help extends Command {

  constructor() {
    super('help')
  }

  call(bot, opts, respond) {
    return exec("cat scripts/help.txt | curl -F 'text=<-' http://strongco.de/api/paste", (error, stdout, stderr) => {
      if (error) {
        console.error(error)
        return respond(`Error uploading help text. Please notify an admin`)
      } else {
        const res = JSON.parse(stdout)
        return respond(`Help is on the way: ${res.path}`)
      }
    })
  }

}
