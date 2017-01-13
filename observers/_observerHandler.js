const fs = require('fs');

/*
 * Observer handler responsible for routing "observables". An observable is
 * anything that should trigger a bot action without an explicit bang command
 * like !this. It can be a certain keyword within a sentence, a user name, etc.
 * Like the commandHandler, this is a simple routing layer and should contain
 * no real logic beyond that (besides very light parsing).
 */

module.exports = {

  route: function(bot, from, to, text, message) {
    const opts = {
      from: from,
      to: to,
      text: text,
      raw: message
    }

    if (opts.text && opts.text[0] != '!') {

      // It's a private message, so respond to the sender
      let receiver = opts.from;

      // It's a a public, channel message
      if (to[0] == '#') {
        receiver = opts.to;
      }

      const tryCalling = function (observer) {
        try {
          observer.call(opts, (response) => {
            return bot.say(receiver, response);
          });
        } catch (e) {
          return bot.say(receiver, e.message + "; Check logs for more info");
        }
      }

      const isCallable = function (file, observer) {
        return file.slice(-3) === '.js' && typeof observer.call === 'function'
      }

      // Check our observers for anything that may trigger a response
      fs.readdirSync('./observers/').forEach((file) => {
        let observer = require('../observers/'+file);
        if (isCallable(file, observer)) {
          return tryCalling(observer);
        }
      });
    }
  }

};
