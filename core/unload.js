const fs = require('fs');
const _  = require('lodash');

module.exports = {

    call: function(bot, opts) {
      const moduleName = opts.args[0];
      const dirs = ['./observers/', './commands/', './core/'];

      try {
        _.each(dirs, (dir) => {
          let path = dir + moduleName + '.js';
          fs.access(path, fs.constants.R_OK, (err) => {
            delete require.cache[require.resolve('../'+dir+moduleName)];
            return bot.say(opts.to, 'Module ' + moduleName + ' unloaded');
          });
        });
      } catch (e) {
        console.error(e.message);
        return bot.say(opts.to, 'Error unloading module ' + moduleName);
      }
    }
};
