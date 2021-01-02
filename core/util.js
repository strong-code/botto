module.exports = {

  // Strip carriage returns and newline from a given string
  strip: function(str, nospace) {
    if (nospace) {
      return str.replace(/\r?\n|\r/g, "")
    } else {
      return str.replace(/\r?\n|\r/g, " ")
    }
  }

}
