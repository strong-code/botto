const needle = require('needle')
const config = require('../../config').url

module.exports = {

  hostMatch: /^(www\.)?imdb\.com$/,

  parse: function(url, cb) {
    const movieId = url.pathname.split('/')[2]
    const apiUrl = `http://www.omdbapi.com/?i=${movieId}&apikey=${config.omdb.apiKey}`

    // overwrite bot user agent so we don't trigger CloudFlare
    config.options.headers = { 
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }

    needle.get(apiUrl, config.options, (err, res) => {
      if (err) {
        console.log(err)
        return cb(false)
      }
      const m = res.body
      const info = `[IMDB] "${m.Title}" (${m.Year}) | ${m.Rated} | ${m.Runtime} | ${m.Genre} |`+
        ` ★ ${m.imdbRating} | Directed by ${m.Director} | ${m.Plot}`

      return cb(info)
    })
  }

}
