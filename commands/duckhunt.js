const Command = require('./command.js')
const duckling =
'         __\n' +
'QUACK  >(\' )\'\n' +
'QUACK    )/   ,\n' +
'        /(____/\\\n' +
'       /        )\n' +
'         `  =~~/\n' +
'         `---Y-\'\n';

module.exports = class Duckhunt extends Command {

  constructor() {
    super('duckhunt')
  }

  call(bot, opts, respond) {
    if (opts.args[0] == 'start') {
      return this.startGame(respond);
    }
  }

  #inGame = false

  #shootable = false

  startGame(respond) {
    if (this.#inGame) {
      return respond('The game has already started! Type \'bang\' when you see the duck to shoot him');
    }

    respond('Respond with \'bang\' when you see the duck to shoot him');
    this.#inGame = true;
    var delay = (Math.random() * 10000) + (Math.floor(Math.random() * 60));

    const _this = this
    setTimeout(function () {
      _this.#shootable = true;
      return respond(duckling);
    }, delay);
  }

  handleShot(nick, respond) {
    if (this.#shootable) {
      return;
    }
    this.#inGame = false;
    this.#shootable = false;
    return respond('You killed the duck! ' + nick + ' wins this round');
  }

}

