// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  buildSymphonyAadiV2ParityObservation,
  runSymphonyAadiV2ParityFixtures,
  SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES,
  verifySymphonyAadiV2Parity,
  type SymphonyAadiV2ParityFixtureCase,
  type SymphonyAssessmentInput,
} from '../index'

function fixture(
  id: string,
  description: string,
  input: SymphonyAssessmentInput,
): SymphonyAadiV2ParityFixtureCase {
  return { id, description, input }
}

function emptyInput(id: string): SymphonyAssessmentInput {
  return {
    metadata: {
      requestId: `req-${id}`,
      requestedAt: '2026-04-27T10:00:00.000Z',
      caller: 'dashboard',
    },
    patientContext: {
      encounterId: `enc-${id}`,
      patientRef: `pat-${id}`,
    },
    vitals: [],
  }
}

describe('verifySymphonyAadiV2Parity', () => {
  it('returns pass verdict for canonical AADI V2 parity fixtures', () => {
    const report = runSymphonyAadiV2ParityFixtures()
    expect(report.verdict).toBe('pass')
    expect(report.gates.every(gate => gate.passed)).toBe(true)
    expect(report.totalFixtures).toBe(SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES.length)
  })

  it('counts agreement histogram correctly across canonical fixtures', () => {
    const report = runSymphonyAadiV2ParityFixtures()
    const total =
      report.agreementHistogram.high +
      report.agreementHistogram.partial +
      report.agreementHistogram.low +
      report.agreementHistogram.not_comparable
    expect(total).toBe(report.totalFixtures)
  })

  it('emits all four parity gates deterministically', () => {
    const report = runSymphonyAadiV2ParityFixtures()
    const gateIds = report.gates.map(gate => gate.id)
    expect(gateIds).toEqual([
      'AADIV2_PARITY_GATE_A_NO_LOW_AGREEMENT',
      'AADIV2_PARITY_GATE_B_NO_UNSAFE_ESCALATION_DOWNGRADE',
      'AADIV2_PARITY_GATE_C_NO_UNSAFE_DISPOSITION_DOWNGRADE',
      'AADIV2_PARITY_GATE_D_NO_PIPELINE_FAILURE',
    ])
  })

  it('returns pass verdict for all-empty fixtures (not_comparable everywhere)', () => {
    const fixtures = [
      fixture('empty-a', 'empty a', emptyInput('a')),
      fixture('empty-b', 'empty b', emptyInput('b')),
    ]
    const report = verifySymphonyAadiV2Parity(fixtures)
    expect(report.verdict).toBe('pass')
    expect(report.agreementHistogram.not_comparable).toBe(2)
    expect(report.comparableCount).toBe(0)
  })

  it('records pipeline failure count when fixtures complete without failure', () => {
    const report = runSymphonyAadiV2ParityFixtures()
    expect(report.pipelineFailureCount).toBe(0)
  })

  it('produces deterministic report for identical fixtures', () => {
    const report1 = runSymphonyAadiV2ParityFixtures()
    const report2 = runSymphonyAadiV2ParityFixtures()
    expect(report1.verdict).toBe(report2.verdict)
    expect(report1.agreementHistogram).toEqual(report2.agreementHistogram)
    expect(report1.gates).toEqual(report2.gates)
  })
})

describe('buildSymphonyAadiV2ParityObservation', () => {
  it('parses old/new escalation and disposition from shadowComparison notes', () => {
    const result = assessSymphonyInput(
      SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES[1].input,
    )
    const observation = buildSymphonyAadiV2ParityObservation(
      'febrile-test',
      result,
    )
    expect(observation.id).toBe('febrile-test')
    expect(observation.shadowComparison).toBeDefined()
    expect(observation.newClinicalDisposition).toBeDefined()
    if (observation.oldTrafficLightLevel !== null) {
      expect(['GREEN', 'YELLOW', 'RED']).toContain(observation.oldTrafficLightLevel)
    }
  })

  it('returns safe defaults when result has no shadowComparison', () => {
    const observation = buildSymphonyAadiV2ParityObservation('synthetic', {
      metadata: {
        engineVersion: 'test',
        contractVersion: '0.8.0',
        generatedAt: '2026-04-27T00:00:00.000Z',
        status: 'degraded',
        confidenceBand: 'insufficient_data',
        rationale: [],
      },
      patientContext: {
        encounterId: 'enc',
        patientRef: 'pat',
      },
      diagnosisSuggestions: [],
      alerts: [],
      trajectory: {
        direction: 'stable',
        momentum: 'flat',
        summary: '',
        evidenceRefs: [],
      },
      quality: {
        completenessScore: 0,
        missingFields: [],
        safetyFlags: [],
        auditHints: [],
      },
    })
    expect(observation.shadowComparison.agreementLevel).toBe('not_comparable')
    expect(observation.oldTrafficLightLevel).toBeNull()
    expect(observation.newTrafficLightLevel).toBeNull()
    expect(observation.pipelineFailed).toBe(false)
  })
})

describe('AADI V2 parity gate failure detection (synthetic)', () => {
  it('flags unsafe escalation downgrade detection logic via observation field shape', () => {
    const observation = buildSymphonyAadiV2ParityObservation('synthetic-downgrade', {
      metadata: {
        engineVersion: 'test',
        contractVersion: '0.8.0',
        generatedAt: '2026-04-27T00:00:00.000Z',
        status: 'degraded',
        confidenceBand: 'insufficient_data',
        rationale: [],
      },
      patientContext: { encounterId: 'enc', patientRef: 'pat' },
      diagnosisSuggestions: [],
      alerts: [],
      trajectory: {
        direction: 'stable',
        momentum: 'flat',
        summary: '',
        evidenceRefs: [],
      },
      quality: {
        completenessScore: 0,
        missingFields: [],
        safetyFlags: [],
        auditHints: [],
      },
      clinicalDisposition: 'ok',
      shadowComparison: {
        oldPathAvailable: true,
        newPathAvailable: true,
        agreementLevel: 'partial',
        topDiagnosisChanged: false,
        escalationChanged: true,
        clinicalDispositionChanged: false,
        notes: [
          'old_path_top:A41.9',
          'new_path_top:A41.9',
          'old_escalation:RED',
          'new_escalation:GREEN',
          'old_disposition:requires_review',
          'new_disposition:ok',
          'new_path_failed:0',
        ],
      },
    })
    expect(observation.oldTrafficLightLevel).toBe('RED')
    expect(observation.newTrafficLightLevel).toBe('GREEN')
    expect(observation.oldClinicalDisposition).toBe('requires_review')
    expect(observation.newClinicalDisposition).toBe('ok')
  })
})
