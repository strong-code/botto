const moment = require('moment')
const db = require('../../util/db.js')
const Command = require('../command.js')
const needle = require('needle')
const WEB_URL = 'botto.strongco.de'
const fs = require('fs/promises')
const { execSync } = require('child_process')

module.exports  = class Health extends Command {

  constructor() {
    super('health')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const healthStatus = await this.getHealth()
    return respond(healthStatus)
  }

  async getHealth() {
    const uptime  = moment.duration(process.uptime(), 'seconds').humanize()
    const memory  = this.getMemory()
    const version = process.version
    const modules = await this.getModules()
    const web     = await this.getWebHealth()
    const branch  = this.getGitBranch()

    return `Uptime: ${uptime} | Memory: ${memory}Mb | ${modules} | ` +
      `Node ${version} | Git branch ${branch} | ${WEB_URL} is ${web}`
  }

  getMemory() {
    const memory = process.memoryUsage().rss / 1024576
    return Math.round(Number(memory))
  }

  async getModules() {
    const observers = await db.manyOrNone('SELECT * FROM observers')
    const commands = await db.many('SELECT * FROM commands')
    const parsers = await fs.readdir('./observers/parsers')

    let obsStr = `${observers.filter(o => o.mounted).length} observers`
    let cmdStr = `${commands.filter(c => c.mounted).length} commands`
    const parsersStr = `${parsers.length} URL parsers`

    const unmountedObservers = observers.filter(o => !o.mounted)
    const unmountedCommands = commands.filter(c => !c.mounted)

    if (unmountedObservers.length > 0) {
      obsStr += ` (${unmountedObservers.length} unmounted)`
    }

    if (unmountedCommands.length > 0) {
      cmdStr += ` (${unmountedCommands.length} unmounted)`
    }

    return `${obsStr}, ${cmdStr}, ${parsersStr}`
  }

  async getWebHealth() {
    const res = await needle('get', WEB_URL)

    if (res.statusCode === 200) {
      return 'up [200]'
    } else { 
      return `down [${res.statusCode}]`
    }
  }

  getGitBranch() {
    const branch = execSync('git branch --show-current')
    return branch.toString().trim()
  }

}
