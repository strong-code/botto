var forever = require('forever-monitor');
var fs = require('fs');

var child = new (forever.Monitor)('./botto.js', {
  max: 5,
  silent: false,
  logFile: './forever.log',
  outFile: './forever.log',
  errFile: './forever.log'
});

child.on('restart', function () {
  var now = new Date();
  var msg = 'Restarted child process at ' + now.toISOString();
  return fs.appendFile('./forever.log', msg, function (err) {});
});

child.on('exit:code', function (code) {
  var now = new Date();
  var msg = 'Exited child process at ' + now.toISOString() + ' with code ' +  code;
  return fs.appendFile('./forever.log', msg, function (err) {});
});

child.start();
