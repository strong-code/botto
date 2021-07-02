const db = require('../util/db.js')

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */
module.exports = class CommandHandler {

  static commandList = {}

  async init() {
    let loaded = 0
    
    db.each('SELECT * FROM commands', [], row => {
      let cmd = new (require(`./${row.name}.js`))()
      CommandHandler.commandList[row.name] = cmd
      loaded++
    })
      .then(() => console.log(`Loaded ${loaded} command modules`))
  }

  route(bot, from, to, text, message) {
    const opts = this.#makeOptions(bot, from, to, text, message)
    const cmd = CommandHandler.commandList[opts.command]

    if (cmd && cmd.mounted) {
      if (cmd.admin && !Admin.isAdmin(opts.from, opts.to)) {
        return
      } else {
        cmd.call(opts, (response) => {
          console.log(`[${opts.command.toUpperCase()}] command triggered in ${opts.to} by ${opts.from}\n  -> "${response}"`)
          return bot.say(opts.to, response)
        })
      }
    }
  }

  static reload(cmd) {
    if (CommandHandler.commandList[cmd]) {
      delete CommandHandler.commandList[cmd]
      delete require.cache[require.resolve(`./${cmd}.js`)]
      const reloadedCommand = new (require(`./${cmd}.js`))()
      CommandHandler.commandList[cmd] = reloadedCommand
    }
  }

  #respondsTo(command) {
    const alias = require('./_aliases').aliases[command];
    if (typeof alias !== 'undefined') {
      return alias;
    }
    return command;
  }

  // Helper function to stuff params into an `opts` hash
  #makeOptions(bot, from, to, text, message) {
    return {
      from: from,
      to: to,
      command: this.#respondsTo(String(text.split(' ')[0]).replace('!', '').trim()),
      args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
      raw: message
    };
  }
};

