// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import type {
  SymphonyAlert,
  SymphonyDiagnosticHypothesis,
  SymphonyResult,
  SymphonyShadowComparison,
} from '../index'
import {
  buildCriticalAlertCards,
  buildDispositionCards,
  buildMustNotMissCards,
  buildShadowCards,
  buildTopHypothesisCards,
} from '../interop/cds-hooks-card-policy'

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
  category: SymphonyDiagnosticHypothesis['category'] = 'working',
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
  agreementLevel: SymphonyShadowComparison['agreementLevel'],
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

describe('cds-hooks card policy', () => {
  it('builds one critical card per critical alert', () => {
    const cards = buildCriticalAlertCards(
      baseResult({ alerts: [criticalAlert('alert-a'), criticalAlert('alert-b')] }),
    )
    expect(cards).toHaveLength(2)
    expect(cards.map(card => card.indicator)).toEqual(['critical', 'critical'])
  })

  it('omits must-not-miss cards when no must_not_miss hypothesis is present', () => {
    const cards = buildMustNotMissCards(
      baseResult({ nativeHypotheses: [hypothesis(1, 'J18.9', 'working')] }),
    )
    expect(cards).toEqual([])
  })

  it('suppresses top hypothesis card when top category is must_not_miss', () => {
    const cards = buildTopHypothesisCards(
      baseResult({ nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')] }),
    )
    expect(cards).toEqual([])
  })

  it('emits a disposition card only when review is required', () => {
    expect(buildDispositionCards(baseResult({ clinicalDisposition: 'requires_review' }))).toHaveLength(
      1,
    )
    expect(buildDispositionCards(baseResult({ clinicalDisposition: 'ok' }))).toEqual([])
  })

  it('emits a shadow card only for low agreement', () => {
    expect(buildShadowCards(baseResult({ shadowComparison: shadow('low') }))).toHaveLength(1)
    expect(buildShadowCards(baseResult({ shadowComparison: shadow('partial') }))).toEqual([])
  })
})
