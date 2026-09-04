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

    return new Promise((resolve) => {
      execFile('agy', args, {
        timeout, cwd, env: childEnv(), maxBuffer: 1024 * 1024
      }, (error, stdout, stderr) => {
        try {
          fs.rmSync(cwd, { recursive: true, force: true })
        } catch (_) { /* best-effort cleanup */ }

        if (error) {
          console.error(
            'agy headless failed:',
            (error.code || error.signal || 'error'),
            (stderr || '').slice(0, 200)
          )
          return resolve(FALLBACK)
        }

        return resolve(sanitizeOutput(stdout, maxLength))
      })
    })
  }
}
