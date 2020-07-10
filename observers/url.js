const needle = require('needle');
const cheerio = require('cheerio');
const parser = require('url')
const qs = require('querystring')
const _ = require('lodash');
const config = require('../config.js').url
const parsers = {}
const fs = require('fs')

;(() => {
  fs.readdir('./observers/parsers', (err, files) => {
    files = _.filter(files, (f) => f.slice(-3) === '.js')
    _.forEach(files, (f) => {
      let matcher = require('./parsers/'+f).hostMatch
      parsers[matcher] = f
    })
    console.log(`Loaded URL cache with ${files.length} parsers`)
  })
})()

module.exports = {

  call: function(opts, respond) {
    var match = opts.text.match(regex);

    if (match) {
      const url = parser.parse(match[0].trim())
      if (!url.hostname) { url.hostname = url.href } // hacky but whatever

      if (module.exports.isImage(url.href)) {
        return;
      }

      const pageParser = module.exports.hasOwnParser(url)
      if (pageParser) {
        // delete from cache so parsers get reloaded on !reload url 
        delete require.cache[require.resolve('./parsers/'+pageParser)]
        require('./parsers/'+pageParser).parse(url, (info) => {
          if (info) {
            return respond(info)
          } else {
            // if we get a cb(false) callback, we broke out of parser early 
            // so default to general parser
            module.exports.parsePage(url.href, opts, (info) => respond(info))
          }
        })
      } else {
        module.exports.parsePage(url.href, opts, (info) => respond(info))
      }
    }
  },

  hasOwnParser: function(url) {
    let parserFile = false
    _.forEach(parsers, (v, k) => {
      if (url.hostname.indexOf(k) > -1) {
        console.log(`Using ${v} parser for ${url.hostname}`)
        parserFile = v
      }
    })
    return parserFile
  },

  isImage: function(url) {
    const ignorable = ['jpg', 'png', 'gif', 'webm', 'jpeg', 'mp3', 'mp4']
    const ending = _.last(url.split('.'))
    if (ignorable.indexOf(ending) > -1) { 
      return true
    }
    return false
  },

  parsePage: function(url, opts, cb) {
    needle.get(url, config.options, function(err, response) {
      if (err) {
        return console.log(err);
      } else {
        const title = module.exports.parseTitle(response.body)
        if (!title) {
          console.log(`No title found in response body for ${url}`)
          return
        } else {
          cb(`[URL] ${title}`)
        }
      }
    });
  },

  parseTitle: function(html) {
    console.log(html)
    const $ = cheerio.load(html)
    let title = $('meta[property="og:title"]').attr('content')
    if (!title) {
      title = $('head > title').text()
    }
    title = _.truncate(title, {length: 120}).trim()
    title = title.replace(/[\r\n\t]/g, " ")
    return title
  }
};

// Regex to find all URLs. Works with/without HTTP(S) and even without a TLD.
var expression = /[-a-zA-Z@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);
