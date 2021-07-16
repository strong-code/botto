const db = require('../util/db.js')
const Observer = require('./observer.js')

module.exports = class Points extends Observer {

  constructor() {
    const regex = new RegExp(/^[a-z0-9]*((\+\+)|(\-\-))$/i)
    super('points', regex)
  }
  
  call(opts, respond) {
    let check = opts.text.split(' ')[0]
    const target = check.slice(0, -2)
    
    if (target == opts.from) {
      return respond('mate...')
    }

    if (check.endsWith('++')) {
      return this.addPoint(target, respond)
    } else if (check.endsWith('--')) {
      return this.removePoint(target, respond)
    }
  }

  async addPoint(target, respond) {
    const score = await db.oneOrNone('SELECT score FROM points WHERE nick = $1', [target], s => s && s.score)
    const newScore = (score ? parseInt(score)+1 : 1)

    let dbString = 'INSERT INTO POINTS (score, nick) VALUES ($1, $2)'

    if (score) {
      dbString = 'UPDATE points SET score = $1 WHERE nick = $2'
    }
      
    db.none(dbString, [newScore, target])
    return respond(`${target} has ${newScore} points`)
  }

  async removePoint(target, respond) {
    const score = await db.oneOrNone('SELECT score FROM points WHERE nick = $1', [target], s => s && s.score)
    const newScore = (score ? parseInt(score)-1 : -1)

    let dbString = 'INSERT INTO POINTS (score, nick) VALUES ($1, $2)'

    if (score) {
      dbString = 'UPDATE points SET score = $1 WHERE nick = $2'
    }
      
    db.none(dbString, [newScore, target])
    return respond(`${target} has ${newScore} points`)
  }

}
