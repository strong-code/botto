var fs = require('fs');

/*
 * A module for reloading (other) modules. This will purge a named module
 * from the require cache and reload it from disk, effectively hotswapping
 * the updated code (or resetting state, if something gets really fucked up).
 */

module.exports = function(opts) {

  var moduleName = opts.args[0];

  try {
    console.log("Attempting to reload " + moduleName);

    if (fs.existsSync('./observers/'+moduleName+'.js')) {
      delete require.cache[require.resolve('../observers/'+moduleName)];
    } else if (fs.existsSync('./commands/'+moduleName+'.js')) {
      delete require.cache[require.resolve('../commands/'+moduleName)];
    } else {
      return "Module \'" + moduleName + "\' not found";
    }

    return "Reloaded " + moduleName;
  } catch (e) {
    console.log("Error while attempting to reload " + moduleName);
    console.log(e);
    return e.message;
  }

};
