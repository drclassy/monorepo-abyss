import { describe, expect, it } from 'vitest'

import {
  ASSIST_PATTERN_PARITY_FIXTURE_CASES,
  SYMPHONY_PARITY_FIXTURE_CASES,
  runSymphonyParityFixture,
  runSymphonyParityFixtures,
  type SymphonyParityFixtureCase,
} from '../index'

function requireParityFixture(id: string): SymphonyParityFixtureCase {
  const found = SYMPHONY_PARITY_FIXTURE_CASES.find((fixture) => fixture.id === id)
  if (!found) {
    throw new Error(`parity fixture invariant: '${id}' must exist in SYMPHONY_PARITY_FIXTURE_CASES`)
  }
  return found
}

describe('SYMPHONY route parity fixtures', () => {
  it('publishes deterministic fixture cases for Dashboard and Assist parity checks', () => {
    expect(SYMPHONY_PARITY_FIXTURE_CASES.slice(0, 5).map(fixture => fixture.id)).toEqual([
      'adult-sepsis-respiratory-route',
      'obstetric-glucose-route',
      'pe-suspect-route',
      'anaphylaxis-route',
      'trajectory-diagnosis-route',
    ])
    expect(SYMPHONY_PARITY_FIXTURE_CASES).toHaveLength(75)
  })

  it('publishes route-level coverage fixtures for CP-001 through CP-070', () => {
    const cpFixtures = SYMPHONY_PARITY_FIXTURE_CASES.filter(fixture => /^cp-\d{3}-route$/.test(fixture.id))

    expect(cpFixtures).toHaveLength(70)
    expect(cpFixtures.map(fixture => fixture.assistPatternId)).toEqual(
      ASSIST_PATTERN_PARITY_FIXTURE_CASES.map(fixture => fixture.patternId)
    )
    expect(cpFixtures[0]?.id).toBe('cp-001-route')
    expect(cpFixtures.at(-1)?.id).toBe('cp-070-route')
  })

  it('normalizes assessment output into a stable parity snapshot', () => {
    const fixture = SYMPHONY_PARITY_FIXTURE_CASES[0]
    const result = runSymphonyParityFixture(fixture)

    expect(result.id).toBe('adult-sepsis-respiratory-route')
    expect(result.snapshot.news2Score).toBe(13)
    expect(result.snapshot.alertIds).toContain('symphony-gate-sepsis-qsofa')
    expect(result.snapshot.alertIds).toContain('symphony-news2-high')
    expect(result.passed).toBe(true)
    expect(result.mismatches).toHaveLength(0)
  })

  it('runs the full canonical fixture suite without mismatches', () => {
    const results = runSymphonyParityFixtures()

    expect(results).toHaveLength(75)
    expect(results.every(result => result.passed)).toBe(true)
    expect(results.flatMap(result => result.mismatches)).toEqual([])
    const trajectory = results.find(r => r.id === 'trajectory-diagnosis-route')
    expect(trajectory?.snapshot.diagnosisCategories).toContain('recommended')
    expect(trajectory?.snapshot.trajectoryDirection).toBe('worsening')
  })

  it('covers the Phase A PE Suspect and Anaphylaxis safety-gate alerts', () => {
    const pe = runSymphonyParityFixture(requireParityFixture('pe-suspect-route'))
    expect(pe.passed).toBe(true)
    expect(pe.snapshot.alertIds).toContain('SYMPHONY_PE_SUSPECT')

    const anaphylaxis = runSymphonyParityFixture(requireParityFixture('anaphylaxis-route'))
    expect(anaphylaxis.passed).toBe(true)
    expect(anaphylaxis.snapshot.alertIds).toContain('SYMPHONY_ANAPHYLAXIS')
  })
})
