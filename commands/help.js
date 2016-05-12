var exec = require('child_process').exec;

module.exports = {

  call: function(opts, respond) {
    exec("cat ./scripts/help.txt | curl -F 'sprunge=<-' http://sprunge.us", function(error, stdout, stderr) {
      if (error) {
        console.error(error);
      } else {
        respond("Help is on the way: " + stdout);
      }
    });
  }

};
