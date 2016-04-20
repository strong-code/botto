var db = require('../core/_db.js');
var _       = require('lodash');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] === '') {
      return response(_.sample(quotes));
    } else if (opts.args[0] === 'add') {
      var quote = _.drop(opts.args);
      quote.push(_.join(quote, ' '));
      return respond('Fuckin sick ass quote dude I def added that shit');
    }
  }

  quotes: [
    'sometimes smokin, sometimes tokin but NEVER jokin',
    'so skoned right now',
    'wat kinda papers r these?',
    'ya im hi (on pot )',
    'wats up my blaze brother',
    'box hotting my room rite now lmao soo smokey B)',
    '4 2 0  T I L L  I  D I E',
    'ya i do pot/weed',
    'hit this bro its fucken frosty',
    'fuck im rly hi (on weed)',
    'u do ganja rite ??',
    'jesus = dank',
    'fuk i think im too hi call 911'
  ];

};
