const _ = require('lodash');
const moment = require('moment');
const Command = require('../command.js')

module.exports  = class Health extends Command {

  constructor() {
    super('health')
  }

  call(bot, opts) {
    if (!this.adminCallable) return

    const healthStatus = this.getHealth();
    return bot.say(opts.to, healthStatus);
  }

  getHealth() {
    const uptime  = moment.duration(process.uptime(), 'seconds').humanize()
    const memory  = this.getMemory()
    const version = process.version
    const modules = this.getModules()

    return `Uptime ${uptime} | Memory ${memory}Mb | Modules ${modules} | Node ${version}`
  }

  getMemory() {
    const memory = process.memoryUsage().rss / 1024576
    return Math.round(Number(memory))
  }

  getModules() {
    return _.filter(require.cache, (v, k) => {
      return !_.includes(k, 'node_modules')
    }).length
  }

};
