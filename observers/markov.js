const walk       = require('walk');
const linereader = require('line-reader')
const _          = require('lodash');
let isWarmed     = false;
let cache        = {};

module.exports = {

  call: function (opts, respond) {

  },

  warmCache = function () {
    cache = {};
    const walker = walk.walk('./irclogs/Rizon/2016', { followLinks: false });
    let files = [];

    walker.on('file', (root, stat, next) => {
      if (stat.type === 'file' && _.endsWith(stat.name, '.log')) {
        files.push(root + '/' + stat.name);
        next();
      }
    });

    walker.on('end', () => {
      readLines(files);
    });
  },

  readLines: function (files) {
    const linereader = require('readline').createInterface({
      input: require('fs').createReadStream(files.shift());
    });

    linreader.on('line', (line) => {
      let parts = line.split(' ');
      if (parts[1].slice(-1) === ':') {
        let words = parts.slice(2);

        for (i = 0; i < words.length; i++) {
          let curWord  = words[i];
          let nextWord = words[i+1];

          if (cache[curWord]) {
            cache[curWord].push(nextWord);
          } else {
            cache[curWord] = [];
          }
        }
      }
    });

    linereader.on('close', () => {
      if (!files.length || files.length === 0) {
        console.log('Cache has been warmed')
        console.log(cache)
        isWarmed = true;
        return;
      }
      return module.exports.readLines(files);
    });
  }

}
