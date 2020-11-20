const needle = require('needle')
const config = require('../../config').url

module.exports = {

  hostMatch: /^(www\.)?imdb\.com$/,

  parse: function(url, cb) {
    const movieId = url.pathname.split('/')[2]
    const apiUrl = `http://www.omdbapi.com/?i=${movieId}&apikey=${config.omdb.apiKey}`

    needle.get(apiUrl, config.options, (err, res) => {
      if (err) {
        console.log(err)
        return respond('Unable to parse details for IMDB ID ' + movieId)
      }
      const m = res.body
      console.log(m)
      const info = `[IMDB] "${m.Title}" (${m.Year}) | ${m.Rated} | ${m.Runtime} | ${m.Genre} |`+
        ` ★ ${m.imdbRating} | Directed by ${m.Director} | ${m.Plot}`

      return cb(info)
    })
  }

}
