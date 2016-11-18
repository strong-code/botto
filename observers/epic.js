var fs = require('fs');

module.exports = {

  call: function(opts, respond) {
    if (opts.text === 'epic') {
      fs.readFile('./scripts/epic.txt', function (err, data) {
        if (err) {
          return;
        }
        //return respond(data);
      });
    }
  }

};
