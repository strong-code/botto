
module.exports = {

  call: function (opts, respond) {
    if (opts.args[0] == 'start') {
      return modules.exports.startGame(respond);
    }
  },

  inGame: false,

  startGame: function (respond) {
    module.exports.inGame = true;
    setTimeout(function () {
      return respond(duckling);
    }, 2000);
  },

  handleShot: function (nick, respond) {
    if (!module.exports.inGame) {
      return;
    }
    module.exports.inGame = false;
    return respond('You killed the duck! ' + nick + ' wins this round');
  }

};

var duckling =
`
         __
QUACK  >(' )
QUACK    )/   ,
        /(____/\
       /        )
        \`  =~~/
        \`---Y-'
       -----~~'----
`
