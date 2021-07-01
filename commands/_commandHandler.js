const fs = require('fs');
const admin     = require('../core/admin.js');
const logger    = require('../core/logger.js');
const _         = require('lodash');
const db        = require('../util/db.js')

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */
module.exports = class CommandHandler {

  #commandList = {}

  constructor() {
    db.executeQuery("SELECT * FROM commands", (res, err) => {
      if (err || res.rows.length === 0) {
        console.error('Unable to load commands from commands table!')
      }

      let loaded = 0
      for (const r of res.rows) {
        let cmd = new require('./'+r['name']+'.js')()
        this.commandList[r['name']] = cmd
        loaded++
      }
      console.log(`Loaded ${loaded} command modules`)
    })
  }

  route(bot, from, to, text, message) {
    const opts = this.#makeOptions(bot, from, to, text, message)
    opts.command = this.#respondsTo(opts.command)

    const cmd = this.commandList[opts.command]
    if (cmd) {
      console.log(`command matched in commandlist: ${cmd}. Calling now`)
      cmd.call(opts, (response) => {
        console.log(`![${opts.command.toUpperCase()}] command triggered in ${opts.to} by ${opts.from}\n  -> "${response}"`)
        return bot.say(opts.to, response)
      })
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
      command: String(text.split(' ')[0]).replace('!', '').trim(),
      args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
      raw: message
    };
  }

  static reload(cmd) {
    for (const c of commandList) {
      if (c.name === cmd) {
        commandList = commandList.filter(obj => obj !== c)
        delete require.cache[require.resolve('./'+name+'.js')]
        let module = require('./'+name+'.js')
        let reloadedCommand = new module()
        commandList.push(reloadedCommand)
      }
    }
  }

  static mount(to, cmd) {
    // iterate through commandList and match by name, then call unmount() on obj
  }
};

