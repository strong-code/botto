const needle = require('needle')
const config = require('../../config').url

module.exports = {

  hostMatch: /^(www\.)?imdb\.com$/,

  parse: async function(url) {
    const movieId = url.pathname.split('/')[2]

    if (!movieId) {
      throw Error('Unable to parse movieId from url, using default parser')
    }

    const apiUrl = `http://www.omdbapi.com/?i=${movieId}&apikey=${config.omdb.apiKey}`

    // overwrite bot user agent so we don't trigger CloudFlare
    config.options.headers = { 
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }

    const res = await needle('get', apiUrl, config.options)
    const m = res.body

    if (m.Error) {
      return m.Error
    }

    return `[IMDB] "${m.Title}" (${m.Year}) | ${m.Rated} | ${m.Runtime} | ${m.Genre} |`+
      ` ★ ${m.imdbRating} | Directed by ${m.Director} | ${m.Plot}`
  }

}
