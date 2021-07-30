const db = require('../../util/db.js')
const _ = require('lodash')
const Command = require('../command.js')
const ReplyObserver = require('../../observers/reply.js')
const needle = require('needle')
const Helpers = require('../../util/helpers.js')

module.exports = class Reply extends Command {

  constructor() {
    super('reply')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable) return

    const cmd = opts.args.shift()

    if (cmd === 'add') {
      return respond(this.addReply(opts.args, opts.from))
    } else if (cmd === 'stop') {
      return respond(this.disable())
    } else if (cmd === 'list') {
      if (!opts.args[0]) {
        return respond(`!reply list enabled OR !reply list disabled`)
      }
      if (opts.args[0] === 'disabled') {
        const res = await this.listDisabled()
        return respond(res)
      } else if (opts.args[0] === 'enabled') { 
        const res = await this.listEnabled()
        return respond(res)
      }
    }
  }

  addReply(args, nick) {
    const data    = _.split(_.join(args, ' '), ' <reply> ')
    const trigger = data[0]
    const reply   = data[1]

    db.none(
      'INSERT INTO replies (added_by, trigger, reply, enabled, date_added) VALUES ($1, $2, $3, $4, $5)',
      [nick, trigger, reply, true, new Date().toISOString()]
    )

    return 'Trigger added'
  }

  disable() {
    if (ReplyObserver.lastReply === undefined) {
      return "I'm not sure what the last reply was"
    } else {
      db.none('UPDATE replies SET enabled = false WHERE id = $1', [ReplyObserver.lastReply.id])
      return 'Trigger disabled'
    }
  }

  async listEnabled() {
    let text = 'TRIGGER | RESPONSE (Added by) \n\n'

    const enabled = await db.each(
      'SELECT added_by AS creator, trigger, reply AS response FROM replies WHERE enabled = true',
      [],
      row => {
        text += `\n ${row.trigger} | ${row.response} (Added by ${row.creator})`
      })

    const res = await Helpers.uploadText(text) 

    return `Currently enabled triggers: ${res.body.path}`
  }

  async listDisabled() {
    let text = 'TRIGGER | RESPONSE (Added by) \n\n'

    const enabled = await db.each(
      'SELECT added_by AS creator, trigger, reply AS response FROM replies WHERE enabled = false',
      [],
      row => {
        text += `\n ${row.trigger} | ${row.response} (Added by ${row.creator})`
      })

    const res = await needle('post', 'http://strongco.de/api/paste', {text: text} )

    return `Currently disabled triggers: ${res.body.path}`

  }

}
