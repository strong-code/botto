const fs = require('fs')
const db = require('../util/db.js')

/*
 * Observer handler responsible for routing "observables". An observable is
 * anything that should trigger a bot action without an explicit bang command
 * like !this. It can be a certain keyword within a sentence, a user name, etc.
 * Like the commandHandler, this is a simple routing layer and should contain
 * no real logic beyond that (besides very light parsing).
 */

module.exports = class ObserverHandler {

  static observerList = {}

  async init() {
    await db.each('SELECT * FROM observers', [], row => {
      let reqpath = `./${row.name}.js`
      let observer = new (require(reqpath))();
      ObserverHandler.observerList[row.name] = observer
    })

    for (const v of Object.values(ObserverHandler.observerList)) { await v.init() }
    console.log(`Loaded ${Object.keys(ObserverHandler.observerList).length} observer modules`)
  }

  route(bot, from, to, text, message) {
    const opts = {
      from: from,
      to: to,
      text: text,
      raw: message
    }

    // set receiver to the channel if it came from one, otherwise to whoever sent it
    const receiver = (to[0] === '#' ? opts.to : opts.from)

    try {
      for (let [name, observer] of Object.entries(ObserverHandler.observerList)) {
        if (observer.callable(opts)) {
          observer.call(opts, (response) => {
            console.log(`[${name}] observer triggered in ${opts.to} by ${opts.from}\n  -> "${response}"`)
            return bot.say(receiver, response)
          })
        }
      }
    } catch (e) {
      console.log(e)
      return bot.say(receiver, e.message + "; Check logs for more info");
    }

  }

}
