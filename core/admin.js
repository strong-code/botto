var admins = require("../config.js").admin;

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
module.exports = {

  // List all admins for a specified channel
  listAdmins: function(channel) {
    if (admins[channel]) {
      return "Admins for " + channel + ": " + admins[channel].join(', ');
    }
    return "No administrators specified for " + channel;
  },
  // Check if a user is an admin for a specified channel
  isAdmin: function(user, channel) {
    if (admins[channel]) {
      return admins[channel].indexOf(user) > -1;
    }
    return false;
  }

};
