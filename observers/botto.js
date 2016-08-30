const fs = require('fs');
const _  = require('lodash');
const db = require('../core/_db.js');

module.exports = {

  call: function(opts, respond) {
    const text = opts.text.split(' ');
    if (_.includes(text, 'botto') && text[0] !== '!bottoreply') {
      //return getResponse(respond);
    }
  },

  getResponse: function(respond) {
    return db.executeQuery('SELECT * FROM botto_replies ORDER BY RANDOM() LIMIT 1', function(result) {
      if (result.rows && result.rows[0]) {
        return respond(result.rows[0]['message']);
      }
    });
  }

};

// const me = `┈╭━━━━━━━━━━━╮┈
// ┈┃╭━━━╮┊╭━━━╮┃┈
// ╭┫┃┈🦄┈┃┊┃┈🦄┈┃┣
// ┃┃╰━━━╯┊╰━━━╯┃┃
// ╰┫╭━╮╰━━━╯╭━╮┣╯
// ┈┃┃┣┳┳┳┳┳┳┳┫┃┃┈
// ┈┃┃╰┻┻┻┻┻┻┻╯┃┃┈
// ┈╰━━━━━━━━━━━╯┈`
