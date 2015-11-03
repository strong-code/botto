var fs = require("fs");
var reload = require("./_reload.js");

/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */

 module.exports = function(bot, from, to, text, message) {

   var privateCommands = {}

   var opts = {
     bot: bot,
     from: from,
     to: to,
     command: String(text.split(' ')[0]).replace('!', '').trim(),
     args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
     raw: message
   }

   /*
    * Dynamically require and look up our triggers/commands, allowing for
    * hot-swapping of code if something in a module needs to be changed.
    */
   function publicCommands(opts) {
     if (fs.existsSync('./commands/' + opts.command + '.js')) {
       var output = require('./' + opts.command)(opts);
       if (output) {
         bot.say(sendTo, output);
       }
     }
   }

   privateCommands.reload = function(opts) {
     bot.say(sendTo, reload(opts))
   }

   if (text && text[0] == '!') {
     var sendTo = to;

     if (typeof privateCommands[opts.command] === 'function') {
       privateCommands[opts.command](opts);
     } else {
       publicCommands(opts);
     }
   }
 };
