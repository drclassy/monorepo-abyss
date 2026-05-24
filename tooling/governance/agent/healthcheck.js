#!/usr/bin/env node
/**
 * AGENTS.md Health Check — Monorepo Alignment Validator
 *
 * Scans all AGENTS.md files across the monorepo and verifies:
 *   0. Root governance tooling exists without requiring repo-local .codex
 *   1. Every file references root AGENTS.md as SSOT
 *   2. No "WAIT FOR GO" manual gate (must use risk-based classification)
 *   3. JET Protocol references point to root section 2 (not section 5)
 *   4. Commit trailer format matches root standard
 *   5. .agent/ folder has 5 required files
 *   6. No contradictions with root absolute prohibitions (section 3)
 *
 * Usage:  node tooling/governance/agent/healthcheck.js
 * CI:     Add as pre-merge gate in .github/workflows/ci.yml
 *
 * No external dependencies — pure Node.js stdlib.
 */

const { readFileSync, readdirSync, existsSync } = require('node:fs')
const { join, relative } = require('node:path')

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT = process.cwd()
const APPS_DIR = join(ROOT, 'apps')
const GOVERNANCE_HOOKS_DIR = join(ROOT, 'tooling', 'governance', 'agent', 'hooks')
const SESSION_START_HOOK = join(GOVERNANCE_HOOKS_DIR, 'session-start.ps1')
const POST_TOOL_USE_HOOK = join(GOVERNANCE_HOOKS_DIR, 'post-tool-use.ps1')
const SESSION_STOP_HOOK = join(GOVERNANCE_HOOKS_DIR, 'session-stop.ps1')

const REQUIRED_AGENT_FILES_V2 = [
  'README.md',
  'CONTEXT.md',
  'PROGRESS.md',
  'HANDOFF.md',
  'DECISIONS.md',
]

const REQUIRED_AGENT_FILES_LEGACY = [
  'CONTEXT.md',
  'PROGRESS.md',
  'HANDOFF.md',
  'LESSONS.md',
  'DECISIONS.md',
]

const ROOT_PROHIBITIONS = ['terraform apply', 'git reset --hard', 'rm -rf', 'git clean']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findAgentsFiles(dir) {
  const results = []
  function walk(current) {
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === '.turbo' ||
        entry.name === '.wxt'
      )
        continue
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name === 'AGENTS.md') {
        results.push(full)
      }
    }
  }
  walk(dir)
  return results
}

function isSubAppFile(file) {
  // Sub-app = apps/{division}/{sub-app}/AGENTS.md (3+ segments)
  // Skip division bridges, vendor modules, and thin nested workspaces
  const relPath = relative(APPS_DIR, file)
  const segments = relPath.split(/[/\\]/)
  if (segments.length < 3) return false
  if (segments.includes('vendor')) return false
  // Skip thin nested workspaces (e.g., classy-transformer/website/) that lack JET section
  const content = readFileSync(file, 'utf-8')
  if (!content.includes('## 3. JET')) return false
  return true
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function checkSSOTReference(file, content) {
  const hasRootRef = content.includes('AGENTS.md') && content.includes('SSOT')
  const hasRootWins =
    content.includes('root') && (content.includes('wins') || content.includes('Root wins'))
  return {
    file,
    pass: hasRootRef && hasRootWins,
    rule: 'SSOT Reference',
    detail:
      hasRootRef && hasRootWins
        ? undefined
        : "Missing root AGENTS.md SSOT reference or 'root wins' clause",
  }
}

function checkNoWaitForGo(file, content) {
  if (!isSubAppFile(file)) {
    return { file, pass: true, rule: 'J5 Risk-Based Gate', detail: 'Bridge/vendor — skipped' }
  }
  const hasManualGate = content.includes('WAIT FOR GO') && content.includes('Manual')
  const hasRiskBased =
    content.includes('Risk Gate') || content.includes('risk-based') || content.includes('Class A')
  return {
    file,
    pass: !hasManualGate && hasRiskBased,
    rule: 'J5 Risk-Based Gate',
    detail: hasManualGate
      ? "Still uses 'WAIT FOR GO' manual gate"
      : !hasRiskBased
        ? 'Missing risk-based classification (Class A/B/C)'
        : undefined,
  }
}

function checkJetSectionReference(file, content) {
  const hasWrongRef = content.includes('§5') && content.toLowerCase().includes('jet')
  return {
    file,
    pass: !hasWrongRef,
    rule: 'JET Section 2 Reference',
    detail: hasWrongRef ? 'References root section 5 for JET — should be section 2' : undefined,
  }
}

function checkCommitTrailer(file, content) {
  const hasCustomTrailer = content.includes('Made-with:')
  return {
    file,
    pass: !hasCustomTrailer,
    rule: 'Commit Trailer Standard',
    detail: hasCustomTrailer ? 'Custom commit trailer detected' : undefined,
  }
}

function checkAgentFolder(file) {
  if (!isSubAppFile(file)) {
    return { file, pass: true, rule: '.agent/ Folder', detail: 'Bridge/vendor — skipped' }
  }
  const agentDir = join(file, '..', '.agent')
  if (!existsSync(agentDir)) {
    return {
      file,
      pass: false,
      rule: '.agent/ Folder',
      detail: `.agent/ folder missing at ${relative(ROOT, agentDir)}`,
    }
  }
  const entries = readdirSync(agentDir)
  const missingV2 = REQUIRED_AGENT_FILES_V2.filter((f) => !entries.includes(f))
  const missingLegacy = REQUIRED_AGENT_FILES_LEGACY.filter((f) => !entries.includes(f))
  const pass = missingV2.length === 0 || missingLegacy.length === 0
  return {
    file,
    pass,
    rule: '.agent/ SSOT Files',
    detail: pass
      ? undefined
      : `Missing v2: ${missingV2.join(', ')}; missing legacy: ${missingLegacy.join(', ')}`,
  }
}

function checkNoRootContradictions(file, content) {
  const lower = content.toLowerCase()
  const violations = ROOT_PROHIBITIONS.filter(
    (rule) =>
      lower.includes(rule.toLowerCase()) &&
      !lower.includes('never') &&
      !lower.includes('forbidden') &&
      !lower.includes('must not') &&
      !lower.includes('chief only')
  )
  return {
    file,
    pass: violations.length === 0,
    rule: 'Root Section 3 Prohibitions',
    detail: violations.length
      ? `Potentially contradicts root: ${violations.join(', ')}`
      : undefined,
  }
}

function checkGovernanceHooksDirectory() {
  return {
    file: GOVERNANCE_HOOKS_DIR,
    pass: existsSync(GOVERNANCE_HOOKS_DIR),
    rule: 'Repo governance hooks directory',
    detail: existsSync(GOVERNANCE_HOOKS_DIR)
      ? undefined
      : 'Missing tooling/governance/agent/hooks directory',
  }
}

function checkSessionStartHookExists() {
  return {
    file: SESSION_START_HOOK,
    pass: existsSync(SESSION_START_HOOK),
    rule: 'SessionStart governance script',
    detail: existsSync(SESSION_START_HOOK)
      ? undefined
      : 'Missing tooling/governance/agent/hooks/session-start.ps1',
  }
}

function checkPostToolUseHookExists() {
  return {
    file: POST_TOOL_USE_HOOK,
    pass: existsSync(POST_TOOL_USE_HOOK),
    rule: 'PostToolUse governance script',
    detail: existsSync(POST_TOOL_USE_HOOK)
      ? undefined
      : 'Missing tooling/governance/agent/hooks/post-tool-use.ps1',
  }
}

function checkStopContinuityHookExists() {
  return {
    file: SESSION_STOP_HOOK,
    pass: existsSync(SESSION_STOP_HOOK),
    rule: 'Stop continuity governance script',
    detail: existsSync(SESSION_STOP_HOOK)
      ? undefined
      : 'Missing tooling/governance/agent/hooks/session-stop.ps1',
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

const checks = [
  checkSSOTReference,
  checkNoWaitForGo,
  checkJetSectionReference,
  checkCommitTrailer,
  checkAgentFolder,
  checkNoRootContradictions,
]

const rootChecks = [
  checkGovernanceHooksDirectory,
  checkSessionStartHookExists,
  checkPostToolUseHookExists,
  checkStopContinuityHookExists,
]

function main() {
  const agentsFiles = findAgentsFiles(APPS_DIR)
  console.log(`Found ${agentsFiles.length} AGENTS.md files in apps/\n`)

  const allResults = rootChecks.map((check) => check())
  for (const file of agentsFiles) {
    const content = readFileSync(file, 'utf-8')
    for (const check of checks) {
      allResults.push(check(file, content))
    }
  }

  const failed = allResults.filter((r) => !r.pass)
  const passed = allResults.filter((r) => r.pass)

  console.log('─'.repeat(72))
  console.log('RESULTS')
  console.log('─'.repeat(72))

  for (const result of allResults) {
    const icon = result.pass ? 'PASS' : 'FAIL'
    const shortFile = relative(ROOT, result.file)
    console.log(`[${icon}] ${result.rule.padEnd(30)} ${shortFile}`)
    if (result.detail) {
      console.log(`       -> ${result.detail}`)
    }
  }

  console.log('─'.repeat(72))
  console.log(`SUMMARY: ${passed.length}/${allResults.length} passed, ${failed.length} failed`)
  console.log('─'.repeat(72))

  if (failed.length > 0) {
    console.log('\nHEALTH CHECK FAILED — fix issues above before merging\n')
    process.exit(1)
  } else {
    console.log('\nALL CHECKS PASSED — monorepo governance aligned\n')
    process.exit(0)
  }
}

main()
