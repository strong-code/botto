const exec = require('child_process').exec
const Command = require('./command.js')

module.exports = class Help extends Command {

  constructor() {
    super('help')
  }

  call(bot, opts, respond) {
    exec("cat ./scripts/help.txt | curl -F 'sprunge=<-' http://sprunge.us", (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      } else {
        respond("Help is on the way: " + stdout);
      }
    })
  }

}
