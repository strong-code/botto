const needle = require('needle');
const cheerio = require('cheerio');
const parser = require('url')
const qs = require('querystring')
const _ = require('lodash');
const config = require('../config.js').url
const snoowrap = require('snoowrap')

module.exports = {

  call: function(opts, respond) {
    var match = opts.text.match(regex);

    if (match) {
      const url = parser.parse(match[0].trim())

      //TODO: have a special matching functions for special case parsers
      if (module.exports.isImage(url.href)) {
        return;
      } else if (url.hostname.indexOf('reddit.com') > -1) {
        module.exports.parseReddit(url, opts, (info) => respond(info))
      } else if (url.hostname === 'www.youtube.com') {
        module.exports.parseYoutube(url, opts, (info) => respond(info))
      } else {
        module.exports.parsePage(url.href, opts, respond);
      }
    }
  },

  isImage: function(url) {
    const ignorable = ['jpg', 'png', 'gif', 'webm', 'jpeg', 'mp3', 'mp4']
    const ending = _.last(url.split('.'))
    if (ignorable.indexOf(ending) > 0) { 
      return true
    }
    return false
  },

  parseReddit: function(url, opts, cb) {
    const r = new snoowrap(config.reddit)
    let thread = url.path.split('/')[4]

    return r.getSubmission(thread).fetch().then(t => {
      const date = new Date(t.created*1000).toLocaleString().split(' ')[0].slice(0,-1)
      const info = `${t.subreddit_name_prefixed}: "${t.title}" posted by u/${t.author.name} on ${date} `+
        `| ${t.ups}↑ - ${t.downs}↓` 
      return cb(info)
    })
  },
  
  parseYoutube: function(url, opts, cb) {
    const videoID = qs.parse(url.query).v
    const API_KEY = config.youtube.apiKey
    const apiUrl  = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoID}&key=${API_KEY}`

    needle.get(apiUrl, options, (err, res) => {
      if (err) {
        console.log(err)
        return respond('Unable to parse details for YouTube video ID ' + videoId)
      } else {
        const data = res.body.items[0]
        const views = Number(data.statistics.viewCount).toLocaleString()
        const likes = Number(data.statistics.likeCount).toLocaleString()
        const dislikes = Number(data.statistics.dislikeCount).toLocaleString()
        const info = `[YouTube] "${data.snippet.title}" by ${data.snippet.channelTitle} `
        +`| ${views} views | ${likes} ↑ - ${dislikes} ↓`
        return cb(info)
      }
    })
  },

  parsePage: function(url, opts, respond) {
    needle.get(url, options, function(err, response) {
      if (err) {
        return console.log(err);
      } else {
        respond("[URL] " + module.exports.parseTitle(response.body));
      }
    });
  },

  parseTitle: function(html) {
    var $ = cheerio.load(html);
    var title = $('head > title').text().trim();
    title = _.truncate(title, {length: 80});
    title = title.replace(/[\r\n\t]/g, " ");
    return title;
  }
};

// Regex to find all URLs. Works with/without HTTP(S) and even without a TLD.
var expression = /[-a-zA-Z@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);

// HTTP client options
var options = {
    follow: 2,
    open_timeout: 4000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  }
