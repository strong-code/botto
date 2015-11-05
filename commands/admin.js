var admins = require("../config.js").admin;

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
module.exports = function (opts, respond) {
  var channel = opts.to;
  var nick = opts.args[0];

  if (admins[channel]) {
    respond(admins[channel].indexOf(nick) > -1);
  }
};
