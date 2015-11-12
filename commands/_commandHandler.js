var fs = require("fs");
var _reload = require("../core/_reload.js");
var admin = require("../core/admin.js");

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */

 module.exports = function(bot, from, to, text, message) {

   var privateCommands = {}

   /*
    * Dynamically require and look up our triggers/commands, allowing for
    * hot-swapping of code if something in a module needs to be changed.
    */
   function publicCommands(opts) {
     if (fs.existsSync('./commands/' + opts.command + '.js')) {
       require('./' + opts.command).call(opts, function(response) {
         bot.say(receiver, response);
       });
     }
   }

   privateCommands.reload = function(opts) {
     if (!admin.isAdmin(opts.from, opts.to)) {
       return;
     } else {
       bot.say(receiver, _reload(opts))
     }
   }

   if (text && text[0] == '!') {
     var opts = makeOptions(bot, from, to, text, message);
     var receiver = to;

     if (typeof privateCommands[opts.command] === 'function') {
       privateCommands[opts.command](opts);
     } else {
       publicCommands(opts);
     }
   }
 };

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
