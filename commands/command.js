module.exports = class Command {

  constructor(name) {
    this.name = name

    // lookup command from DB table by this.name and get admin and mounted values
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

