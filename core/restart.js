var kexec = require('kexec');

module.exports = {

  call: function (bot, opts) {
    return kexec('bash ./run.sh');
  }
}
