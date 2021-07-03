const db = require('../util/db.js')

module.exports = class Command {

  constructor(name) {
    this.name = name
  }

  async init() {
    await db.one('SELECT * FROM commands WHERE name = $1', [this.name], row => {
      this.mounted = row.mounted
      this.admin = row.admin
    })
  }

  mount() {
    if (this.mounted) {
      console.warn(`${this.name} is already mounted`)
      return
    }

    db.none('UPDATE commands SET mounted = $1 WHERE name = $2', [true, this.name])
      .then(() => this.mounted = true)
  }

  unmount() {
    if (!this.mounted) {
      console.warn(`${this.name} is already unmounted`)
      return
    }

    db.none('UPDATE commands SET mounted = $1 WHERE name = $2', [false, this.name])
      .then(() => this.mounted = false)
  }

}

