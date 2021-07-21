const moment = require('moment')
const db = require('../../util/db.js')
const Command = require('../command.js')

module.exports  = class Health extends Command {

  constructor() {
    super('health')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable) return

    const healthStatus = await this.getHealth()
    return respond(healthStatus)
  }

  async getHealth() {
    const uptime  = moment.duration(process.uptime(), 'seconds').humanize()
    const memory  = this.getMemory()
    const version = process.version
    const modules = await this.getModules()

    return `Uptime: ${uptime} | Memory: ${memory}Mb | ${modules} | Node ${version}`
  }

  getMemory() {
    const memory = process.memoryUsage().rss / 1024576
    return Math.round(Number(memory))
  }

  async getModules() {
    const observers = await db.manyOrNone('SELECT * FROM observers')
    const commands = await db.many('SELECT * FROM commands')

    let obsStr = `${observers.filter(o => o.mounted).length} observers mounted`
    let cmdStr = `${commands.filter(c => c.mounted).length} commands mounted`

    const unmountedObservers = observers.filter(o => !o.mounted)
    const unmountedCommands = commands.filter(c => !c.mounted)

    if (unmountedObservers.length > 0) {
      obsStr += ` (${unmountedObservers.length} unmounted)`
    }

    if (unmountedCommands.length > 0) {
      cmdStr += ` (${unmountedCommands.length} unmounted)`
    }

    return `${obsStr}, ${cmdStr}`
  }

}
