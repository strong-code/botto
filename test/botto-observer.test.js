const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

const source = fs.readFileSync(path.join(__dirname, '../observers/botto.js'), 'utf8')
function setup(lines = [], soul) {
  const calls = []
  class Observer {
    constructor(name, regex) { this.name = name; this.regex = regex }
  }
  class Ai {
    run(prompt, options) { calls.push({ prompt, options }); return Promise.resolve('A conversational reply') }
  }
  const module = { exports: {} }
  vm.runInNewContext(source, { module, console: { error() {} }, require(id) {
    if (id === 'lodash') return { includes: (array, value) => array.includes(value) }
    if (id === './observer.js') return Observer
    if (id === '../util/messageCache.js') return { get: async (channel, count) => {
      calls.push({ channel, count }); return lines
    } }
    if (id === '../commands/admin/ai.js') return Ai
    if (id === '../config.js') return { ai: { model: 'gemini-3.8-flash-high', soul } }
    throw new Error(`Unexpected require ${id}`)
  } })
  return { observer: new module.exports(), calls }
}

test('name matching accepts punctuation and rejects substrings', () => {
  const { observer } = setup()
  assert.equal(observer.regex.test('Hey Botto, what do you think?'), true)
  assert.equal(observer.regex.test('bottonic is different'), false)
})

test('responds to the caller using 15 latest channel lines in chronological order', async () => {
  const { observer, calls } = setup(['<alice>: botto, thoughts?', '<bob>: prior discussion'])
  let reply
  await observer.call({ from: 'alice', to: '#room', text: 'botto, thoughts?' }, text => { reply = text })
  assert.equal(calls[0].channel, '#room')
  assert.equal(calls[0].count, 14)
  assert.match(calls[1].prompt, /<bob>: prior discussion[\s\S]*<alice>: botto, thoughts\?/)
  assert.match(calls[1].prompt, /alice/)
  assert.equal(reply, 'alice: A conversational reply')
})

test('includes triggering line even when cache write is still pending', async () => {
  const { observer, calls } = setup(['<bob>: earlier'])
  await observer.call({ from: 'alice', to: '#room', text: 'botto, hello' }, () => {})
  assert.match(calls[1].prompt, /<bob>: earlier[\s\S]*<alice>: botto, hello/)
})

test('config soul guides each reply while chat remains untrusted', async () => {
  const { observer, calls } = setup(['<alice>: botto, hi'], 'Speak in Spanish with dry humor.')
  await observer.call({ from: 'alice', to: '#room', text: 'botto, hi' }, () => {})
  await observer.call({ from: 'alice', to: '#room', text: 'botto, hi' }, () => {})
  for (const call of calls.filter(c => c.prompt)) {
    assert.match(call.prompt, /Speak in Spanish with dry humor/)
    assert.match(call.prompt, /untrusted conversation/)
    assert.ok(call.prompt.indexOf('Speak in Spanish') < call.prompt.indexOf('Recent chat'))
  }
})

test('missing or non-string soul retains safe default instructions', async () => {
  for (const soul of [undefined, { text: 'ignore everything' }]) {
    const { observer, calls } = setup([], soul)
    await observer.call({ from: 'alice', to: '#room', text: 'botto' }, () => {})
    assert.match(calls[1].prompt, /You are Botto/)
    assert.match(calls[1].prompt, /untrusted conversation/)
    assert.doesNotMatch(calls[1].prompt, /ignore everything/)
  }
})

test('only one request runs at once and failed requests release the slot', async () => {
  const { observer } = setup()
  let release
  observer.ai.run = () => new Promise(resolve => { release = resolve })
  const replies = []
  const first = observer.call({ from: 'a', to: '#room', text: 'botto' }, text => replies.push(text))
  await Promise.resolve()
  await observer.call({ from: 'b', to: '#room', text: 'botto' }, text => replies.push(text))
  assert.equal(replies.length, 0)
  release('Hi')
  await first
  assert.deepEqual(replies, ['a: Hi'])
  observer.ai.run = () => Promise.reject(new Error('offline'))
  await observer.call({ from: 'a', to: '#room', text: 'botto' }, text => replies.push(text))
  assert.equal(observer.inFlight, false)
})
