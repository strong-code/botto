const fs = require('fs');
const _  = require('lodash');

/*
 * A module for reloading (other) modules. This will purge a named module
 * from the require cache and reload it from disk, effectively hotswapping
 * the updated code (or resetting state, if something gets really fucked up).
 */
module.exports = {

  call: function(bot, opts) {
    const moduleName = opts.args[0];
    const dirs = ['./observers/', './commands/', './core/'];
    let numReloaded = 0;

    try {
      _.each(dirs, (dir) => {
        let path = dir + moduleName + '.js';
        fs.access(path, fs.constants.R_OK, (err) => {
          if (!err) {
            delete require.cache[require.resolve('.'+dir+moduleName)];
            numReloaded += 1;
          }
        });
      });

      if (numReloaded === 0) {
        return bot.say(opts.to, "Module \'" + moduleName + "\' not found");
      }

      return bot.say(opts.to, "Reloaded " + moduleName + " (" + numReloaded + " total)");
    } catch (e) {
      console.error(e);
      return bot.say(opts.to, e.message);
    }
  }
};
