// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  SYMPHONY_ENGINE_PACKAGE_NAME,
  assessSymphonyInput,
  type SymphonyAssessmentInput,
  type SymphonyClinicalDisposition,
  type SymphonyClinicalFact,
  type SymphonyDiagnosticHypothesis,
  type SymphonyResult,
} from '../index'

describe('AADI V2 contract extensions', () => {
  it('allows clinical disposition values', () => {
    const values: SymphonyClinicalDisposition[] = [
      'ok',
      'requires_review',
      'insufficient_data',
      'degraded',
    ]
    expect(values).toHaveLength(4)
  })

  it('supports native hypothesis and fact arrays on result', () => {
    const facts: SymphonyClinicalFact[] = [
      { key: 'fever', value: true, sourceRefs: ['symptom:chief_complaint'] },
    ]
    const hypotheses: SymphonyDiagnosticHypothesis[] = [
      {
        id: 'native-j18-1',
        icd10Code: 'J18.9',
        diagnosisName: 'Pneumonia, unspecified',
        rank: 1,
        confidence: 0.72,
        category: 'working',
        evidence: {
          supports: ['Demam', 'Batuk', 'Takipnea'],
          weakens: [],
          missing: ['Foto toraks'],
          nextBestQuestions: ['Apakah ada sesak progresif?'],
        },
        evidenceRefs: ['pattern:respiratory', 'news2:medium'],
      },
    ]

    const result = {} as SymphonyResult
    result.clinicalDisposition = 'requires_review'
    result.clinicalFacts = facts
    result.nativeHypotheses = hypotheses

    expect(result.clinicalDisposition).toBe('requires_review')
    expect(result.clinicalFacts?.[0]?.key).toBe('fever')
    expect(result.nativeHypotheses?.[0]?.category).toBe('working')
  })
})

describe('@sentra/nada scaffold', () => {
  it('exports the engine package identity', () => {
    expect(SYMPHONY_ENGINE_PACKAGE_NAME).toBe('@sentra/nada')
  })

  it('emits ready status with insufficient_data disposition for empty input (post-lift v0.8.0)', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-smoke',
        requestedAt: '2026-04-18T00:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-smoke',
        patientRef: 'patient-smoke',
      },
      vitals: [],
    }

    const result = assessSymphonyInput(input)

    expect(result.metadata.status).toBe('ready')
    expect(result.metadata.degradedReason).toBeUndefined()
    expect(result.clinicalDisposition).toBe('insufficient_data')
    expect(result.quality.safetyFlags).toEqual([])
    expect(result.patientContext).toEqual(input.patientContext)
    expect(result.alerts).toHaveLength(0)
    expect(result.diagnosisSuggestions).toHaveLength(0)
    expect(result.trafficLight).toBeUndefined()
  })
})
