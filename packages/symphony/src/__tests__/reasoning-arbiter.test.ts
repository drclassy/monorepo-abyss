import { describe, expect, it } from 'vitest'

import {
  arbitrateSymphonyReasoning,
  type SymphonyAlert,
  type SymphonyDiagnosticHypothesis,
  type SymphonyPersonalBaseline,
  type SymphonyTreatmentResponse,
  type SymphonyVitalsInput,
} from '../index'

const sepsisMustNotMiss: SymphonyDiagnosticHypothesis = {
  id: 'native-pack-sepsis',
  icd10Code: 'A41.9',
  diagnosisName: 'Sepsis, unspecified organism',
  rank: 1,
  confidence: 0.67,
  category: 'must_not_miss',
  evidence: {
    supports: ['symptom_fever'],
    weakens: [],
    missing: [],
    nextBestQuestions: [],
  },
  evidenceRefs: ['pack:pack-sepsis'],
}

const pneumoniaWorking: SymphonyDiagnosticHypothesis = {
  id: 'native-pack-pneumonia',
  icd10Code: 'J18.9',
  diagnosisName: 'Pneumonia, unspecified organism',
  rank: 1,
  confidence: 0.83,
  category: 'working',
  evidence: {
    supports: ['symptom_fever', 'symptom_dyspnea', 'news2_risk'],
    weakens: [],
    missing: [],
    nextBestQuestions: ['Apakah ada batuk produktif atau ronki?'],
  },
  evidenceRefs: ['pack:pack-pneumonia'],
}

const criticalSepsisAlert: SymphonyAlert = {
  id: 'alert-sepsis',
  severity: 'critical',
  title: 'Sepsis alert',
  reasoning: ['qSOFA positif'],
  source: 'pattern',
  actionProtocolId: 'PROTO_SEPSIS',
  acknowledged: false,
  triggeredAt: '2026-04-27T10:00:00.000Z',
}

const highVitalsAlert: SymphonyAlert = {
  id: 'alert-tachypnea',
  severity: 'high',
  title: 'Tachypnea',
  reasoning: ['RR > 24'],
  source: 'vitals',
  actionProtocolId: 'PROTO_RESPIRATORY',
  acknowledged: false,
  triggeredAt: '2026-04-27T10:01:00.000Z',
}

describe('arbitrateSymphonyReasoning', () => {
  it('preserves must-not-miss native and action protocol when critical alert is present', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [sepsisMustNotMiss],
      hybridSuggestions: [],
      alerts: [criticalSepsisAlert],
    })

    expect(result.nativeHypotheses[0]?.category).toBe('must_not_miss')
    expect(result.alerts[0]?.actionProtocolId).toBe('PROTO_SEPSIS')
    expect(result.alerts[0]?.severity).toBe('critical')
    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('safety_critical_alert_present')
    expect(result.arbitrationReasons).toContain('native_must_not_miss_visible')
  })

  it('rule A: critical alert alone forces requiresReview without altering alert', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [criticalSepsisAlert],
    })

    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('safety_critical_alert_present')
    expect(result.alerts[0]).toEqual(criticalSepsisAlert)
  })

  it('rule B: must-not-miss native alone forces requiresReview without alerts', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [sepsisMustNotMiss],
      hybridSuggestions: [],
      alerts: [],
    })

    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('native_must_not_miss_visible')
  })

  it('rule C: consciousness=pain via canonical AVPU helper raises review', () => {
    const vitals: SymphonyVitalsInput = {
      observedAt: '2026-04-27T10:00:00.000Z',
      consciousness: 'pain',
    }

    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [],
      latestVitals: vitals,
    })

    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('consciousness_compromised')
  })

  it('rule D: treatment response worsening raises review', () => {
    const treatment: SymphonyTreatmentResponse = {
      detected: true,
      parameter: 'heartRate',
      velocityBefore: 0,
      velocityAfter: 5,
      velocityChangePercent: null,
      interpretation: 'worsening',
      narrative: 'HR drift naik tajam',
    }

    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [],
      treatmentResponse: treatment,
    })

    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('treatment_response_worsening')
  })

  it('rule E: thin personal baseline + working hypothesis raises review', () => {
    const baseline: SymphonyPersonalBaseline = {
      computedAt: '2026-04-27T10:00:00.000Z',
      visitCount: 1,
      params: {},
    }

    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [],
      personalBaseline: baseline,
    })

    expect(result.requiresReview).toBe(true)
    expect(result.arbitrationReasons).toContain('baseline_thin_with_working_hypothesis')
  })

  it('preserves actionProtocolId pass-through across all alerts', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [],
      hybridSuggestions: [],
      alerts: [criticalSepsisAlert, highVitalsAlert],
    })

    expect(result.alerts[0]?.actionProtocolId).toBe('PROTO_SEPSIS')
    expect(result.alerts[1]?.actionProtocolId).toBe('PROTO_RESPIRATORY')
  })

  it('preserves native hypothesis rank order from input (no reordering)', () => {
    const ranked: SymphonyDiagnosticHypothesis[] = [
      { ...pneumoniaWorking, rank: 1 },
      { ...sepsisMustNotMiss, rank: 2 },
    ]

    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: ranked,
      hybridSuggestions: [],
      alerts: [],
    })

    expect(result.nativeHypotheses.map(item => item.id)).toEqual([
      'native-pack-pneumonia',
      'native-pack-sepsis',
    ])
    expect(result.nativeHypotheses[0]?.rank).toBe(1)
    expect(result.nativeHypotheses[1]?.rank).toBe(2)
  })

  it('returns safe defaults when all inputs are empty (no high-confidence default)', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [],
      hybridSuggestions: [],
      alerts: [],
    })

    expect(result.requiresReview).toBe(false)
    expect(result.arbitrationReasons).toEqual([])
    expect(result.nativeHypotheses).toEqual([])
    expect(result.alerts).toEqual([])
  })

  it('produces deterministic output: same input twice yields identical result', () => {
    const input = {
      nativeHypotheses: [sepsisMustNotMiss, pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [criticalSepsisAlert],
      treatmentResponse: {
        detected: true,
        parameter: null,
        velocityBefore: null,
        velocityAfter: null,
        velocityChangePercent: null,
        interpretation: 'worsening',
        narrative: 'worsening narrative',
      } satisfies SymphonyTreatmentResponse,
    }
    const first = arbitrateSymphonyReasoning(input)
    const second = arbitrateSymphonyReasoning(input)
    expect(first).toEqual(second)
  })

  it('never downgrades alert severity (critical and high preserved)', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [pneumoniaWorking],
      hybridSuggestions: [],
      alerts: [criticalSepsisAlert, highVitalsAlert],
    })

    expect(result.alerts[0]?.severity).toBe('critical')
    expect(result.alerts[1]?.severity).toBe('high')
  })
})
