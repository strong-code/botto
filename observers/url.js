const needle = require('needle')
const cheerio = require('cheerio')
const parser = require('url')
const qs = require('querystring')
const _ = require('lodash')
const config = require('../config.js').url
const fs = require('fs')
const db = require('../util/db.js')
const moment = require('moment')
const Observer = require('./observer.js')

module.exports = class Url extends Observer {

  constructor() {
    const regex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/)
    super('url', regex)
  }

  #parsers = {}

  async init() {
    fs.readdir('./observers/parsers', (err, files) => {
      files = _.filter(files, (f) => f.slice(-3) === '.js')
      _.forEach(files, (f) => {
        // delete from cache so parsers get reloaded when this module is reloaded 
        delete require.cache[require.resolve('./parsers/'+f)]
        let matcher = require('./parsers/'+f).hostMatch
        this.#parsers[f] = matcher
      })
      console.log(`Loaded URL cache with ${files.length} parsers`)
    })

    super.init()
  }

  async call(opts, respond) {
    let url

    try {
      url = parser.parse(opts.text.match(this.regex)[0].trim())
    } catch (e) {
      if (e instanceof TypeError) return
    }

    if (!url.hostname) { url.hostname = url.href } // hacky but whatever

    const posted = await this.previouslyPosted(url, opts.from, opts.to, respond)

    if (posted || !url.host || this.isIgnorable(url)) {
      return
    }

    console.log('GOIT HERE')

    const pageParser = this.hasOwnParser(url)

    if (pageParser) {
      const p = require('./parsers/'+pageParser)
      try {
        let info = await p.parse(url)
        return respond(info)
      } catch (e) {
        console.log(`Error in parser: ${pageParser}`)
        console.error(e)
        this.parsePage(url.href, opts, (info) => respond(info))
      }
    } else {
      this.parsePage(url.href, opts, (info) => respond(info))
    }
  }

  // Some sites we either cant force SSR on or they block our useragent
  // TODO: move this into config or something
  isIgnorable(url) {
    const ignorables = [
      'instagram.com',
      'rei.com',
      'nike.com',
      'vimeo.com'
    ]

    for (let h of ignorables) {
      if (url.host.includes(h)) {
        console.log(`Ignoring host: "${url.host}"`)
        return true
      }
    }

    return this.isImage(url)
  }

  hasOwnParser(url) {
    let parserFile = false
    _.forEach(this.#parsers, (v, k) => {
      if (v.test(url.hostname)) {
        console.log(`Using ${k} parser for ${url.hostname}`)
        parserFile = k
      }
    })
    return parserFile
  }

  isImage(url) {
    const ignorable = ['jpg', 'png', 'gif', 'webm', 'jpeg', 'mp3', 'mp4', 'mov']
    const ending = _.last(url.href.split('.'))

    return ignorable.indexOf(ending) > -1
  }

  async parsePage(url, opts, cb) {
    const res = await needle('get', url, config.options)

    if (res.statusCode === 429) { // probably API rate limiting
      console.log(`HTTP 429: Too mmany requests at url: ${url}`)
      return cb(`[429] HTTP Error: Too many requests. Probably rate limited`)
    } else {
      const title = await this.parseTitle(res.body)
      if (!title) {
        console.log(`No title found in response body for ${url}`)
        return
      } else {
        return cb(`[URL] ${title}`)
      }
    }
  }

  parseTitle(html) {
    const $ = cheerio.load(html)
    let title = $('meta[property="og:title"]').attr('content')
    if (!title) {
      console.log('No meta property found for title. Using html property')
      title = $('head > title').text()
    }
    title = _.truncate(title, {length: 150}).trim()
    title = title.replace(/[\r\n\t]/g, " ")

    if (title == 'Attention Required! | Cloudflare') {
      // DigitalOcean VPN hits cloudflare captcha challenge
      console.log('Hit CloudFlare captcha test - unable to parse page title')
      return
    }

    return title
  }

  async previouslyPosted(url, nick, chan, respond) {
    url = url.href.split('?')[0]

    return await db.oneOrNone('SELECT * FROM urls WHERE url = $1 AND chan = $2', [url, chan])
      .then(row => {
        if (!row) {
          db.none(
            'INSERT INTO urls (time, url, count, original_poster, chan) VALUES ($1, $2, $3, $4, $5)',
            [new Date().toISOString(), url, 1, nick, chan]
          )
          return false
        } else {
          const firstLinked = moment(row.time).calendar('MMM DD YYYY')
          respond(`⚠️ OLD LINK ⚠️ ${nick}, that was already shared by ${row.original_poster} (linked ${row.count} times already, first linked ${firstLinked})`)
          db.none(
            'UPDATE urls SET count = $1 WHERE url = $2 AND chan = $3', [row.count+1, url, chan]
          )
          return true
        }
      })
  }

}
