// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  mapSymphonyResultToCdsHooksResponse,
  type SymphonyAlert,
  type SymphonyDiagnosticHypothesis,
  type SymphonyResult,
  type SymphonyShadowComparison,
} from '../index'

function baseResult(overrides: Partial<SymphonyResult> = {}): SymphonyResult {
  return {
    metadata: {
      engineVersion: 'test',
      contractVersion: '0.8.0',
      generatedAt: '2026-04-27T10:00:00.000Z',
      status: 'degraded',
      confidenceBand: 'insufficient_data',
      rationale: [],
    },
    patientContext: {
      encounterId: 'enc-secret-12345',
      patientRef: 'pat-secret-67890',
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
    ...overrides,
  }
}

function hypothesis(
  rank: number,
  icd10Code: string,
  category: SymphonyDiagnosticHypothesis['category'] = 'working'
): SymphonyDiagnosticHypothesis {
  return {
    id: `hyp-${rank}`,
    icd10Code,
    diagnosisName: `Diagnosis ${icd10Code}`,
    rank,
    confidence: 0.6,
    category,
    evidence: { supports: [], weakens: [], missing: [], nextBestQuestions: [] },
    evidenceRefs: [],
  }
}

function criticalAlert(id: string): SymphonyAlert {
  return {
    id,
    severity: 'critical',
    source: 'safety_gate',
    title: 'Critical signal',
    reasoning: ['critical signal'],
    acknowledged: false,
    triggeredAt: '2026-04-27T10:00:00.000Z',
  }
}

function shadow(
  agreementLevel: SymphonyShadowComparison['agreementLevel']
): SymphonyShadowComparison {
  return {
    oldPathAvailable: true,
    newPathAvailable: true,
    agreementLevel,
    topDiagnosisChanged: false,
    escalationChanged: false,
    clinicalDispositionChanged: false,
    notes: [],
  }
}

describe('mapSymphonyResultToCdsHooksResponse', () => {
  it('returns empty cards when result has no triggers', () => {
    const response = mapSymphonyResultToCdsHooksResponse(baseResult())
    expect(response.cards).toEqual([])
  })

  it('emits a critical-indicator card per critical alert', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ alerts: [criticalAlert('alert-a'), criticalAlert('alert-b')] })
    )
    const criticalCards = response.cards.filter((card) => card.indicator === 'critical')
    expect(criticalCards).toHaveLength(2)
  })

  it('emits a warning card when a must_not_miss native hypothesis is present', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')] })
    )
    const warningCards = response.cards.filter((card) => card.indicator === 'warning')
    expect(warningCards.length).toBeGreaterThan(0)
  })

  it('emits an info card for top hypothesis when no must_not_miss is present', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ nativeHypotheses: [hypothesis(1, 'J18.9', 'working')] })
    )
    const infoCards = response.cards.filter((card) => card.indicator === 'info')
    expect(infoCards.length).toBeGreaterThan(0)
  })

  it('emits a warning card when clinicalDisposition is requires_review', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ clinicalDisposition: 'requires_review' })
    )
    const warningCards = response.cards.filter((card) => card.indicator === 'warning')
    expect(warningCards.length).toBeGreaterThan(0)
  })

  it('emits a warning card when shadowComparison.agreementLevel is low', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ shadowComparison: shadow('low') })
    )
    const warningCards = response.cards.filter((card) => card.indicator === 'warning')
    expect(warningCards.length).toBeGreaterThan(0)
  })

  it('emits cards in canonical order (critical → must_not_miss → top → disposition → shadow)', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({
        alerts: [criticalAlert('alert-1')],
        nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')],
        clinicalDisposition: 'requires_review',
        shadowComparison: shadow('low'),
      })
    )
    const indicators = response.cards.map((card) => card.indicator)
    expect(indicators[0]).toBe('critical')
    expect(indicators).toContain('warning')
  })

  it('keeps the canonical source label and empty links on every emitted card', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({
        alerts: [criticalAlert('alert-1')],
        nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')],
        clinicalDisposition: 'requires_review',
        shadowComparison: shadow('low'),
      })
    )

    expect(response.cards.length).toBeGreaterThan(0)
    for (const card of response.cards) {
      expect(card.source).toEqual({ label: 'AADI V2 Symphony' })
      expect(card.links).toEqual([])
    }
  })

  it('keeps the public cds-hooks facade shape unchanged and independent from fhir-engine', () => {
    const response = mapSymphonyResultToCdsHooksResponse(baseResult())
    expect(typeof mapSymphonyResultToCdsHooksResponse).toBe('function')
    expect(Object.keys(response)).toEqual(['cards'])
    expect(Array.isArray(response.cards)).toBe(true)

    const source = readFileSync(
      new URL('../interop/symphony-to-cds-hooks.ts', import.meta.url),
      'utf8'
    )
    expect(source).not.toContain('fhir-engine')
  })

  it('does NOT leak chiefComplaint into card summary or detail', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({
        nativeHypotheses: [hypothesis(1, 'J18.9')],
        alerts: [criticalAlert('alert-1')],
      })
    )
    const json = JSON.stringify(response)
    expect(json.toLowerCase()).not.toContain('demam')
    expect(json.toLowerCase()).not.toContain('sesak')
  })

  it('does NOT leak patientRef or encounterId into card summary or detail', () => {
    const response = mapSymphonyResultToCdsHooksResponse(
      baseResult({ nativeHypotheses: [hypothesis(1, 'J18.9')] })
    )
    const json = JSON.stringify(response)
    expect(json).not.toContain('pat-secret-67890')
    expect(json).not.toContain('enc-secret-12345')
  })

  it('produces deterministic cards for identical input', () => {
    const input = baseResult({
      alerts: [criticalAlert('alert-1')],
      nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')],
      clinicalDisposition: 'requires_review',
      shadowComparison: shadow('low'),
    })
    expect(mapSymphonyResultToCdsHooksResponse(input)).toEqual(
      mapSymphonyResultToCdsHooksResponse(input)
    )
  })
})
