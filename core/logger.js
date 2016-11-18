const colors = require('irc').colors;

module.exports = {
  
  log: function(from, to, msg) {
    const now = new Date().toString().split('GMT')[0];
    console.log(now + '['+from+']['+to+'] '+ msg);
  },

  warn: function(from, to, msg) {
    const now = new Date().toString().split('GMT')[0];
    const str = now + '['+from+']['+to+'] ' + msg);
    console.log(colors.wrap('yellow', str);
  },

  error: function(from, to, err) {
    const now = new Date().toString().split('GMT')[0];
    const str = now + '['+from+']['+to+'] ' + err.message);
    console.log(colors.wrap('dark_red', str);
    console.error(err);
  }
};
