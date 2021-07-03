module.exports = class Helpers {

  // Strip carriage returns and newline from a given string
  static strip(str, nospace) {
    if (nospace) {
      return str.replace(/\r?\n|\r/g, "")
    } else {
      return str.replace(/\r?\n|\r/g, " ")
    }
  }

}
