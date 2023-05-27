const Command = require('./command.js')
const Tr = require('@vitalets/google-translate-api')

module.exports = class Translate extends Command {

  constructor() {
    super('translate')
  }

  async call(bot, opts, respond) {
    const text = opts.args.join(' ')
    const res = await Tr.translate(text, { to: 'en' })
    const src = res.raw.src

    return respond(`[${src}] ${res.text}`)
  }
}
