const fs = require('fs');
const Observer = require('./observer.js')

module.exports = class Epic extends Observer {

  constructor() {
    super('epic', /^epic$/i)
  }

  call(opts, respond) {
    if (opts.text === 'epic') {
      fs.readFile('./scripts/epic.txt', function (err, data) {
        if (err) {
          return;
        }
        //return respond(data);
      });
    }
  }

}
