const fs = require('fs');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

/*
 * A module for reloading (other) modules. This will purge a named module
 * from the require cache and reload it from disk, effectively hotswapping
 * the updated code (or resetting state, if something gets really fucked up).
 */
module.exports = class Reload extends Command {

  constructor() {
    super('reload')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const moduleName = opts.args[0];
    let numReloaded = 0;

    try {
      if (await CommandHandler.reload(moduleName)) {
        numReloaded++
      }
      
      if (await ObserverHandler.reload(moduleName)) {
        numReloaded++
      }

      if (numReloaded > 0) {
        return respond("Reloaded " + moduleName + " (" + numReloaded + " total)")
      } else {
        return respond(`No observer or command modules named "${moduleName}" found`)
      }
    } catch (e) {
      console.error(e)
      return respond(`Error reloading module "${moduleName}": ${e.message}. Check logs for more info`)
    }
  }
}
