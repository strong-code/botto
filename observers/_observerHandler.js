var fs = require('fs');

/*
 * Observer handler responsible for routing "observables". An observable is
 * anything that should trigger a bot action without an explicit bang command
 * like !this. It can be a certain keyword within a sentence, a user name, etc.
 * Like the commandHandler, this is a simple routing layer and should contain
 * no real logic beyond that (besides very light parsing).
 */

 module.exports = function(bot, from, to, text, message) {

   var opts = {
     bot: bot,
     from: from,
     to: to,
     text: text,
     raw: message
   }

   if (opts.text && opts.text[0] != '!') {

     // It's a private message, so respond to the sender
     var receiver = opts.from;

     // It's a a public, channel message
     if (to[0] == '#') {
       receiver = opts.to;
     }

     // Check our observers for anything that may trigger a response
     fs.readdirSync('./observers/').forEach(function (file) {
       require('../observers/'+file)(opts, function(result) {
         bot.say(receiver, result);
       });
     });
   }
 }
