#!/usr/bin/env node
/**
 * AGENTS.md Health Check — Monorepo Alignment Validator
 *
 * Scans all AGENTS.md files across the monorepo and verifies:
 *   0. Root Codex project-layer enforcement is active
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
const ROOT_CODEX_DIR = join(ROOT, '.codex')
const ROOT_CODEX_CONFIG = join(ROOT_CODEX_DIR, 'config.toml')
const ROOT_HOOKS_JSON = join(ROOT_CODEX_DIR, 'hooks.json')

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

function readRootCodexConfig() {
  if (!existsSync(ROOT_CODEX_CONFIG)) return null
  return readFileSync(ROOT_CODEX_CONFIG, 'utf-8')
}

function readRootHooksConfig() {
  if (!existsSync(ROOT_HOOKS_JSON)) return null
  try {
    return JSON.parse(readFileSync(ROOT_HOOKS_JSON, 'utf-8'))
  } catch {
    return 'INVALID_JSON'
  }
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

function checkRootCodexHooksEnabled() {
  const content = readRootCodexConfig()
  if (!content) {
    return {
      file: ROOT_CODEX_CONFIG,
      pass: false,
      rule: 'Root .codex config',
      detail: 'Missing .codex/config.toml project layer',
    }
  }

  const hasHooksEnabled = /\[features\][\s\S]*?\bhooks\s*=\s*true\b/.test(content)
  const usesDeprecatedAlias = /\bcodex_hooks\s*=/.test(content)
  return {
    file: ROOT_CODEX_CONFIG,
    pass: hasHooksEnabled && !usesDeprecatedAlias,
    rule: 'Root .codex hooks enabled',
    detail: !hasHooksEnabled
      ? 'Project config does not explicitly enable [features].hooks = true'
      : usesDeprecatedAlias
        ? 'Deprecated codex_hooks flag detected in project config'
        : undefined,
  }
}

function checkRootHooksJsonExists() {
  return {
    file: ROOT_HOOKS_JSON,
    pass: existsSync(ROOT_HOOKS_JSON),
    rule: 'Root hooks.json exists',
    detail: existsSync(ROOT_HOOKS_JSON) ? undefined : 'Missing .codex/hooks.json',
  }
}

function checkSessionStartHookCoverage() {
  const config = readRootHooksConfig()
  if (!config || config === 'INVALID_JSON') {
    return {
      file: ROOT_HOOKS_JSON,
      pass: false,
      rule: 'SessionStart SSOT hook',
      detail: !config ? 'Missing .codex/hooks.json' : 'Invalid JSON in .codex/hooks.json',
    }
  }

  const sessionHooks = config.hooks?.SessionStart ?? []
  const hasCoverage = sessionHooks.some(
    (entry) =>
      typeof entry.matcher === 'string' &&
      entry.matcher.includes('startup') &&
      entry.matcher.includes('resume') &&
      entry.matcher.includes('clear') &&
      Array.isArray(entry.hooks) &&
      entry.hooks.some(
        (hook) =>
          typeof hook.command === 'string' &&
          hook.command.includes('tooling/governance/agent/hooks/session-start.ps1')
      )
  )

  return {
    file: ROOT_HOOKS_JSON,
    pass: hasCoverage,
    rule: 'SessionStart SSOT hook',
    detail: hasCoverage
      ? undefined
      : 'SessionStart must cover startup|resume|clear and call session-start.ps1',
  }
}

function checkPostToolUseEditCoverage() {
  const config = readRootHooksConfig()
  if (!config || config === 'INVALID_JSON') {
    return {
      file: ROOT_HOOKS_JSON,
      pass: false,
      rule: 'PostToolUse edit coverage',
      detail: !config ? 'Missing .codex/hooks.json' : 'Invalid JSON in .codex/hooks.json',
    }
  }

  const postHooks = config.hooks?.PostToolUse ?? []
  const hasCoverage = postHooks.some(
    (entry) =>
      typeof entry.matcher === 'string' &&
      entry.matcher.includes('apply_patch') &&
      entry.matcher.includes('Edit') &&
      entry.matcher.includes('Write') &&
      Array.isArray(entry.hooks) &&
      entry.hooks.some(
        (hook) =>
          typeof hook.command === 'string' &&
          hook.command.includes('tooling/governance/agent/hooks/post-tool-use.ps1')
      )
  )

  return {
    file: ROOT_HOOKS_JSON,
    pass: hasCoverage,
    rule: 'PostToolUse edit coverage',
    detail: hasCoverage
      ? undefined
      : 'PostToolUse must cover apply_patch/Edit/Write and call post-tool-use.ps1',
  }
}

function checkStopContinuityHook() {
  const config = readRootHooksConfig()
  if (!config || config === 'INVALID_JSON') {
    return {
      file: ROOT_HOOKS_JSON,
      pass: false,
      rule: 'Stop continuity hook',
      detail: !config ? 'Missing .codex/hooks.json' : 'Invalid JSON in .codex/hooks.json',
    }
  }

  const stopHooks = config.hooks?.Stop ?? []
  const hasCoverage = stopHooks.some(
    (entry) =>
      Array.isArray(entry.hooks) &&
      entry.hooks.some(
        (hook) =>
          typeof hook.command === 'string' &&
          hook.command.includes('tooling/governance/agent/hooks/session-stop.ps1')
      )
  )

  return {
    file: ROOT_HOOKS_JSON,
    pass: hasCoverage,
    rule: 'Stop continuity hook',
    detail: hasCoverage ? undefined : 'Stop hook must call session-stop.ps1',
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
  checkRootCodexHooksEnabled,
  checkRootHooksJsonExists,
  checkSessionStartHookCoverage,
  checkPostToolUseEditCoverage,
  checkStopContinuityHook,
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
