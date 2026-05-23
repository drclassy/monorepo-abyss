import test from 'node:test'
import assert from 'node:assert/strict'

const { classifyMissionIntent, standardizeMissionRequest } =
  await import('../dist/core/mission-standardizer.js')

const context = {
  repoName: 'abyss-monorepo',
  workspacePath: 'D:\\Devops\\abyss-monorepo',
  activeFilePath: 'tooling/prompt-engine/src/core/composer.ts',
  coreRuleSource: '.cursor/rules/00-core.mdc',
}

test('maps broad monorepo requests to review read-only audit', () => {
  const classification = classifyMissionIntent('pelajari seluruh monorepo', context, 'review')
  const mission = standardizeMissionRequest('pelajari seluruh monorepo', context, classification)

  assert.equal(classification.missionMode, 'review_readonly_audit')
  assert.equal(classification.riskFlags.broad_scope, true)
  assert.deepEqual(mission.scope, [
    'Inspect repository structure for evidence only.',
    'Classify workspace state.',
    'Classify dirty tree / untracked files.',
    'Recommend next action only.',
  ])
})

test('keeps ambiguous cleanup requests in review read-only audit mode', () => {
  const classification = classifyMissionIntent('cek file tidak berguna', context, 'review')

  assert.equal(classification.missionMode, 'review_readonly_audit')
  assert.equal(classification.riskFlags.ambiguous_cleanup, true)
})

test('maps explicit fix with clear path to fix mode', () => {
  const classification = classifyMissionIntent(
    'fix typecheck error di packages/shared/sentra-ui',
    context,
    'debug'
  )

  assert.equal(classification.missionMode, 'fix')
  assert.equal(classification.riskFlags.missing_clear_scope, false)
})

test('maps explicit cleanup with bounded target to cleanup mode', () => {
  const classification = classifyMissionIntent(
    'hapus file temporary di tooling/prompt-engine/tmp',
    context,
    'implement'
  )

  assert.equal(classification.missionMode, 'cleanup')
  assert.equal(classification.explicitTarget, 'tooling/prompt-engine/tmp')
})

test('maps explicit refactor with clear file to refactor mode', () => {
  const classification = classifyMissionIntent(
    'refactor hanya tooling/prompt-engine/src/core/composer.ts',
    context,
    'implement'
  )

  assert.equal(classification.missionMode, 'refactor')
  assert.equal(classification.explicitTarget, 'tooling/prompt-engine/src/core/composer.ts')
})

test('falls back to read-only for crown-jewel paths and sets stop condition guard', () => {
  const classification = classifyMissionIntent(
    'fix bug di packages/sentra/sentra-cermin',
    context,
    'debug'
  )
  const mission = standardizeMissionRequest(
    'fix bug di packages/sentra/sentra-cermin',
    context,
    classification
  )

  assert.equal(classification.missionMode, 'review_readonly_audit')
  assert.equal(classification.riskFlags.crown_jewel_path, true)
  assert.match(
    mission.stopCondition.join('\n'),
    /crown-jewel modification lacks explicit approval/i
  )
})
