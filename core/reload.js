var fs = require('fs');

/*
 * A module for reloading (other) modules. This will purge a named module
 * from the require cache and reload it from disk, effectively hotswapping
 * the updated code (or resetting state, if something gets really fucked up).
 */
module.exports = {

  call: function(bot, opts) {

    var moduleName = opts.args[0];
    var numReloaded = 0;

    try {
      if (fs.existsSync('./observers/'+moduleName+'.js')) {
        delete require.cache[require.resolve('../observers/'+moduleName)];
        numReloaded += 1;
      }
      if (fs.existsSync('./commands/'+moduleName+'.js')) {
        delete require.cache[require.resolve('../commands/'+moduleName)];
        numReloaded += 1;
      }
      if (fs.existsSync('./core/'+moduleName+'.js')) {
        delete require.cache[require.resolve('../core/'+moduleName)];
        numReloaded += 1;
      }
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
