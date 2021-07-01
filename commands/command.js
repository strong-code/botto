const db = require('../util/db.js')

module.exports = class Command {

  constructor(name) {
    this.name = name

    db.executeQuery({
      text: "SELECT * FROM commands WHERE name = $1",
      values: [this.name]
    }, (res, err) => {
      if (err || res.rows.length === 0) {
        console.err(`Error loading command ${this.name} from db: ${err}`)
      }

      console.log(res.rows[0])
      this.mounted = res.rows[0]['mounted']
      this.admin = res.rows[0]['admin']
      console.log(`[${this.name}] command successfully loaded. MOUNTED: ${this.mounted}. ADMIN: ${this.admin}.`)
    }
  }

  mount() {
    if (this.mounted) {
      return
    }

    // db code to mark as mounted
    this.mounted = true
  }

  unmount() {
    if (!this.mounted) {
      return
    }

    // db code to mark as unmounted
    this.mounted = false
  }

}

