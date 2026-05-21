/**
 * Stop hook — Autofix Loop (Turborepo-aware)
 *
 * When agent finishes:
 *   1. Skip if no edits happened this session (check edit-log)
 *   2. Run pnpm lint + pnpm typecheck (Turborepo handles per-package + caching)
 *   3. If errors → followup_message → agent auto-fixes
 *   4. Repeat until clean or MAX_ITERATIONS reached
 *
 * Receives: { conversation_id, status, loop_count, workspace_roots }
 * Response: { followup_message?: string }
 */
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, statSync, appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const MAX_ITERATIONS = 5
const SCRATCHPAD = '.cursor/scratchpad.md'
const REPORT_DIR = process.env.CLINE_REPORT_DIR?.trim() || '.cursor/hooks'
const EDIT_LOG = join(REPORT_DIR, 'edit-log.txt')
const SESSION_LOG = join(REPORT_DIR, 'session-log.txt')
const LINT_TIMEOUT_MS = 180_000
const TYPECHECK_TIMEOUT_MS = 180_000
const ERROR_SLICE = 2000

let input = ''
process.stdin.setEncoding('utf-8')
process.stdin.on('data', (chunk) => (input += chunk))
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input)

    if (data.status !== 'completed') return respond({})
    if (data.loop_count >= MAX_ITERATIONS) return respond({})

    logSessionEvent('STOP_RECEIVED', data)

    if (existsSync(SCRATCHPAD)) {
      const scratchpad = readFileSync(SCRATCHPAD, 'utf-8')
      if (scratchpad.includes('AUTOFIX_DONE')) return respond({})
    }

    if (!hasRecentEdits()) return respond({})

    const errors = []
    runCheck('pnpm lint', LINT_TIMEOUT_MS, 'Lint', errors)
    runCheck('pnpm typecheck', TYPECHECK_TIMEOUT_MS, 'TypeScript', errors)

    if (errors.length === 0) {
      writeFileSync(
        SCRATCHPAD,
        `# Autofix Scratchpad\nAUTOFIX_DONE — all checks passed at iteration ${data.loop_count + 1}\n`
      )
      logSessionEvent('CHECKS_PASS', data)
      return respond({})
    }

    const errorReport = errors.join('\n\n---\n\n')
    respond({
      followup_message: `[Autofix Loop ${data.loop_count + 1}/${MAX_ITERATIONS}] Lint/typecheck errors detected. Fix these:\n\n${errorReport}\n\nAfter fixing, write AUTOFIX_DONE to .cursor/scratchpad.md if all checks pass.`,
    })
    logSessionEvent('CHECKS_FAIL', data)
  } catch {
    respond({})
  }
})

function hasRecentEdits() {
  if (!existsSync(EDIT_LOG)) return false
  try {
    const ageMs = Date.now() - statSync(EDIT_LOG).mtimeMs
    return ageMs < 30 * 60_000
  } catch {
    return true
  }
}

function runCheck(cmd, timeout, label, errors) {
  try {
    execSync(`${cmd} 2>&1`, {
      timeout,
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '')
    if (out.trim()) errors.push(`${label} errors:\n${out.slice(0, ERROR_SLICE)}`)
  }
}

function respond(obj) {
  console.log(JSON.stringify(obj))
}

function logSessionEvent(event, data) {
  try {
    mkdirSync(REPORT_DIR, { recursive: true })
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] ${event}: status=${data.status}; loop=${data.loop_count}; conversation=${data.conversation_id || 'n/a'}\n`
    appendFileSync(SESSION_LOG, line)
  } catch {
    // silent — don't break the agent loop
  }
}
