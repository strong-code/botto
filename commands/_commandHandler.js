const db = require('../util/db.js')
const Helpers = require('../util/helpers.js')

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */
module.exports = class CommandHandler {

  static commandList = {}

  async init() {
    await db.each('SELECT * FROM commands', [], row => {
      let path = (row.admin ? `./admin/${row.name}` : `./${row.name}`)
      let cmd

      try {
        cmd = new (require(path))();
      } catch (e) {
        console.error(e)
        cmd = { name: row.name, admin: row.admin, mounted: false }
      }

      CommandHandler.commandList[row.name] = cmd
    })

    for (const v of Object.values(CommandHandler.commandList)) {
      try {
        await v.init() 
      } catch {
        continue
      }
    }

    const total = Object.values(CommandHandler.commandList)
    console.log(`Loaded ${total.length} total command modules (${total.filter(x => x.admin).length} admin modules)`)
  }

  route(bot, from, to, text, message) {
    const opts = this.#makeOptions(bot, from, to, text, message)
    const cmd = CommandHandler.commandList[opts.command]

    if (cmd && cmd.mounted) {
      return cmd.call(bot, opts, (response) => {
        console.log(`[${opts.command.toUpperCase()}] command triggered in ${opts.to} by ${opts.from}\n  -> "${response}"`)
        this.#logEvent(cmd, opts, response)
        return bot.say(opts.to, response)
      }) 
    }
  }

  #logEvent(cmd, opts, response) {
    db.none(
      'INSERT INTO command_events (time, command_id, message, nick, sent_to, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString(), cmd.id, opts.text, opts.from, opts.to, response]
    )
  }

  static async reload(cmd) {
    if (CommandHandler.commandList[cmd]) {
      const admin = CommandHandler.commandList[cmd].admin
      let path = (admin ? `./admin/${cmd}.js` : `./${cmd}.js`)

      delete CommandHandler.commandList[cmd]
      delete require.cache[require.resolve(path)]

      try {
        const reloadedCommand = new (require(path))();
        await reloadedCommand.init()
        CommandHandler.commandList[cmd] = reloadedCommand
        return true
      } catch (e) {
        const reloadedCommand = { name: cmd, admin: admin, mounted: false } 
        CommandHandler.commandList[cmd] = reloadedCommand
        throw e 
      } 
    }
    return false
  }

  #respondsTo(command) {
    const alias = require('../util/aliases.js').aliases[command]
    if (typeof alias !== 'undefined') {
      return alias
    }
    return command
  }

  #makeOptions(bot, from, to, text, message) {
    return {
      from: from,
      to: to,
      command: this.#respondsTo(String(text.split(' ')[0]).replace('!', '').trim()),
      args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
      raw: message,
      text: text
    }
  }
}

