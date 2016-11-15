const db = require('../core/_db.js');
const _  = require('lodash');

module.exports = {
  
  call: function(opts, respond) {
    let check = opts.text.split(' ')[0];
    const target = check.slice(0, -2);

    if (_.endsWith(check, '++')) {
      return module.exports.addPoint(target, respond);
    } else if (_.endsWith(check, '--')) {
      return module.exports.removePoint(target, respond);
    }
  },

  addPoint: function(target, respond) {
    return module.exports._exists(target, (score) => {
      if (score) {
        const newScore = parseInt(score) + 1;
        return db.executeQuery({
          text: 'UPDATE points SET score = $1 WHERE nick = $2',
          values: [newScore, target]
        }, (result) => {
          return module.exports.getPoints(target, respond);
        });
      } else {
        return db.executeQuery({
          text: 'INSERT INTO points (score, nick) VALUES ($1, $2)',
          values: [1, target]
        }, (result) => {
          return module.exports.getPoints(target, respond);
        });
      }
    });
  },

  removePoint: function(target, respond) {
    return module.exports._exists(target, (score) => {
      if (score) {
        const newScore = parseInt(score) - 1;
        return db.executeQuery({
          text: 'UPDATE points SET score = $1 WHERE nick = $2',
          values: [newScore, target]
        }, (result) => {
          return module.exports.getPoints(target, respond);
        });
      } else {
        return db.executeQuery({
          text: 'INSERT INTO POINTS (score, nick) VALUES ($1, $2)',
          values: [-1, target]
        }, (result) => {
          return module.exports.getPoints(target, respond);
        });
      }
    });
  },

  getPoints: function(nick, respond) {
    return db.executeQuery({
      text: 'SELECT score FROM points WHERE nick = $1',
      values: [nick]
    }, (result) => {
      if (result.rows && result.rows[0]) {
        return respond(nick + ' has ' + result.rows[0].score + ' points');
      }
    });
  },

  _exists: function(nick, cb) {
    return db.executeQuery({
      text: 'SELECT score FROM points WHERE nick = $1',
      values: [nick]
    }, (result) => {
      if (result.rows && result.rows[0]) {
        return cb(result.rows[0].score);
      }
      return cb(null);
    });
  }

};
