const Command = require('./command.js')
const db = require('../util/db.js')

module.exports = class Stats extends Command {

  constructor() {
    super('stats')
  }

  async call(bot, opts, respond) {
    let interval

    switch (opts.args[0]) {
      case 'week':
        interval = '7 days'
        break
      case 'year':
        interval = '1 year'
        break
      default:
        interval = '24 hours'
        break
    }

    const stats = await this.getStats(interval)
    const topCmds = `${stats.topCmds[0][0]} (${stats.topCmds[0][1]}), ${stats.topCmds[1][0]} (${stats.topCmds[1][1]}), ${stats.topCmds[2][0]} (${stats.topCmds[2][1]})`
    return respond(`Stats for ${interval}: ${stats.total} total commands issued. Top 3 commands: ${topCmds}. Top 3 command users: ${stats.topChatters}`) 
  }

  async getStats(interval) {
    const [total, topCmds] = await this.getTopCommands(interval)
    const topChatters = await this.getTopChatters(interval)


    return {
      total: total,
      topCmds: topCmds,
      topChatters: topChatters
    }
  }

  async getTopChatters(interval) {
    return await db.manyOrNone(
      'SELECT nick, count(*) as cmd_count FROM command_events WHERE time >= NOW() - INTERVAL $1 GROUP BY nick ORDER BY cmd_count DESC LIMIT 3',
      [interval]
    )
    .then(rows => {
      let topChatters = ''
      rows.forEach(r => topChatters += `${r.nick} (${r.cmd_count}) `)

      return topChatters
    })
  }

  async getTopCommands(interval) {
    return await db.manyOrNone(
      'SELECT commands.name AS name, command_events.* FROM commands JOIN command_events ON commands.id = command_events.command_id WHERE command_events.time >= NOW() - INTERVAL $1',
      [interval]
    )
    .then(rows => {
      const total = rows.length
      const cmdCount = {}

      rows.forEach(r => {
        cmdCount[`!${r.name}`] = (cmdCount[`!${r.name}`] || 0) + 1
      })

      const topCmds = Object.entries(cmdCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0,3)

      return [total, topCmds]
    })
  }
}
