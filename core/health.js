const _ = require('lodash');

module.exports  = {

  call: function(bot, opts) {
    const healthStatus = getHealth();
    return bot.say(opts.to, healthStatus);
  },

  getHealth: function() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const cpu    = process.cpuUsage();

    return `Uptime: ${uptime} | Memory [rss] ${memory.rss/1024}Kb
    [heapTotal] ${memory.heapTotal/1024}Kb [heapUsed] ${memory.heapUsed/1024}Kb |
    CPU [user] ${cpu.user} [system] ${cpu.system}`;
  }

};
