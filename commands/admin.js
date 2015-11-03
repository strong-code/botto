// var config = require("../config.js");

module.exports = function (opts) {
  return isAdmin(opts.args[0], opts.to);
};

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
function isAdmin(nick, channel) {
  return "Given " + nick + " in " + channel;
}
