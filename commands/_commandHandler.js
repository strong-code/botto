var fs = require("fs");
var admin = require("../core/admin.js");
/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */

module.exports = {

  route: function(bot, from, to, text, message) {
    if (text && text[0] == '!') {
      var opts = makeOptions(bot, from, to, text, message);
      var receiver = to;

      if (typeof privateCommands[opts.command] === 'function') {
        if (admin.isAdmin(opts.from, opts.to)) {
          return privateCommands[opts.command](bot, opts);
        }
      } else {
        return publicCommands(bot, opts);
      }
    }
  }

};

// A cache for all our "private" commands (bot-admin or internal use only)
var privateCommands = {}

privateCommands.reload = function(bot, opts) {
 return require("../core/reload.js").call(bot, opts);
}

privateCommands.irc = function(bot, opts) {
 return require("../core/irc.js").call(bot, opts);
}

/*
* Dynamically require and look up our triggers/commands, allowing for
* hot-swapping of code if something in a module needs to be changed.
*/
function publicCommands(bot, opts) {
  var command = respondsTo(opts.command);

  if (fs.existsSync('./commands/' + command + '.js')) {
    require('./' + command).call(opts, function(response) {
      return bot.say(receiver, response);
    });
  }
}

// Returns aliased value if a module would respond to a command
// Used for aliasing commands to modules that have a different name
// i.e. calling !eth for ether.js
function respondsTo(command) {
  var respondsTo = undefined;

  if (fs.existsSync('./commands/' + command + '.js')) {
    respondsTo = command;
  } else {
    var alias = require('./_aliases').aliases[command];
    if (typeof alias !== undefined) {
      respondsTo = alias;
    }
  }

  return respondsTo;
}

// Helper function to stuff params into an `opts` hash
function makeOptions(bot, from, to, text, message) {
  var opts = {
    from: from,
    to: to,
    command: String(text.split(' ')[0]).replace('!', '').trim(),
    args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
    raw: message
  };

  return opts;
}
