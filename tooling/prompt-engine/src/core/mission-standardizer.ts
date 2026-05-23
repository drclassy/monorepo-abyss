import type { LightweightContext, PromptMode } from './composer'

export type MissionMode =
  | 'review_readonly_audit'
  | 'fix'
  | 'cleanup'
  | 'refactor'
  | 'implementation'

export interface MissionRiskFlags {
  broad_scope: boolean
  ambiguous_cleanup: boolean
  missing_clear_scope: boolean
  crown_jewel_path: boolean
}

export interface MissionIntentClassification {
  requestedMode: PromptMode
  missionMode: MissionMode
  normalizedRequest: string
  explicitTarget: string | null
  activeArea: string
  riskFlags: MissionRiskFlags
}

export interface StandardizedMission {
  missionTitle: string
  mode: MissionMode
  repositoryContext: {
    repository: string
    workspace: string
    ruleSource: string
    activeArea: string
  }
  objective: string
  problemStatement: string
  scope: string[]
  nonScope: string[]
  strictConstraints: string[]
  allowedActions: string[]
  forbiddenActions: string[]
  requiredOutput: string[]
  acceptanceCriteria: string[]
  verificationCommands: string[]
  independentAuditChecklist: string[]
  rollbackPlan: string[]
  stopCondition: string[]
  riskFlags: MissionRiskFlags
}

const BOLD_REVIEW_PATTERNS = [/\bpelajari\b/, /\baudit\b/, /\breview\b/, /\bcek\b/, /\bpastikan\b/]

const AMBIGUOUS_CLEANUP_PATTERNS = [
  /file tidak berguna/,
  /repo bersih/,
  /bersihkan (?:repo|project|proyek)/,
  /rapikan (?:repo|monorepo|project|proyek)/,
]

const EXPLICIT_CLEANUP_PATTERN = /\b(?:hapus|delete|cleanup|remove)\b/
const EXPLICIT_REFACTOR_PATTERN = /\b(?:refactor|rename|move)\b/
const EXPLICIT_FIX_PATTERN = /\b(?:fix|perbaiki|repair|debug)\b/
const EXPLICIT_IMPLEMENT_PATTERN =
  /\b(?:implement|implementation|tambahkan|tambah|buat|add|create|update|ubah)\b/
const BROAD_TARGET_PATTERN = /\b(?:monorepo|repo|project|proyek|codebase)\b/
const BROAD_QUALIFIER_PATTERN = /\b(?:seluruh|semua|all|overall)\b/
const PATH_PATTERN =
  /([A-Za-z]:[\\/][^\s,;:]+|(?:packages|apps|tooling|platform|docs|flows|library|infrastructure)[\\/][^\s,;:]+)/gi
const FILE_PATTERN = /\b[\w.-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|yml|yaml)\b/i

function normalizeText(value: string): string {
  return value.trim().replace(/\r\n/g, '\n')
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/')
}

function isCrownJewelPath(value: string): boolean {
  const normalized = normalizePath(value).toLowerCase()
  return normalized.includes('/packages/sentra/') || normalized.startsWith('packages/sentra/')
}

function findExplicitTarget(request: string): string | null {
  const pathMatch = request.match(PATH_PATTERN)
  if (pathMatch?.[0]) return normalizePath(pathMatch[0])

  const fileMatch = request.match(FILE_PATTERN)
  if (fileMatch?.[0]) return fileMatch[0]

  return null
}

function hasPattern(request: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(request))
}

function hasBroadScope(request: string): boolean {
  if (hasPattern(request, AMBIGUOUS_CLEANUP_PATTERNS)) return true
  if (/audit semua|review semua|pastikan monorepo sehat|pelajari seluruh monorepo/.test(request)) {
    return true
  }

  const hasBroadTarget = BROAD_TARGET_PATTERN.test(request)
  const hasBroadQualifier = BROAD_QUALIFIER_PATTERN.test(request)
  const hasReviewVerb = hasPattern(request, BOLD_REVIEW_PATTERNS)

  return hasBroadTarget && (hasBroadQualifier || hasReviewVerb)
}

function hasExplicitAction(request: string): boolean {
  return (
    EXPLICIT_CLEANUP_PATTERN.test(request) ||
    EXPLICIT_REFACTOR_PATTERN.test(request) ||
    EXPLICIT_FIX_PATTERN.test(request) ||
    EXPLICIT_IMPLEMENT_PATTERN.test(request)
  )
}

function buildVerificationCommands(mode: MissionMode): string[] {
  const commands = ['git status --short', 'git diff --stat']

  if (mode !== 'review_readonly_audit') {
    commands.push('pnpm typecheck', 'pnpm test')
    return commands
  }

  commands.push('pnpm typecheck', 'pnpm test')
  return commands
}

function buildRequiredOutput(): string[] {
  return [
    'Return report using this format:',
    '',
    '### 1. Findings First',
    '| Severity | Area | Finding | Evidence | Risk | Recommendation |',
    '|---|---|---|---|---|---|',
    '',
    '### 2. Changes Made',
    '| File | Change | Reason |',
    '|---|---|---|',
    '',
    '### 3. Verification',
    '| Command | Result | Notes |',
    '|---|---|---|',
    '',
    '### 4. Remaining Risks',
    '[List only real risks.]',
    '',
    '### 5. Final Verdict',
    '[PASS / PASS WITH RISKS / FAIL]',
  ]
}

export function classifyMissionIntent(
  rawInput: string,
  context: LightweightContext,
  requestedMode: PromptMode
): MissionIntentClassification {
  const normalizedRequest = normalizeText(rawInput)
  const loweredRequest = normalizedRequest.toLowerCase()
  const explicitTarget = findExplicitTarget(normalizedRequest)
  const crownJewelTarget = explicitTarget ? isCrownJewelPath(explicitTarget) : false
  const crownJewelActiveFile = context.activeFilePath
    ? isCrownJewelPath(context.activeFilePath)
    : false
  const broadScope = hasBroadScope(loweredRequest)
  const ambiguousCleanup = hasPattern(loweredRequest, AMBIGUOUS_CLEANUP_PATTERNS)
  const explicitAction = hasExplicitAction(loweredRequest)
  const hasExplicitNamedTarget = Boolean(explicitTarget)
  const canUseActiveFileScope =
    requestedMode === 'implement' &&
    EXPLICIT_IMPLEMENT_PATTERN.test(loweredRequest) &&
    Boolean(context.activeFilePath.trim()) &&
    !crownJewelActiveFile
  const missingClearScope = explicitAction && !hasExplicitNamedTarget && !canUseActiveFileScope
  const crownJewelPath = crownJewelTarget || crownJewelActiveFile

  let missionMode: MissionMode = 'review_readonly_audit'

  if (!broadScope && !ambiguousCleanup && !crownJewelPath) {
    if (EXPLICIT_CLEANUP_PATTERN.test(loweredRequest) && hasExplicitNamedTarget) {
      missionMode = 'cleanup'
    } else if (EXPLICIT_REFACTOR_PATTERN.test(loweredRequest) && hasExplicitNamedTarget) {
      missionMode = 'refactor'
    } else if (EXPLICIT_FIX_PATTERN.test(loweredRequest) && hasExplicitNamedTarget) {
      missionMode = 'fix'
    } else if (
      EXPLICIT_IMPLEMENT_PATTERN.test(loweredRequest) &&
      (hasExplicitNamedTarget || canUseActiveFileScope)
    ) {
      missionMode = 'implementation'
    } else if (!hasPattern(loweredRequest, BOLD_REVIEW_PATTERNS)) {
      if (requestedMode === 'implement' && canUseActiveFileScope) {
        missionMode = 'implementation'
      } else if (requestedMode === 'debug' && hasExplicitNamedTarget) {
        missionMode = 'fix'
      }
    }
  }

  const activeArea =
    explicitTarget ??
    (missionMode === 'implementation' && canUseActiveFileScope && context.activeFilePath
      ? context.activeFilePath
      : 'read-only discovery')

  return {
    requestedMode,
    missionMode,
    normalizedRequest,
    explicitTarget,
    activeArea,
    riskFlags: {
      broad_scope: broadScope,
      ambiguous_cleanup: ambiguousCleanup,
      missing_clear_scope: missingClearScope,
      crown_jewel_path: crownJewelPath,
    },
  }
}

function buildObjective(classification: MissionIntentClassification): string {
  switch (classification.missionMode) {
    case 'fix':
      return 'Fix the specified issue within the approved bounded scope only.'
    case 'cleanup':
      return 'Clean up only the explicitly named and bounded target after keeping the scope narrow and auditable.'
    case 'refactor':
      return 'Refactor only the explicitly scoped file or area without expanding into unrelated behavior changes.'
    case 'implementation':
      return 'Implement the requested change only within the bounded active area and preserve existing patterns.'
    default:
      return 'Perform a read-only audit to collect evidence, classify repository state, and recommend the safest next action without changing files.'
  }
}

function buildProblemStatement(classification: MissionIntentClassification): string {
  if (classification.riskFlags.crown_jewel_path) {
    return 'The request touches a crown-jewel path under packages/sentra/** and lacks explicit approval for modification.'
  }

  if (classification.riskFlags.ambiguous_cleanup) {
    return 'The request uses cleanup language without an explicitly named bounded target, so it must be classified before any action is considered.'
  }

  if (classification.riskFlags.broad_scope) {
    return 'The request is broad or repository-wide and needs evidence-based classification before any edit, cleanup, or refactor is considered.'
  }

  if (classification.riskFlags.missing_clear_scope) {
    return 'The request names an action but does not provide a sufficiently bounded target, so expanding into edits would be unsafe.'
  }

  return 'The request identifies a bounded task that should be handled without widening scope or introducing unrelated changes.'
}

function buildScope(classification: MissionIntentClassification): string[] {
  if (classification.missionMode === 'review_readonly_audit') {
    return [
      'Inspect repository structure for evidence only.',
      'Classify workspace state.',
      'Classify dirty tree / untracked files.',
      'Recommend next action only.',
    ]
  }

  const target = classification.activeArea
  return [
    `Inspect only the scoped target: ${target}.`,
    'Edit only the scoped target when required by the mission.',
    'Touch directly related verification files only when needed to prove the result.',
  ]
}

function buildNonScope(classification: MissionIntentClassification): string[] {
  const items = [
    'Do not touch packages/sentra/** unless there is explicit approval.',
    'Do not change unrelated product logic.',
    'Do not change architecture or governance outside the scoped task.',
    'Do not add dependencies.',
  ]

  if (classification.missionMode === 'review_readonly_audit') {
    items.push(
      'Do not edit files.',
      'Do not delete, rename, or move files or folders.',
      'Do not refactor or run cleanup automatically.'
    )
  }

  return items
}

function buildAllowedActions(classification: MissionIntentClassification): string[] {
  if (classification.missionMode === 'review_readonly_audit') {
    return [
      'Inspect repository structure for evidence only.',
      'Read relevant files.',
      'Run safe verification commands.',
      'Classify findings.',
      'Recommend the safest next action only.',
    ]
  }

  return [
    `Inspect the scoped target: ${classification.activeArea}.`,
    'Edit only the scoped files that are required by the mission.',
    'Run narrow verification commands for the scoped change.',
    'Update directly related tests in the same scoped area only if needed.',
  ]
}

function buildForbiddenActions(classification: MissionIntentClassification): string[] {
  const items = [
    'No broad refactor.',
    'No dependency upgrade.',
    'No architecture rewrite.',
    'No unrelated formatting churn.',
    'No touching packages/sentra/** unless explicitly scoped and approved.',
  ]

  if (classification.missionMode === 'review_readonly_audit') {
    items.push(
      'No edit, delete, rename, or move actions.',
      'No cleanup execution.',
      'No automatic fix by interpretation.',
      'No subjective deletion decisions such as "file tidak berguna".'
    )
    return items
  }

  items.push(
    'No unrelated edits outside the scoped target.',
    'No deletion by interpretation.',
    'No widening scope beyond the explicit target.'
  )
  return items
}

function buildAcceptanceCriteria(classification: MissionIntentClassification): string[] {
  const items = [
    'Prompt is specific.',
    'Scope and non-scope are explicit.',
    'Dangerous actions are blocked by default.',
    'Verification commands are included.',
    'Output format prioritizes findings before summary.',
  ]

  if (classification.missionMode === 'review_readonly_audit') {
    items.push(
      'The mission stays read-only and evidence-first.',
      'Broad or ambiguous requests do not become permission to edit, delete, or cleanup.'
    )
  } else {
    items.push(
      'The action stays inside the explicit bounded target.',
      'No crown-jewel modification occurs without explicit approval.'
    )
  }

  return items
}

function buildAuditChecklist(classification: MissionIntentClassification): string[] {
  return [
    'Scope is narrow.',
    'Non-scope is explicit.',
    `No crown-jewel risk is ignored: ${classification.riskFlags.crown_jewel_path ? 'FAIL UNTIL APPROVED' : 'PASS'}.`,
    'No broad cleanup instruction is allowed.',
    'No subjective deletion wording remains.',
    'Verification commands are included.',
    'Final output requires evidence before summary.',
  ]
}

function buildStopConditions(classification: MissionIntentClassification): string[] {
  const items = [
    'Stop and report if prompt-engine source of truth becomes unclear.',
    'Stop and report if the required work expands outside the scoped target.',
    'Stop and report if the task would require touching packages/sentra/** without explicit approval.',
    'Stop and report if cleanup or deletion would rely on interpretation instead of an explicitly named target.',
  ]

  if (classification.riskFlags.crown_jewel_path) {
    items.push('Stop and report because crown-jewel modification lacks explicit approval.')
  }

  return items
}

function buildMissionTitle(mode: MissionMode): string {
  switch (mode) {
    case 'fix':
      return 'SENTRA-CODEX-MISSION-FIX'
    case 'cleanup':
      return 'SENTRA-CODEX-MISSION-CLEANUP'
    case 'refactor':
      return 'SENTRA-CODEX-MISSION-REFACTOR'
    case 'implementation':
      return 'SENTRA-CODEX-MISSION-IMPLEMENTATION'
    default:
      return 'SENTRA-CODEX-MISSION-READONLY-AUDIT'
  }
}

export function standardizeMissionRequest(
  rawInput: string,
  context: LightweightContext,
  classification: MissionIntentClassification
): StandardizedMission {
  const safeRepository = context.repoName.trim() || 'unknown'
  const safeWorkspace = context.workspacePath.trim() || 'unknown'
  const safeRuleSource = context.coreRuleSource.trim() || 'unknown'

  return {
    missionTitle: buildMissionTitle(classification.missionMode),
    mode: classification.missionMode,
    repositoryContext: {
      repository: safeRepository,
      workspace: safeWorkspace,
      ruleSource: safeRuleSource,
      activeArea: classification.activeArea,
    },
    objective: buildObjective(classification),
    problemStatement: buildProblemStatement(classification),
    scope: buildScope(classification),
    nonScope: buildNonScope(classification),
    strictConstraints: [
      'Keep scope tight.',
      'Preserve existing patterns.',
      'No unrelated edits.',
      'No deletion unless explicitly approved.',
      'No crown-jewel modification unless explicitly approved.',
      'Verify before claiming completion.',
    ],
    allowedActions: buildAllowedActions(classification),
    forbiddenActions: buildForbiddenActions(classification),
    requiredOutput: buildRequiredOutput(),
    acceptanceCriteria: buildAcceptanceCriteria(classification),
    verificationCommands: buildVerificationCommands(classification.missionMode),
    independentAuditChecklist: buildAuditChecklist(classification),
    rollbackPlan: [
      'Revert only the modified prompt-engine files if the generated mission is unsafe or unclear.',
      'Restore the previous compose behavior.',
      'Re-run the relevant verification commands.',
      'Report the failed assumption before making broader changes.',
    ],
    stopCondition: buildStopConditions(classification),
    riskFlags: classification.riskFlags,
  }
}
