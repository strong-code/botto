const _          = require('lodash');
let isWarmed     = false;
let cache        = {};

module.exports = {

  call: function (opts, respond) {
    const text = opts.text.split(' ');    
    if (_.includes(text, 'botto')) {
      //do something
    }  
  },

  warmCache: function () {
    cache = {};
    const execFile = require('child_process').execFile;

    execFile('find', ['/root/irclogs/Rizon/#lifting/2016'], (err, stdout, stderr) => {
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
        //cache = _.filter(cache, (obj) => {
        //  return obj.length !== 0;
        //});
        console.log(cache['I'])
        console.log('Cache has been warmed')
        isWarmed = true;
        return;
      }
      return module.exports.readLines(files);
    });
  }

}
