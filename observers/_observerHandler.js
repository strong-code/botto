const fs = require('fs')
const db = require('../util/db.js')
const suppress = require('../util/suppress.js')

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

    // Register and load any observer files on disk that aren't in the database
    // yet, so new observers are picked up after a git pull + restart without
    // any manual database seeding.
    const { added, failed } = await ObserverHandler.sync()
    if (added.length > 0) {
      console.log(`Auto-registered new observer modules: ${added.join(', ')}`)
    }
    if (failed.length > 0) {
      console.log(`Skipped unloadable observer modules: ${failed.join(', ')}`)
    }

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

        if (!observer.mounted || suppress.isSuppressed(observer.name, opts.to)) {
          continue
        }

        if (observer.callable(opts)) {
          observer.call(opts, (response) => {
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
    console.log(`    ↳ ${observer.name} observer triggered by ${opts.from} -> ${response}`)
    db.none(
      'INSERT INTO observer_events (time, observer_id, message, nick, sent_to, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString(), observer.id, opts.text, opts.from, opts.to, response]
    )
  }

  static async reload(observer) {
    if (ObserverHandler.observerList[observer]) {
      const path = `./${observer}`

      delete ObserverHandler.observerList[observer]
      delete require.cache[require.resolve(path)]

      try {
        const reloadedObserver = new (require(path))();
        await reloadedObserver.init()
        ObserverHandler.observerList[observer] = reloadedObserver
        return true
      } catch (e) {
        const reloadedObserver = { name: observer, mounted: false }
        ObserverHandler.observerList[observer] = reloadedObserver
        throw e
      }
    }

    return false
  }

  // Scan the filesystem for observer modules that aren't already registered in
  // the database or loaded into the handler. Registers any new ones and loads
  // them on the fly, so new observers can be hot-added without a restart.
  // Returns { added: [...], failed: [...] }.
  static async sync() {
    const added = []
    const failed = []

    for (const file of fs.readdirSync(__dirname)) {
      if (!file.endsWith('.js') || file.startsWith('_') || file === 'observer.js') {
        continue
      }

      const name = file.slice(0, -3)
      if (ObserverHandler.observerList[name]) {
        continue
      }

      const row = await db.oneOrNone('SELECT * FROM observers WHERE name = $1', [name])
      if (!row) {
        await db.none('INSERT INTO observers (name) VALUES ($1)', [name])
      }

      try {
        const observer = new (require(`./${name}.js`))()
        await observer.init()
        ObserverHandler.observerList[name] = observer
        added.push(name)
      } catch (e) {
        console.error(`Failed to load new observer "${name}":`, e)
        failed.push(name)
        if (!row) {
          await db.none('DELETE FROM observers WHERE name = $1', [name])
        }
      }
    }

    return { added, failed }
  }

}
