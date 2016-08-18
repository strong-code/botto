const walk       = require('walk');
const linereader = require('line-reader')
const _          = require('lodash');

let cache = {};

module.exports = {

  call: function (opts, respond) {

  },

  warmCache = function () {
    cache = {};
    const walker = walk.walk('./irclogs/Rizon/2016', { followLinks: false });
    const files  = [];

    walker.on('file', (root, stat, next) => {
      if (stat.type === 'file' && _.endsWith(stat.name, '.log')) {
        files.push(root + '/' + stat.name);
        next();
      }
    });

    walker.on('end', () => {
      _.each(files, (file) => {
        linereader.eachLine(file, (line, last) => {
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
          if (last) { return false; }
        });
      });

      console.log('Cache is warm!')
      console.log(cache)
    });
  }

}
