const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

const source = fs.readFileSync(path.join(__dirname, '../observers/_observerHandler.js'), 'utf8')
test('removed observer modules do not prevent startup', async () => {
  const module = { exports: {} }
  vm.runInNewContext(source, { module, console, __dirname: path.join(__dirname, '../observers'), require(id) {
    if (id === 'fs') return { existsSync: () => false, readdirSync: () => [] }
    if (id === '../util/db.js') return {
      each: async (_query, _args, callback) => callback({ name: 'markov', mounted: true }),
      oneOrNone: async () => ({ name: 'markov' })
    }
    if (id === '../util/suppress.js') return {}
    throw new Error(`Unexpected require ${id}`)
  } })
  await module.exports.prototype.init()
  assert.equal(module.exports.observerList.markov, undefined)
})
