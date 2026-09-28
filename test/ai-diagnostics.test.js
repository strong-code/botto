const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const vm = require('node:vm')

// Diagnostics are the whole point of this file: an external SIGKILL and our own
// execFile timeout must be distinguishable from the log alone, so drive the
// real run() with a fake child_exec and assert what the bot would print.
const source = fs.readFileSync(path.join(__dirname, '../commands/admin/ai.js'), 'utf8')

// A PATH-resolved shim, so the runtime banner is deterministic instead of
// depending on whatever agy the machine happens to have installed.
const binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fake-agy-bin-'))
fs.writeFileSync(path.join(binDir, 'agy'), '#!/bin/sh\necho fake agy\n')
fs.chmodSync(path.join(binDir, 'agy'), 0o755)

function load(execFile) {
  const logs = []
  const errors = []
  const module = { exports: {} }
  class Command { constructor(name) { this.name = name } }
  vm.runInNewContext(source, {
    module,
    Buffer,
    setInterval,
    clearInterval,
    setTimeout,
    console: {
      log: (...args) => logs.push(args.join(' ')),
      error: (...args) => errors.push(args.join(' '))
    },
    process: Object.assign({}, process, { version: 'v14.7.2',
      env: Object.assign({}, process.env, {
        PATH: binDir,
        BOTTO_AGY_RSS_SAMPLE_MS: '1000'
      })
    }),
    require(id) {
      if (id === 'child_process') return { execFile }
      if (id === 'fs') return fs
      if (id === 'os') return os
      if (id === 'path') return path
      if (id === '../command.js') return Command
      if (id === '../../config.js') return {}
      throw new Error(`Unexpected require ${id}`)
    }
  })
  return { ai: new module.exports(), logs, errors }
}

// execFile stand-in: answers `--version` instantly, and reports the configured
// exit for a prompt run after an optional delay (pid present -> RSS sampling).
function fakeExec({ error = null, stdout = '', stderr = '', delayMs = 0, pid = process.pid }) {
  return (cmd, args, options, callback) => {
    if (args[0] === '--version') {
      callback(null, '1.2.12-test', '')
      return { pid: null }
    }
    setTimeout(() => callback(error, stdout, stderr), delayMs)
    return { pid }
  }
}

function failed(signal, killed) {
  const error = new Error('Command failed')
  error.signal = signal
  error.killed = killed
  return error
}

const run = (ai, timeout = 10000) => ai.run('a question', {
  model: 'gemini-3.8-flash-high', extraEffort: [], timeout, maxLength: 40
})

test('logs the runtime, the start line and the sanitized success', async () => {
  const { ai, logs, errors } = load(fakeExec({ stdout: '  hello   there  ' }))
  const answer = await run(ai)
  assert.equal(answer, 'hello there')
  assert.ok(logs.some(line => line === `agy runtime: node=v14.7.2 path=${binDir}/agy (0KB shell wrapper)`))
  assert.ok(logs.some(line => line === 'agy version: 1.2.12-test'))
  assert.ok(logs.some(line => /^agy run start: model=gemini-3\.8-flash-high timeout=10000ms promptChars=10 maxLength=40 concurrent=1 cwd=\//.test(line)))
  assert.ok(logs.some(line => /^agy run ok: \d+ms model=gemini-3\.8-flash-high outChars=11 stdout=17B \{"peakRssMb":\d+,"rssSamples":\d+\}$/.test(line)))
  assert.equal(ai.lastRun.ok, true)
  assert.equal(ai.lastRun.timedOut, false)
  assert.equal(errors.length, 0)
})

test('names an external SIGKILL as an external kill, not a timeout', async () => {
  const { ai, errors } = load(fakeExec({ error: failed('SIGKILL', false) }))
  const answer = await run(ai)
  assert.equal(answer, 'Stupid clanker fell asleep...')
  assert.match(errors[0], /^agy headless failed: SIGKILL signal=SIGKILL code=none killed=false timedOut=false elapsed=\d+ms timeout=10000ms stdout=0B stderr=0B /)
  assert.match(errors[1], /^agy failure hint: external kill, not our execFile timeout/)
  assert.equal(ai.lastRun.ok, false)
  assert.equal(ai.lastRun.signal, 'SIGKILL')
  assert.equal(ai.lastRun.killed, false)
  assert.equal(ai.lastRun.timedOut, false)
  assert.equal(ai.lastRun.stderr, '')
})

test('names our own SIGTERM timeout as a timeout and keeps stderr', async () => {
  const { ai, errors } = load(fakeExec({ error: failed('SIGTERM', true), stderr: 'quota exceeded' }))
  await run(ai)
  assert.match(errors[0], /killed=true timedOut=true/)
  assert.match(errors[1], /^agy failure hint: either our timeout fired/)
  assert.ok(errors.some(line => line === 'agy stderr: quota exceeded'))
  assert.equal(ai.lastRun.timedOut, true)
  assert.equal(ai.lastRun.stderrBytes, 14)
})

test('flags a run that outlived its own timeout and samples its memory', async () => {
  const { ai, logs, errors } = load(fakeExec({ error: failed('SIGKILL', false), delayMs: 1700 }))
  await run(ai, 1000)
  assert.ok(errors.some(line => /^agy anomaly: ran \d+ms against a 1000ms timeout, so our own timer never ended this run$/.test(line)))
  assert.ok(logs.some(line => /^agy rss: \d+MB peak=\d+MB t=\d+s pid=\d+$/.test(line)))
  assert.ok(ai.lastRun.rssSamples >= 1)
  assert.ok(ai.lastRun.peakRssMb >= 1)
})

test('reports the exit code when the child exits non-zero without a signal', async () => {
  const { ai, errors } = load(fakeExec({ error: Object.assign(new Error('exit 1'), { code: 1 }) }))
  await run(ai)
  assert.match(errors[0], /^agy headless failed: 1 signal=none code=1 killed=false timedOut=false/)
  assert.equal(ai.lastRun.code, 1)
  assert.equal(ai.lastRun.signal, null)
})

test('names a missing agy as a PATH problem', async () => {
  const { ai, errors } = load(fakeExec({ error: Object.assign(new Error('spawn agy ENOENT'), { code: 'ENOENT' }) }))
  await run(ai)
  assert.match(errors[0], /^agy headless failed: ENOENT signal=none code=ENOENT killed=false timedOut=false/)
  assert.ok(errors.some(line => line === 'agy failure hint: agy was not found on PATH for the bot process'))
  assert.equal(ai.lastRun.code, 'ENOENT')
})

test('reads exit 137 as a SIGKILL inside a shell wrapper', async () => {
  const { ai, errors } = load(fakeExec({ error: Object.assign(new Error('exit 137'), { code: 137 }), stderr: 'Killed\n' }))
  await run(ai)
  assert.ok(errors.some(line => /^agy failure hint: exit 137 = 128 \+ SIGKILL reported by a shell wrapper/.test(line)))
  assert.ok(errors.some(line => line === 'agy stderr: Killed\n'))
  assert.equal(ai.lastRun.code, 137)
  assert.equal(ai.lastRun.signal, null)
})
