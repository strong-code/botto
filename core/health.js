const _ = require('lodash');
const moment = require('moment');

module.exports  = {

  call: function(bot, opts) {
    const healthStatus = module.exports.getHealth();
    return bot.say(opts.to, healthStatus);
  },

  getHealth: function() {
    const uptime  = moment.duration(process.uptime(), 'seconds').humanize()
    const memory  = module.exports.getMemory()
    const version = process.version
    const modules = module.exports.getModules()

    return `Uptime ${uptime} | Memory ${memory}Mb | Modules ${modules} | Node ${version}`
  },

  getMemory: function() {
    const memory = process.memoryUsage().rss / 1024576
    return Math.round(Number(memory))
  },

  getModules: function() {
    return _.filter(require.cache, (v, k) => {
      return !_.includes(k, 'node_modules')
    }).length
  }

};
