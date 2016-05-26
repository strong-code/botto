
module.exports = {

  call: function (opts, respond) {
    if (opts.args[0] == 'start') {
      return module.exports.startGame(respond);
    }
  },

  shootable: false,

  startGame: function (respond) {
    respond('Respond with \'bang\' when you see the duck to shoot him');
    var delay = (Math.random() * 10000) + 10;
    setTimeout(function () {
      module.exports.shootable = true;
      return respond(duckling);
    }, delay);
  },

  handleShot: function (nick, respond) {
    if (!module.exports.shootable) {
      return;
    }
    module.exports.shootable = false;
    return respond('You killed the duck! ' + nick + ' wins this round');
  }

};

var duckling =
'         __\n' +
'QUACK  >(\' )\'\n' +
'QUACK    )/   ,\n' +
'        /(____/\\\n' +
'       /        )\n' +
'         `  =~~/\n' +
'         `---Y-\'\n';
