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

    const response = `Stats for ${interval}: ${stats.totalCmds} total commands issued. Top commands: ${stats.topCmds}. Top command users: ${stats.topChatters}. ` +
    `${stats.totalObs} total observers triggered. Top observers: ${stats.topObs}`

    return respond(response)
  }

  async getStats(interval) {
    const [totalCmds, topCmds] = await this.getTopCommands(interval)
    const [totalObs, topObs] = await this.getTopObservers(interval)
    const topChatters = await this.getTopChatters(interval)


    return {
      totalCmds: totalCmds,
      totalObs: totalObs,
      topCmds: topCmds,
      topObs: topObs,
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
        .map(cmd => `${cmd[0]} (${cmd[1]})`).join(", ")

      return [total, topCmds]
    })
  }

  async getTopObservers(interval) {
    return await db.manyOrNone(
      'SELECT observers.name AS name, observer_events.* FROM observers JOIN observer_events ON observers.id = observer_events.observer_id WHERE observer_events.time >= NOW() - INTERVAL $1',
      [interval]
    )
    .then(rows => {
      const total = rows.length
      const obsCount = {}

      rows.forEach(o => {
        obsCount[o.name] = (obsCount[o.name] || 0) + 1
      })

      const topObservers = Object.entries(obsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0,3)
        .map(obs => `${obs[0]} (${obs[1]})`).join(", ")

      return [total, topObservers]
    })
  }
}
