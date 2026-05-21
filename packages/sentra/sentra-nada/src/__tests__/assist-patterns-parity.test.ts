// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  ASSIST_PATTERN_PARITY_FIXTURE_CASES,
  adaptAssistPatternToSymphonyAlert,
  getAssistPatternParityDefinition,
  runAssistPatternParityFixtures,
} from '../index'

const EXPECTED_CP_IDS = Array.from({ length: 70 }, (_, index) => {
  return `CP-${String(index + 1).padStart(3, '0')}`
})

describe('Assist clinical-pattern parity adapter', () => {
  it('publishes one canonical parity definition for every Assist CP-001 through CP-070 pattern', () => {
    const ids = ASSIST_PATTERN_PARITY_DEFINITIONS.map((pattern) => pattern.id)

    expect(ids).toEqual(EXPECTED_CP_IDS)
    expect(new Set(ids).size).toBe(70)
    expect(ASSIST_PATTERN_PARITY_DEFINITIONS).toHaveLength(70)
    expect(
      ASSIST_PATTERN_PARITY_DEFINITIONS.every((pattern) =>
        pattern.sourceFile.endsWith('clinical-patterns.ts')
      )
    ).toBe(true)
  })

  it('preserves representative Assist clinical intent metadata without evaluating browser-only inputs', () => {
    const qsofa = getAssistPatternParityDefinition('CP-001')
    const anaphylaxis = getAssistPatternParityDefinition('CP-024')
    const concern = getAssistPatternParityDefinition('CP-070')

    expect(qsofa).toMatchObject({
      gate: 'GATE_SEPSIS_EARLY',
      severity: 'high',
      tier: 'A',
      actionProtocolId: 'PROTO_SEPSIS',
    })
    expect(qsofa?.criteria.required).toHaveLength(0)
    expect(qsofa?.criteria.scored).toHaveLength(3)
    expect(qsofa?.criteria.minScore).toBe(2)

    expect(anaphylaxis).toMatchObject({
      gate: 'GATE_ANAPHYLAXIS',
      severity: 'critical',
      tier: 'B',
      actionProtocolId: 'PROTO_ANAPHYLAXIS',
    })
    expect(anaphylaxis?.title).toContain('Anafilaksis')

    expect(concern).toMatchObject({
      gate: 'GATE_SEPSIS_EARLY',
      severity: 'warning',
      tier: 'C',
    })
    expect(concern?.confidenceWeight).toBe(0.7)
  })

  it('adapts a matched Assist pattern into canonical SymphonyAlert shape without PHI fields', () => {
    const pattern = getAssistPatternParityDefinition('CP-024')
    expect(pattern).toBeDefined()
    if (!pattern) throw new Error('unreachable: CP-024 parity definition must exist')

    const alert = adaptAssistPatternToSymphonyAlert(pattern, {
      triggeredAt: '2026-04-19T16:00:00.000Z',
    })

    expect(alert).toMatchObject({
      id: 'assist-cp-024',
      severity: 'critical',
      title: 'Anafilaksis — EMERGENCY',
      gate: 'GATE_10_ANAPHYLAXIS',
      actionProtocolId: 'PROTO_ANAPHYLAXIS',
      actionProtocol: {
        id: 'PROTO_ANAPHYLAXIS',
      },
      reasoning: expect.arrayContaining([
        expect.stringContaining('Assist pattern CP-024'),
        expect.stringContaining('GATE_ANAPHYLAXIS'),
        expect.stringContaining('PROTO_ANAPHYLAXIS'),
      ]),
      source: 'pattern',
      acknowledged: false,
      triggeredAt: '2026-04-19T16:00:00.000Z',
    })
    expect(JSON.stringify(alert).toLowerCase()).not.toMatch(/nik|bpjs|raw name|nomor rm/)
  })

  it('publishes per-CP parity fixtures and proves every fixture maps to a Symphony alert', () => {
    const fixtureIds = ASSIST_PATTERN_PARITY_FIXTURE_CASES.map((fixture) => fixture.patternId)
    const results = runAssistPatternParityFixtures({ triggeredAt: '2026-04-19T16:30:00.000Z' })

    expect(fixtureIds).toEqual(EXPECTED_CP_IDS)
    expect(results).toHaveLength(70)
    expect(results.every((result) => result.passed)).toBe(true)
    expect(results.flatMap((result) => result.mismatches)).toEqual([])
    expect(results.map((result) => result.alert.id)).toContain('assist-cp-001')
    expect(results.map((result) => result.alert.id)).toContain('assist-cp-070')
  })
})
