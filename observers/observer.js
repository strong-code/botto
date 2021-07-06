const db = require('../util/db.js')

class Observer {

  constructor(name) {
    this.name = name
  }

  async init() {
    await db.one('SELECT * FROM observers WHERE name = $1', [this.name], row => {
      this.mounted = row.mounted
    })
  }

  mount() {
    if (this.mounted) {
      console.warn(`${this.name} is already mounted`)
      return
    }

    db.none('UPDATE observers SET mounted = $1 WHERE name = $2', [true, this.name])
      .then(() => this.mounted = true)
    
    console.log(`Observer "${this.name}" has been mounted`)
  }

  unmount() {
    if (!this.mounted) {
      console.warn(`${this.name} is already unmounted`)
      return
    }

    db.none('UPDATE observers SET mounted = $1 WHERE name = $2', [false, this.name])
      .then(() => this.mounted = false)

    console.log(`Observer ${this.name} has been unmounted`)
  }
  
}
