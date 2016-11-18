const fs = require('fs');
const admin = require('../core/admin.js');
const logger = require('../core/logger.js');
const _ = require('lodash');

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */

module.exports = {

  route: function(bot, from, to, text, message) {
    if (text && text[0] == '!') {
      let opts = makeOptions(bot, from, to, text, message);
      opts.command = respondsTo(opts.command);

      if (_.includes(fs.readdirSync('core/'), opts.command+'.js')) {
        if (admin.isAdmin(opts.from, opts.to)) {
          return require('../core/'+opts.command).call(bot, opts);
        }
      } else {
        //console.log('[INFO] ' + opts.from + ' issued  !' + opts.command + ' to ' + opts.to);
        let _msg = 'issued !' + opts.command;
        logger.log(opts.from, opts.to, _msg);
        return publicCommands(bot, opts);
      }
    }
  }

};

/*
* Dynamically require and look up our triggers/commands, allowing for
* hot-swapping of code if something in a module needs to be changed.
*/
function publicCommands(bot, opts) {
  if (fs.existsSync('./commands/' + opts.command + '.js')) {
    try {
      require('./' + opts.command).call(opts, function(response) {
        return bot.say(opts.to, response);
      });
    } catch (e) {
      logger.error(opts.from, opts.to, e);
      return bot.say(opts.to, e.message + "; Check logs for more info");
    }
  }
}

// Returns aliased value if a module would respond to a command
// Used for aliasing commands to modules that have a different name
// i.e. calling !eth for ether.js
function respondsTo(command) {
  const alias = require('./_aliases').aliases[command];
  if (typeof alias !== 'undefined') {
    return alias;
  }
  return command;
}

// Helper function to stuff params into an `opts` hash
function makeOptions(bot, from, to, text, message) {
  return {
    from: from,
    to: to,
    command: String(text.split(' ')[0]).replace('!', '').trim(),
    args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
    raw: message
  };
}
