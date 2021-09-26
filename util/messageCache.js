const MAX_MSG_CACHE_LENGTH = 100

module.exports = class MessageCache {

  static #MSG_CACHE = {}

  static put(from, to, text, time) {
    const msg = {from: from, text: text, time: time}

    if (!this.#MSG_CACHE[to]) {
      this.#MSG_CACHE[to] = []
    }

    if (this.#MSG_CACHE[to].length >= MAX_MSG_CACHE_LENGTH) {
      this.#MSG_CACHE[to].shift()
    }

    this.#MSG_CACHE[to].push(msg)
  }

  static get(to) {
    return this.#MSG_CACHE[to]
  }

}
