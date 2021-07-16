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
      for (let observer of Object.values(ObserverHandler.observerList)) {

        if (!observer.mounted) {
          continue
        }

        if (observer.callable(opts)) {
          observer.call(opts, (response) => {
            console.log(`[${observer.name}] observer triggered in ${opts.to} by ${opts.from}\n  -> "${response}"`)
            this.#logEvent(observer, opts, response)
            return bot.say(receiver, response)
          })
        }
      }
    } catch (e) {
      console.log(e)
      return bot.say(receiver, e.message + "; Check logs for more info");
    }

  }

  #logEvent(observer, opts, response) {
    db.none(
      'INSERT INTO observer_events (time, observer_id, nick, sent_to, response) VALUES ($1, $2, $3, $4, $5)',
      [new Date().toISOString(), observer.id, opts.from, opts.to, response]
    )
  }

  static async reload(observer) {
    if (ObserverHandler.observerList[observer]) {
      const path = `./${observer}`

      delete ObserverHandler.observerList[observer]
      delete require.cache[require.resolve(path)]

      const reloadedObserver = new (require(path))();
      await reloadedObserver.init()

      ObserverHandler.observerList[observer] = reloadedObserver
      return true
    }

    return false
  }

}
