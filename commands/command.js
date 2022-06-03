const db = require('../util/db.js')
const Helpers = require('../util/helpers.js')

module.exports = class Command {

  constructor(name, cd = 0) {
    this.name = name
    this.cd = cd*1000
  }

  async init() {
    await db.one('SELECT * FROM commands WHERE name = $1', [this.name], row => {
      this.mounted = row.mounted
      this.admin = row.admin
      this.id = row.id
    })
  }

  adminCallable(opts) {
    if (this.admin) {
      return Helpers.isAdmin(opts.from, opts.to)
    }

    return true
  }

  callable() {
    if (this.cd <= 0) return true

    if (this.timer) {
      console.log(`    ↳ ${this.name} command on cooldown`)
      return false
    } else {
      this.timer = setTimeout(() => {
        delete this.timer
      }, this.cd)
      return true
    }
  }

  mount() {
    if (this.mounted) {
      console.warn(`${this.name} is already mounted`)
      return
    }

    db.none('UPDATE commands SET mounted = $1 WHERE name = $2', [true, this.name])
      .then(() => this.mounted = true)

    console.log(`Command ${this.name} has been mounted`)
  }

  unmount() {
    if (!this.mounted) {
      console.warn(`${this.name} is already unmounted`)
      return
    }

    db.none('UPDATE commands SET mounted = $1 WHERE name = $2', [false, this.name])
      .then(() => this.mounted = false)

    console.log(`Command ${this.name} has been unmounted`)
  }

}

