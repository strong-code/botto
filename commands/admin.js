const Command = require('./command.js')
const config = require("../config.js");
const _ = require('lodash');

/*
 * Determine if a supplied user (by nickname) is an admin for the bot as defined
 * in the config file.
 *
 * !admin user123
 */
module.exports = class Admin extends Command {

  constructor() {
    super('admin')
  }

  // List all admins for a specified channel
  call(bot, opts) {
    let admins = "No administrators specified for " + opts.to;
    const globalAdmins = config.globalAdmins.join(', ');

    if (config.admin[opts.to]) {
      admins = "Admins for " + opts.to + ": " + config.admin[opts.to].join(', ');
    };
    
    return bot.say(opts.to, admins + ". Global admins: " + globalAdmins);    
  }

  // Check if a user is an admin for a specified channel
  static isAdmin(user, channel) {
    if (_.includes(config.globalAdmins, user)) {
      return true;
    } else if (config.admin[channel]) {
      return _.includes(config.admin[channel], user);
    }
    return false;
  }

};
