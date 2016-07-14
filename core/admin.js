const config = require("../config.js");
const _ = require('lodash');

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
module.exports = {

  // List all admins for a specified channel
  listAdmins: function(channel) {
    if (config.admin[channel]) {
      return "Admins for " + channel + ": " + config.admin[channel].join(', ');
    }
    return "No administrators specified for " + channel;
  },
  // Check if a user is an admin for a specified channel
  isAdmin: function(user, channel) {
    if (_.includes(config.globalAdmins, user)) {
      return true;
    } else if (config.admin[channel]) {
      return _.includes(config.admin[channel], user);
    }
    return false;
  }

};
