const needle = require('needle');
const cheerio = require('cheerio');
const parser = require('url')
const qs = require('querystring')
const _ = require('lodash');
const API_KEY = require('../config.js').youtube.apiKey

module.exports = {

  call: function(opts, respond) {
    var match = opts.text.match(regex);

    if (match) {
      const url = parser.parse(match[0].trim())

      if (module.exports.isImage(url.href)) {
        return;
      } else if (url.hostname === 'www.youtube.com') {
        module.exports.parseYoutube(url, opts, (info) => {
          return respond(info)
        })
      } else {
        module.exports.parsePage(url.href, opts, respond);
      }
    }
  },

  isImage: function(url) {
    if (url.slice(-3) == 'jpg' || url.slice(-3) == 'png' || url.slice(-3) == 'gif') {
      return true;
    }
    return false;
  },
  
  parseYoutube: function(url, opts, cb) {
    const videoID = qs.parse(url.query).v
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
        const info = `[YouTube] "${data.snippet.title}" by ${data.snippet.channelTitle} | ${views} views | ${likes} likes - ${dislikes} dislikes`
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
