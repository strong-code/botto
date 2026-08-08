const exec = require('child_process').exec
const Helpers = require('../../util/helpers.js')
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')
const ObserverHandler = require('../../observers/_observerHandler.js')

/*
 * Pulls the latest changes from upstream, registers any new command/observer
 * modules in the database, then hot-reloads all modules so new code takes
 * effect without a restart.
 */
module.exports = class Update extends Command {

  constructor() {
    super('update')
  }

  call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    respond('Pulling in latest changes from upstream...')

    return exec('git pull', async (err, stdout, stderr) => {
      if (err) {
        return respond(`Failed to pull: ${Helpers.strip(err.message)}. Check logs for more info`)
      }

      if (stdout.includes('Already up to date')) {
        return respond('Already up to date')
      }

      const res = await Helpers.uploadText(stdout)
      let output = `Pulled in new changes.`

      try {
        const cmds = await CommandHandler.sync()
        const obss = await ObserverHandler.sync()
        const failures = cmds.failed.concat(obss.failed)
        output += ` Synced ${cmds.added.length} new command(s) and ${obss.added.length} new observer(s).`
        if (failures.length > 0) {
          output += ` Failed to load: ${failures.join(', ')}.`
        }
      } catch (e) {
        console.error(e)
        output += ` Error syncing new modules: ${e.message}.`
      }

      let reloaded = 0
      for (const name of Object.keys(CommandHandler.commandList)) {
        try {
          if (await CommandHandler.reload(name)) reloaded++
        } catch (e) {
          console.error(`Error reloading command "${name}":`, e)
        }
      }
      for (const name of Object.keys(ObserverHandler.observerList)) {
        try {
          if (await ObserverHandler.reload(name)) reloaded++
        } catch (e) {
          console.error(`Error reloading observer "${name}":`, e)
        }
      }

      output += ` Reloaded ${reloaded} modules.`

      return respond(`${output} Full git output: ${res.body.path}`)
    })
  }

}
