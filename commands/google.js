const needle  = require('needle');
const cheerio = require('cheerio');
const admins  = require ('../core/admin.js');
const cx      = require('../config.js').google.cx;

module.exports = {

  disabled: false,

  call: function(opts, respond) {
    if (module.exports.disabled) { return; }
    if (opts.args[0] == '') {
      respond("Usage is !google <query>");
    } else {
      const query = opts.args.join('+');
      respond(module.exports.makeSearch(query, respond));
    }
  },

  makeSearch: function(query, respond) {
    const queryString = searchUrl + query + '&start=0&sort=&cx=' + cx;
    console.log('searching with: ' + queryString);
    needle.get(queryString, options, function(err, response) {
      if (err) {
        return respond("Error retrieving search results");
      } else if (response.statusCode == 503) {
        module.exports.disabled = true;
        return respond("Spam filter triggered, disabling module. Reload to enable");
      } else {
        var results = module.exports.getSearchResults(response.body);
        if (results && results[0] && results[0].title) {
          return respond("[Google] " + results[0].title + " - " + results[0].url);
        } else {
          return respond("Couldn't find anything :-/");
        }
      }
    });
  },

  getSearchResults: function(html) {
    console.log(html)
    try {
      var $ = cheerio.load(html);
      var results = [];
      $('.g').each(function(i, el) {

        var el = $(el);

        var row = {
          title: el.find('.r').text(),
          url: el.find('.r a').attr('href')
        };

        results.push(row);
        return;
      }.bind(this));

      return results;
    } catch (e) {
      console.error(e);
    }
  }

};

// Base google search URL
//var searchUrl = 'https://cse.google.com/cse.js?cx=' + cx;
const searchUrl = 'https://cse.google.com/cse?oe=utf8&ie=utf8&source=uds&q=';
//test&start=0&sort=&cx=' + cx + '#gsc.tab=0&gsc.q=test&gsc.page=1';

// HTTP client options
var options = {
    follow: 3,
    open_timeout: 5000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  }
