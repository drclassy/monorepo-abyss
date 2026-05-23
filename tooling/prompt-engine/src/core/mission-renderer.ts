import type { MissionMode, StandardizedMission } from './mission-standardizer'

export function getMissionModeLabel(mode: MissionMode): string {
  switch (mode) {
    case 'fix':
      return 'Fix'
    case 'cleanup':
      return 'Cleanup'
    case 'refactor':
      return 'Refactor'
    case 'implementation':
      return 'Implementation'
    default:
      return 'Review / Read-Only Audit'
  }
}

function renderBulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

function renderLineBlock(items: string[]): string {
  return items.join('\n')
}

export function renderCodexMission(mission: StandardizedMission): string {
  return [
    `# CODEX MISSION — ${mission.missionTitle}`,
    '',
    '## Mode',
    getMissionModeLabel(mission.mode),
    '',
    '## Repository Context',
    `- Repository: ${mission.repositoryContext.repository}`,
    `- Workspace: ${mission.repositoryContext.workspace}`,
    `- Rule source: ${mission.repositoryContext.ruleSource}`,
    `- Active area: ${mission.repositoryContext.activeArea}`,
    '',
    '## Objective',
    mission.objective,
    '',
    '## Problem Statement',
    mission.problemStatement,
    '',
    '## Scope',
    renderBulletList(mission.scope),
    '',
    '## Non-Scope',
    renderBulletList(mission.nonScope),
    '',
    '## Strict Constraints',
    renderBulletList(mission.strictConstraints),
    '',
    '## Allowed Actions',
    renderBulletList(mission.allowedActions),
    '',
    '## Forbidden Actions',
    renderBulletList(mission.forbiddenActions),
    '',
    '## Required Output',
    renderLineBlock(mission.requiredOutput),
    '',
    '## Acceptance Criteria',
    renderBulletList(mission.acceptanceCriteria),
    '',
    '## Verification Commands',
    renderBulletList(mission.verificationCommands.map((command) => `\`${command}\``)),
    '',
    '## Independent Audit Checklist',
    renderBulletList(mission.independentAuditChecklist),
    '',
    '## Rollback Plan',
    renderBulletList(mission.rollbackPlan),
    '',
    '## Stop Condition',
    renderBulletList(mission.stopCondition),
  ].join('\n')
}
