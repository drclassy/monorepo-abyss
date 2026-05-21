import { describe, expect, it } from 'vitest'

import { parseHandoff, parseSnapshotFields } from './handoff'

const SAMPLE = `# HANDOFF

## Next Action

Run verify-local and update PROGRESS.

## Snapshot

- Branch: main
`

const SUGGESTED = `# HANDOFF

## Snapshot

- Branch: refactor/test
- HEAD: abc1234
- Active work: UNICOM Hub SSE v2
- Mode: IN PROGRESS
- Next: Chief decides merge path

## Suggested Next Action

Commit or package the current root-green app fixes first, then refresh dirty
tree classification before picking the next cluster:

\`\`\`powershell
git status --short
\`\`\`

Do not push yet.
`

describe('parseHandoff', () => {
  it('extracts next action section', () => {
    const result = parseHandoff(SAMPLE)
    expect(result.nextAction).toContain('verify-local')
  })

  it('extracts suggested next action when Next Action section is absent', () => {
    const result = parseHandoff(SUGGESTED)
    expect(result.nextActionFull).toContain('root-green app fixes')
  })

  it('parses snapshot fields from HANDOFF', () => {
    const result = parseHandoff(SUGGESTED)
    expect(result.activeWork).toContain('UNICOM')
    expect(result.snapshotNext).toContain('Chief decides')
  })

  it('extracts numbered follow-up items as blockers', () => {
    const md = `# HANDOFF

## Remaining Follow-Up

1. Commit app fixes first
2. Refresh dirty tree classification
`
    const result = parseHandoff(md)
    expect(result.blockers).toHaveLength(2)
    expect(result.blockers[0]).toContain('Commit app fixes')
  })
})

describe('parseSnapshotFields', () => {
  it('reads bullet fields', () => {
    const fields = parseSnapshotFields('- Active work: Portal UI\n- Next: ship it')
    expect(fields.activeWork).toBe('Portal UI')
    expect(fields.snapshotNext).toBe('ship it')
  })
})
