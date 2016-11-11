const _ = require('lodash');
const colors = require('irc').colors;
const moment = require('moment');

module.exports  = {

  call: function(bot, opts) {
    const healthStatus = module.exports.getHealth();
    return bot.say(opts.to, healthStatus);
  },

  getHealth: function() {
    const uptime  = colors.wrap('dark_green', moment.duration(process.uptime(), 'seconds').humanize());
    const memory  = module.exports.getMemory();
    const version = colors.wrap('dark_green', process.version);

    return `Uptime: ${uptime} | Memory ${memory}Mb | Node ${version}`;
  },

  getMemory: function() {
    const memory = process.memoryUsage().rss / 1024576;
    let c = 'dark_green';

    if (memory > 35) {
      c = 'dark_red';
    }
    
    return colors.wrap(c, Math.round(Number(memory)));
  }

};
