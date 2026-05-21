// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  mapSymphonyResultToFhirBundle,
  type SymphonyAlert,
  type SymphonyDiagnosticHypothesis,
  type SymphonyResult,
  type SymphonyTrafficLightOutput,
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
    title: 'Critical alert',
    reasoning: ['critical alert'],
    acknowledged: false,
    triggeredAt: '2026-04-27T10:00:00.000Z',
  }
}

function trafficLight(level: 'GREEN' | 'YELLOW' | 'RED'): SymphonyTrafficLightOutput {
  return { level, reason: 'test', gateResults: [], overrideApplied: false }
}

describe('mapSymphonyResultToFhirBundle', () => {
  it('returns empty entry array with meta when result has no hypotheses, alerts, or rationale', () => {
    const bundle = mapSymphonyResultToFhirBundle(baseResult())
    expect(bundle.resourceType).toBe('Bundle')
    expect(bundle.type).toBe('collection')
    expect(bundle.entry).toHaveLength(0)
    expect(bundle.meta.contractVersion).toBe('0.8.0')
    expect(bundle.meta.generatedAt).toBe('2026-04-27T10:00:00.000Z')
  })

  it('maps single nativeHypothesis into one Condition resource with ICD-10 coding', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({ nativeHypotheses: [hypothesis(1, 'J18.9')] }),
    )
    const conditions = bundle.entry.filter(e => e.resource.resourceType === 'Condition')
    expect(conditions).toHaveLength(1)
    const cond = conditions[0].resource as Extract<
      typeof conditions[0]['resource'],
      { resourceType: 'Condition' }
    >
    expect(cond.code.coding[0].system).toBe('http://hl7.org/fhir/sid/icd-10')
    expect(cond.code.coding[0].code).toBe('J18.9')
  })

  it('maps multiple hypotheses preserving rank order', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({
        nativeHypotheses: [
          hypothesis(1, 'J18.9'),
          hypothesis(2, 'A41.9'),
          hypothesis(3, 'I10'),
        ],
      }),
    )
    const conditions = bundle.entry
      .filter(e => e.resource.resourceType === 'Condition')
      .map(e => e.resource as Extract<typeof e.resource, { resourceType: 'Condition' }>)
    expect(conditions.map(c => c.code.coding[0].code)).toEqual([
      'J18.9',
      'A41.9',
      'I10',
    ])
  })

  it('marks must_not_miss hypothesis with category=must_not_miss in Condition', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({ nativeHypotheses: [hypothesis(1, 'A41.9', 'must_not_miss')] }),
    )
    const cond = bundle.entry[0].resource as Extract<
      typeof bundle.entry[0]['resource'],
      { resourceType: 'Condition' }
    >
    expect(cond.category).toBe('must_not_miss')
  })

  it('maps trafficLight=RED into RiskAssessment with qualitativeRisk RED', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({ trafficLight: trafficLight('RED') }),
    )
    const risks = bundle.entry.filter(e => e.resource.resourceType === 'RiskAssessment')
    expect(risks).toHaveLength(1)
    const risk = risks[0].resource as Extract<
      typeof risks[0]['resource'],
      { resourceType: 'RiskAssessment' }
    >
    expect(risk.prediction[0].qualitativeRisk.coding[0].code).toBe('RED')
  })

  it('maps non-empty metadata.rationale into a DiagnosticReport with conclusion', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({
        metadata: {
          engineVersion: 'test',
          contractVersion: '0.8.0',
          generatedAt: '2026-04-27T10:00:00.000Z',
          status: 'degraded',
          confidenceBand: 'insufficient_data',
          rationale: ['Diagnosis utama saat ini: Pneumonia.', 'Faktor pendukung: tidak ada.'],
        },
      }),
    )
    const reports = bundle.entry.filter(e => e.resource.resourceType === 'DiagnosticReport')
    expect(reports).toHaveLength(1)
    const report = reports[0].resource as Extract<
      typeof reports[0]['resource'],
      { resourceType: 'DiagnosticReport' }
    >
    expect(report.conclusion).toContain('Pneumonia')
  })

  it('maps critical alerts into Observation resources', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({ alerts: [criticalAlert('alert-a'), criticalAlert('alert-b')] }),
    )
    const observations = bundle.entry.filter(e => e.resource.resourceType === 'Observation')
    expect(observations).toHaveLength(2)
  })

  it('does NOT leak chiefComplaint or any free-text patient narrative into bundle JSON', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({
        nativeHypotheses: [hypothesis(1, 'J18.9')],
        alerts: [criticalAlert('alert-1')],
        trafficLight: trafficLight('YELLOW'),
      }),
    )
    const json = JSON.stringify(bundle)
    expect(json.toLowerCase()).not.toContain('demam')
    expect(json.toLowerCase()).not.toContain('sesak')
    expect(json.toLowerCase()).not.toContain('chiefcomplaint')
  })

  it('does NOT leak patientRef or encounterId into any human-readable bundle field', () => {
    const bundle = mapSymphonyResultToFhirBundle(
      baseResult({ nativeHypotheses: [hypothesis(1, 'J18.9')] }),
    )
    const json = JSON.stringify(bundle)
    expect(json).not.toContain('pat-secret-67890')
    expect(json).not.toContain('enc-secret-12345')
  })

  it('produces deterministic bundle for identical input', () => {
    const input = baseResult({
      nativeHypotheses: [hypothesis(1, 'J18.9'), hypothesis(2, 'A41.9')],
      alerts: [criticalAlert('alert-1')],
      trafficLight: trafficLight('YELLOW'),
      metadata: {
        engineVersion: 'test',
        contractVersion: '0.8.0',
        generatedAt: '2026-04-27T10:00:00.000Z',
        status: 'degraded',
        confidenceBand: 'insufficient_data',
        rationale: ['Diagnosis utama saat ini: Pneumonia.'],
      },
    })
    expect(mapSymphonyResultToFhirBundle(input)).toEqual(
      mapSymphonyResultToFhirBundle(input),
    )
  })
})
