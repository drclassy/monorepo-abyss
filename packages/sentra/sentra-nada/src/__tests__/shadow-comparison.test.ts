// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  compareSymphonyShadowPaths,
  type SymphonyAlert,
  type SymphonyDiagnosisSuggestion,
  type SymphonyDiagnosticHypothesis,
} from '../index'

function hybrid(
  icd10Code: string,
  mustNotMiss = false,
): SymphonyDiagnosisSuggestion {
  return {
    id: `hybrid-${icd10Code}`,
    icd10Code,
    diagnosisName: `Hybrid ${icd10Code}`,
    confidence: 0.6,
    decisionCategory: mustNotMiss ? 'must_not_miss' : 'recommended',
    reasoning: ['hybrid reasoning'],
    evidenceRefs: ['hybrid:ref'],
    mustNotMiss,
  }
}

function native(
  icd10Code: string,
  category: SymphonyDiagnosticHypothesis['category'] = 'working',
): SymphonyDiagnosticHypothesis {
  return {
    id: `native-${icd10Code}`,
    icd10Code,
    diagnosisName: `Native ${icd10Code}`,
    rank: 1,
    confidence: 0.65,
    category,
    evidence: { supports: [], weakens: [], missing: [], nextBestQuestions: [] },
    evidenceRefs: ['native:ref'],
  }
}

function criticalAlert(): SymphonyAlert {
  return {
    id: 'alert-critical',
    severity: 'critical',
    source: 'safety_gate',
    message: 'critical',
    observedAt: '2026-04-27T00:00:00.000Z',
  }
}

describe('compareSymphonyShadowPaths', () => {
  it('returns not_comparable when both paths empty', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [],
      nativeHypotheses: [],
      alerts: [],
      newClinicalDisposition: 'insufficient_data',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('not_comparable')
    expect(result.oldPathAvailable).toBe(false)
    expect(result.newPathAvailable).toBe(false)
  })

  it('returns not_comparable when only old path is available', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10')],
      nativeHypotheses: [],
      alerts: [],
      newClinicalDisposition: 'insufficient_data',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('not_comparable')
    expect(result.oldPathAvailable).toBe(true)
    expect(result.newPathAvailable).toBe(false)
  })

  it('returns not_comparable when only new path is available', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('not_comparable')
    expect(result.oldPathAvailable).toBe(false)
    expect(result.newPathAvailable).toBe(true)
  })

  it('returns not_comparable when new path failed even if hypotheses present', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10')],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      newClinicalDisposition: 'degraded',
      newPathFailed: true,
    })
    expect(result.agreementLevel).toBe('not_comparable')
    expect(result.newPathAvailable).toBe(false)
  })

  it('returns high agreement when top, escalation, and disposition all match', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('J18.9')],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: 'YELLOW',
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('high')
    expect(result.topDiagnosisChanged).toBe(false)
    expect(result.escalationChanged).toBe(false)
    expect(result.clinicalDispositionChanged).toBe(false)
  })

  it('returns partial agreement when only top diagnosis differs', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10')],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: 'YELLOW',
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('partial')
    expect(result.topDiagnosisChanged).toBe(true)
    expect(result.escalationChanged).toBe(false)
    expect(result.clinicalDispositionChanged).toBe(false)
  })

  it('returns low agreement when top, escalation, and disposition all differ', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10', false)],
      nativeHypotheses: [native('A41.9', 'must_not_miss')],
      alerts: [],
      oldTrafficLightLevel: 'GREEN',
      newTrafficLightLevel: 'RED',
      newClinicalDisposition: 'requires_review',
      newPathFailed: false,
    })
    expect(result.agreementLevel).toBe('low')
    expect(result.topDiagnosisChanged).toBe(true)
    expect(result.escalationChanged).toBe(true)
    expect(result.clinicalDispositionChanged).toBe(true)
  })

  it('detects escalation change when only one path produced a traffic-light level', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10')],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: undefined,
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.escalationChanged).toBe(true)
  })

  it('emits deterministic notes covering both paths side-by-side', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10', true)],
      nativeHypotheses: [native('J18.9')],
      alerts: [criticalAlert()],
      oldTrafficLightLevel: 'RED',
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'requires_review',
      newPathFailed: false,
    })
    expect(result.notes).toContain('old_path_top:I10')
    expect(result.notes).toContain('new_path_top:J18.9')
    expect(result.notes).toContain('old_escalation:RED')
    expect(result.notes).toContain('new_escalation:YELLOW')
    expect(result.notes).toContain('new_disposition:requires_review')
    expect(result.notes).toContain('new_path_failed:0')
  })

  it('uses determineSymphonyClinicalDisposition for old-path disposition derivation', () => {
    const withMustNotMiss = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('A41.9', true)],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(withMustNotMiss.notes).toContain('old_disposition:requires_review')

    const withoutMustNotMiss = compareSymphonyShadowPaths({
      hybridSuggestions: [hybrid('I10', false)],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(withoutMustNotMiss.notes).toContain('old_disposition:ok')
  })

  it('produces deterministic output for identical input', () => {
    const input = {
      hybridSuggestions: [hybrid('I10')],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: 'YELLOW' as const,
      newTrafficLightLevel: 'YELLOW' as const,
      newClinicalDisposition: 'ok' as const,
      newPathFailed: false,
    }
    expect(compareSymphonyShadowPaths(input)).toEqual(
      compareSymphonyShadowPaths(input),
    )
  })

  it('treats old path as available when only an old traffic-light evaluation is present', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: 'YELLOW',
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.oldPathAvailable).toBe(true)
    expect(result.newPathAvailable).toBe(true)
    expect(result.agreementLevel).not.toBe('not_comparable')
    expect(result.escalationChanged).toBe(false)
  })

  it('keeps old path unavailable when no hybrid suggestions and no old traffic-light evaluation', () => {
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: undefined,
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.oldPathAvailable).toBe(false)
    expect(result.agreementLevel).toBe('not_comparable')
  })

  it('does not confuse native compatibility suggestions with new-path source', () => {
    const nativeCompatPretendingToBeHybrid: SymphonyDiagnosisSuggestion = {
      id: 'native:native-J18.9',
      icd10Code: 'J18.9',
      diagnosisName: 'Native J18.9',
      confidence: 0.65,
      decisionCategory: 'recommended',
      reasoning: [],
      evidenceRefs: [],
      mustNotMiss: false,
    }
    const result = compareSymphonyShadowPaths({
      hybridSuggestions: [nativeCompatPretendingToBeHybrid],
      nativeHypotheses: [native('J18.9')],
      alerts: [],
      oldTrafficLightLevel: 'YELLOW',
      newTrafficLightLevel: 'YELLOW',
      newClinicalDisposition: 'ok',
      newPathFailed: false,
    })
    expect(result.oldPathAvailable).toBe(true)
    expect(result.newPathAvailable).toBe(true)
  })
})
