const _ = require('lodash');

module.exports  = {

  call: function(bot, opts) {
    const healthStatus = module.exports.getHealth();
    return bot.say(opts.to, healthStatus);
  },

  getHealth: function() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    // Only available in node 6.1+, which breaks pg module...
    //const cpu    = process.cpuUsage();

    return `Uptime: ${uptime} seconds | Memory [rss] ${Math.round(Number(memory.rss/1024) * 10) / 10} Kb [heapTotal] ${Math.round(Number(memory.heapTotal/1024) * 10) / 10} Kb [heapUsed] ${memory.heapUsed/1024} Kb`;
  }

};
