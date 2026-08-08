const _  = require('lodash');
const Observer = require('./observer.js')

module.exports = class Botto extends Observer {

  constructor() {
    const regex = new RegExp(/(^|.*\s)botto(\s.*|$)/i)
    super('botto', regex)
  }

  call(opts, respond) {
    const text = opts.text.split(' ');
    if (_.includes(text, 'botto') && text[0] !== '!bottoreply') {
      //return getResponse(respond);
    }
  }

  getResponse(respond) {
    // TODO: restore botto_replies table/query if needed
  }

}
