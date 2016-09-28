const _          = require('lodash');
let isWarmed     = false;
let cache        = {};

module.exports = {

  call: function (opts, respond) {
    const text = opts.text.split(' ');    
    if (_.includes(text, 'botto')) {
      let seed = _.sample(text);
      if (text.length > 1) {
        seed = _.sample(_.tail(text));
      }
      return module.exports.generate(seed, respond);
    }  
  },

  generate: function (seed, respond) {
    const minLength = _.random(2, 15);
    let chain = [seed];

    while (true) {
      const cand = _.sample(cache[_.takeRight(chain)])
      console.log('plucked cand: ' + cand);
      if (cand) {
        chain.push(cand.trim());
      } else {
        if (chain.length > minLength) {
          break;
        }
        let randKey = _.sample(_.keys(cache));
        const randCand = _.sample(cache[randKey]);
        if (randCand) {
          chain.push(randCand.trim());
        }
      }
    }

    console.log('created chain: ' + chain.join(' '));
    return respond(chain.join(' '));
  },

  warmCache: function () {
    cache = {};
    const execFile = require('child_process').execFile;

    execFile('find', ['/root/irclogs/Rizon/#lifting/'], (err, stdout, stderr) => {
      let files = stdout.split('\n');
      files = _.filter(files, (f) => {
        return _.endsWith(f, '.log');
      });
      return module.exports.readLines(files)
    });
  },

  readLines: function (files) {
    const linereader = require('readline').createInterface({
      input: require('fs').createReadStream(files.shift())
    });

    linereader.on('line', (line) => {
      let parts = line.split(' ');
      if (parts[1].slice(-1) === ':') {
        let words = parts.slice(2);
        
        for (var i = 0; i < words.length; i++) {
          let curWord  = words[i].trim();
          let nextWord = words[i+1];

          if (nextWord) {
            nextWord = nextWord.trim();
          }

          if (cache[curWord]) {
            try {
             cache[curWord].push(nextWord);
            } catch (e) {
              console.log('skipping \'' + nextWord + '\' during cache warmup');
            }
          } else {
            cache[curWord] = [];
          }
        }
      }
    });

    linereader.on('close', () => {
      if (!files.length || files.length === 0) {
        console.log('Cache has been warmed')
        isWarmed = true;
        return;
      }
      return module.exports.readLines(files);
    });
  }

}
