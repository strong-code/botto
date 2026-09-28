const Command = require('../command.js')
const config = require('../../config.js')
const { execFile } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

// Static hardening policy. These are deliberately NOT user-configurable:
// only bot admins can invoke !ai at all (adminCallable below), but the text
// they pass is untrusted and agy is a tool-using agent, so every call runs
// with the minimum capability needed for a general-knowledge answer.
const DEFAULT_MODEL = 'gemini-3.8-flash-high'
const MODEL_ALLOWLIST = /^[a-z0-9][a-z0-9._:-]{1,64}$/i
const EFFORT_ALLOWLIST = new Set(['low', 'medium', 'high'])
const MAX_PROMPT_CHARS = 1500
const MAX_OUTPUT_CHARS = 500
const MIN_TIMEOUT_MS = 10000
const MAX_TIMEOUT_MS = 180000
const COOLDOWN_MS = 30000
const FALLBACK = 'Stupid clanker fell asleep...'

// One agy run at a time: bounds API cost, CPU, and concurrent headless agents.
let inFlight = false
const lastCallByUser = new Map()

// Read-only wrapper: keeps general inquiries usable while steering the agent
// away from its file/shell tools. Soft control (a determined admin prompt can
// still ask for tool use) layered over the hard controls below.
const READ_ONLY_PREFIX =
  'You are answering a quick chat question. Answer directly from knowledge ' +
  'in plain text with no markdown, no tools, no file access, no commands, ' +
  'no network lookups. Keep it short. Question: '

function sanitizeOutput(text, maxLength) {
  return (text || '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength) || FALLBACK
}

// Failure triage: Node's execFile timeout never reports SIGKILL - that path
// kills the child with `killSignal` (SIGTERM by default) and surfaces
// killed=true / signal='SIGTERM' at exactly the configured timeout. So a
// SIGKILL here is an EXTERNAL killer: kernel OOM killer, systemd-oomd, or a
// service manager tearing the cgroup down. Without the signal names and the
// memory curve below, that distinction is invisible in the bot log.
const KILL_NOTES = {
  SIGKILL: 'external kill, not our execFile timeout (that path is SIGTERM) - check journalctl -k | grep -i "killed process" and dmesg -T | grep -i oom',
  SIGTERM: 'either our timeout fired, or a service manager is stopping the unit',
  SIGSEGV: 'agy crashed (segfault)',
  SIGABRT: 'agy aborted'
}

// Concurrent headless agents are both a cost and a memory spike, and the !ai
// command and the conversational observer hold separate in-flight guards, so
// count across the whole process and log it.
let activeRuns = 0

// RSS poll interval for a live child; overridable so tests do not wait 15s.
const RSS_SAMPLE_MS = Math.min(
  Math.max(Number(process.env.BOTTO_AGY_RSS_SAMPLE_MS) || 15000, 1000),
  60000
)

function rssKb(pid) {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8')
    return Number((status.match(/VmRSS:\s+(\d+) kB/) || [])[1] || 0)
  } catch (_) {
    return 0
  }
}

// Total RSS for a pid and its descendants: agy can hand work to children, and
// the OOM killer picks the largest member of the tree.
function treeRssKb(pid) {
  const pids = [pid]
  let total = 0
  for (let i = 0; i < pids.length && i < 32; i++) {
    total += rssKb(pids[i])
    try {
      const children = fs.readFileSync(`/proc/${pids[i]}/task/${pids[i]}/children`, 'utf8')
      for (const child of children.trim().split(/\s+/)) {
        if (child && !pids.includes(Number(child))) pids.push(Number(child))
      }
    } catch (_) { /* process exited between reads */ }
  }
  return total
}

// A 200MB binary and a shell wrapper fail differently, so record once (off the
// request path) what PATH actually resolves to.
let runtimeLogged = false
function logRuntimeOnce() {
  if (runtimeLogged) return
  runtimeLogged = true
  let resolved = null
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue
    try {
      const candidate = path.join(dir, 'agy')
      fs.accessSync(candidate, fs.constants.X_OK)
      resolved = candidate
      break
    } catch (_) { /* keep looking */ }
  }
  let shape = 'not on PATH'
  if (resolved) {
    try {
      const size = fs.statSync(resolved).size
      const head = Buffer.alloc(2)
      const fd = fs.openSync(resolved, 'r')
      fs.readSync(fd, head, 0, 2, 0)
      fs.closeSync(fd)
      shape = (head[0] === 0x23 && head[1] === 0x21)
        ? `${Math.round(size / 1024)}KB shell wrapper`
        : `${Math.round(size / 1048576)}MB binary`
    } catch (_) { shape = 'unreadable' }
  }
  console.log(`agy runtime: node=${process.version} path=${resolved || 'agy not found'} (${shape})`)
  execFile('agy', ['--version'], { timeout: 15000, env: childEnv() }, (error, stdout) => {
    console.log(`agy version: ${(stdout || '').trim() || 'unavailable'}${error ? ` (exit ${error.code || error.signal})` : ''}`)
  })
}

// Minimal environment for the child: agy auth is file-based (no agy secrets
// in env observed), so stripping env costs nothing and shrinks exfiltration
// surface via /proc/self/environ and friends.
function childEnv() {
  const keep = [
    'PATH', 'HOME', 'USER', 'LOGNAME', 'LANG', 'LC_ALL', 'LC_CTYPE', 'TERM',
    'NO_COLOR', 'TMPDIR', 'TZ',
    'http_proxy', 'https_proxy', 'all_proxy',
    'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY'
  ]
  const env = {}
  for (const k of keep) {
    if (process.env[k] !== undefined) env[k] = process.env[k]
  }
  return env
}

module.exports = class Ai extends Command {

  constructor() {
    super('ai')
  }

  async call(bot, opts, respond) {
    if (!this.adminCallable(opts)) return

    const raw = opts.args.join(' ').trim()
    if (!raw) return respond('Usage: !ai <question>')
    if (raw.length > MAX_PROMPT_CHARS) {
      return respond(`Question too long (max ${MAX_PROMPT_CHARS} chars)`)
    }

    const now = Date.now()
    const last = lastCallByUser.get(opts.from) || 0
    if (now - last < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000)
      return respond(`Cooldown, try again in ${wait}s`)
    }
    if (inFlight) return respond('Busy, try again in a bit')

    const aiConfig = Object.assign({}, config.opencode || {}, config.ai || {})

    // Model/effort come from server config (trusted), still validated so a
    // typo can never turn into flag injection on the agy command line.
    const model = MODEL_ALLOWLIST.test(aiConfig.model || DEFAULT_MODEL)
      ? (aiConfig.model || DEFAULT_MODEL)
      : DEFAULT_MODEL
    const extraEffort = EFFORT_ALLOWLIST.has(aiConfig.effort)
      ? ['--effort', aiConfig.effort]
      : []
    const timeout = Math.min(
      Math.max(Number(aiConfig.timeout) || 90000, MIN_TIMEOUT_MS),
      MAX_TIMEOUT_MS
    )
    const maxLength = Math.min(
      Math.max(Number(aiConfig.maxLength) || 400, 50),
      MAX_OUTPUT_CHARS
    )

    lastCallByUser.set(opts.from, now)
    inFlight = true
    try {
      const result = await this.run(
        READ_ONLY_PREFIX + raw, { model, extraEffort, timeout, maxLength }
      )
      return respond(result)
    } catch (error) {
      console.error('agy query failed')
      return respond('agy query failed')
    } finally {
      inFlight = false
    }
  }

  run(prompt, { model, extraEffort, timeout, maxLength }) {
    // execFile with an argv array and no shell: prompt text can never become
    // a command or flag (single -p=<prompt> argument, never re-parsed).
    const args = [
      '--model', model,
      '--sandbox',
      '--disable-slash-commands',
      '--dangerously-skip-permissions',
      ...extraEffort,
      `-p=${prompt}`
    ]

    // Isolated empty working directory: the agent sees no repo files via
    // relative paths and cannot litter the bot directory with session files.
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'botto-ai-'))

    logRuntimeOnce()
    activeRuns += 1
    const started = Date.now()
    console.log(
      `agy run start: model=${model} timeout=${timeout}ms promptChars=${prompt.length}` +
      ` maxLength=${maxLength} concurrent=${activeRuns} cwd=${cwd}`
    )

    let sampler = null
    let samples = 0
    let peakRssKb = 0

    return new Promise((resolve) => {
      const finish = (result) => {
        if (sampler) clearInterval(sampler)
        activeRuns = Math.max(0, activeRuns - 1)
        try {
          fs.rmSync(cwd, { recursive: true, force: true })
        } catch (_) { /* best-effort cleanup */ }
        return resolve(result)
      }

      const child = execFile('agy', args, {
        timeout, cwd, env: childEnv(), maxBuffer: 1024 * 1024
      }, (error, stdout, stderr) => {
        const elapsed = Date.now() - started
        const signal = error ? (error.signal || null) : null
        const outBytes = (stdout || '').length
        const errBytes = (stderr || '').length
        const timedOut = error ? (error.killed === true && signal === 'SIGTERM') : false
        const memory = { peakRssMb: Math.round(peakRssKb / 1024), rssSamples: samples }

        if (error) {
          console.error(
            'agy headless failed:',
            (error.code || signal || 'error'),
            `signal=${signal || 'none'} code=${error.code === undefined ? 'none' : error.code}`,
            `killed=${error.killed === true} timedOut=${timedOut}`,
            `elapsed=${elapsed}ms timeout=${timeout}ms`,
            `stdout=${outBytes}B stderr=${errBytes}B ${JSON.stringify(memory)}`
          )
          // elapsed far beyond `timeout` is itself a finding: either the event
          // loop was starved, or the deployed build predates the clamp.
          if (elapsed > timeout * 1.5) {
            console.error(
              `agy anomaly: ran ${elapsed}ms against a ${timeout}ms timeout,` +
              ' so our own timer never ended this run'
            )
          }
          if (KILL_NOTES[signal]) console.error(`agy failure hint: ${KILL_NOTES[signal]}`)
          // A missing agy is a PATH/deployment problem, not an agy crash.
          if (!signal && error.code === 'ENOENT') {
            console.error('agy failure hint: agy was not found on PATH for the bot process')
          }
          // A shell wrapper reports its child's signal death as an exit code,
          // so 137 means the kill landed one level below the tracked process.
          if (!signal && error.code === 137) {
            console.error(
              'agy failure hint: exit 137 = 128 + SIGKILL reported by a shell wrapper,' +
              ' so the killed process is a child of the tracked agy process, not agy itself'
            )
          }
          if (stderr) console.error('agy stderr:', (stderr || '').slice(0, 400))

          this.lastRun = Object.assign({
            ok: false,
            model,
            timeout,
            elapsedMs: elapsed,
            signal,
            code: error.code === undefined ? null : error.code,
            killed: error.killed === true,
            timedOut,
            stdoutBytes: outBytes,
            stderrBytes: errBytes,
            stderr: (stderr || '').slice(0, 400),
            promptChars: prompt.length
          }, memory)
          return finish(FALLBACK)
        }

        const answer = sanitizeOutput(stdout, maxLength)
        console.log(
          `agy run ok: ${elapsed}ms model=${model} outChars=${answer.length}` +
          ` stdout=${outBytes}B ${JSON.stringify(memory)}`
        )
        this.lastRun = Object.assign({
          ok: true,
          model,
          timeout,
          elapsedMs: elapsed,
          signal: null,
          code: 0,
          killed: false,
          timedOut: false,
          stdoutBytes: outBytes,
          stderrBytes: errBytes,
          stderr: '',
          promptChars: prompt.length
        }, memory)
        return finish(answer)
      })

      // Memory curve for the child tree: an external SIGKILL leaves nothing
      // behind once the kernel reaps the process, so RSS growth is the only
      // evidence left in the bot log.
      if (child && child.pid) {
        sampler = setInterval(() => {
          const rss = treeRssKb(child.pid)
          samples += 1
          if (rss > peakRssKb) peakRssKb = rss
          console.log(
            `agy rss: ${Math.round(rss / 1024)}MB peak=${Math.round(peakRssKb / 1024)}MB` +
            ` t=${Math.round((Date.now() - started) / 1000)}s pid=${child.pid}`
          )
        }, RSS_SAMPLE_MS)
        if (typeof sampler.unref === 'function') sampler.unref()
      }
    })
  }
}
