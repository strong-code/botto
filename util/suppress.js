const db = require('../util/db.js')

let suppressed = new Set();

function isSuppressed(modname, chan) {
  return suppressed.has(`${modname}.${chan}`)
}

module.exports = {

  init: async() => {
    await db.each('SELECT * FROM suppressed WHERE module = $1 AND chan = $2', [modname, chan], row => {
      suppressed.add(row.module)
    })
    console.log(`Loaded ${suppressed.size} suppression rules.`)
  },

  isSuppressed: isSuppressed,

  add: (modname, chan, respond) => {
    if (isSuppressed(modname, chan)) {
      respond(`${modname} is already suppressed in ${chan}.`)
    } else {
      suppressed.add(`${modname}.${chan}`)
      db.none('INSERT INTO suppressed (module, chan) VALUES ($1, $2)', [modname, chan])
      respond(`${modname} is now suppressed in ${chan}.`)
    }
  },

  remove: (modname, chan, respond) => {
    if (isSuppressed(modname, chan)) {
      suppressed.delete(`${modname}.${chan}`)
      db.none('DELETE FROM suppressed WHERE module = $1 AND chan = $2', [modname, chan])
      respond(`${modname} is no longer suppressed in ${chan}.`)
    } else {
      respond(`${modname} is not currently suppressed in ${chan}.`)
    }
  },

}
