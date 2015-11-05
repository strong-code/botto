var needle = require('needle');
var cheerio = require('cheerio');

module.exports = function(opts, respond) {

  var match = opts.text.match(regex);

  if (match) {
    needle.get(match[0], options, function(err, response) {
      if (err) {
        respond(err.message);
      } else {
        respond("[URL] " + parseTitle(response.body));
      }
    });
  }

};

// Regex to find all URLs. Works with/without HTTP(S) and even without a TLD.
var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);

// HTTP client options
var options = {
    follow: 3,
    open_timeout: 5000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  }

// Extract title from the supplied HTML string
function parseTitle(html) {
  var $ = cheerio.load(html);
  return $('title').text().trim();
}
