var admins = require("../config.js").admin;

/*
 * All commands should export a single function which acts as a routing layer
 * for calling the appropriate, non-exported function.
 */
module.exports = function (opts) {
  if (opts.args.length == 0 || opts.to[0] != '#') {
    return
  } else {
    return isAdmin(opts.args[0], opts.to);
  }
};

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
function isAdmin(nick, channel) {
  if (admins[channel]) {
    return admins[channel].indexOf(nick) > -1;
  }
}
