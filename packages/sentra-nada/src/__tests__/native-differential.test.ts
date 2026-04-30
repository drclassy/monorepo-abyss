// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  buildSymphonyNativeDifferential,
  getSymphonyDiagnosisPacks,
  type SymphonyClinicalFact,
  type SymphonySyndromeMatch,
} from '../index'

const baseFebrileRespiratorySyndromes: SymphonySyndromeMatch[] = [
  { id: 'acute_respiratory_syndrome', confidence: 0.76, reasons: ['Respiratory syndrome'] },
  { id: 'acute_febrile_syndrome', confidence: 0.62, reasons: ['Febrile syndrome'] },
]

const baseFebrileRespiratoryFacts: SymphonyClinicalFact[] = [
  { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
  { key: 'symptom_dyspnea', value: true, sourceRefs: ['symptom-signals'] },
  { key: 'news2_risk', value: 'medium', sourceRefs: ['news2'] },
]

describe('getSymphonyDiagnosisPacks', () => {
  it('exposes exactly the canonical Phase 1 pack set (pneumonia, sepsis, htn-crisis)', () => {
    const packs = getSymphonyDiagnosisPacks()
    const ids = packs.map(item => item.id).sort()
    expect(ids).toEqual(['pack-htn-crisis', 'pack-pneumonia', 'pack-sepsis'])
  })

  it('does not include any Indonesia-specific or deferred packs in Phase 1', () => {
    const ids = getSymphonyDiagnosisPacks().map(item => item.id)
    expect(ids).not.toContain('pack-dengue')
    expect(ids).not.toContain('pack-tb')
    expect(ids).not.toContain('pack-preeclampsia')
  })
})

describe('buildSymphonyNativeDifferential', () => {
  it('ranks pneumonia pack above generic febrile pack when dyspnea is present', () => {
    const result = buildSymphonyNativeDifferential({
      facts: baseFebrileRespiratoryFacts,
      syndromes: baseFebrileRespiratorySyndromes,
      packs: getSymphonyDiagnosisPacks(),
    })

    expect(result.hypotheses[0]?.icd10Code).toBe('J18.9')
    expect(result.hypotheses[0]?.category).toBe('working')
    expect(result.hypotheses[0]?.rank).toBe(1)
  })

  it('classifies sepsis pack as must_not_miss when febrile syndrome is active', () => {
    const result = buildSymphonyNativeDifferential({
      facts: [
        { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
        { key: 'screening_gate_count', value: 2, sourceRefs: ['screening-gates'] },
      ],
      syndromes: [
        { id: 'acute_febrile_syndrome', confidence: 0.62, reasons: ['Febrile syndrome'] },
      ],
      packs: getSymphonyDiagnosisPacks(),
    })

    const sepsis = result.hypotheses.find(item => item.icd10Code === 'A41.9')
    expect(sepsis).toBeDefined()
    expect(sepsis?.category).toBe('must_not_miss')
  })

  it('triggers htn-crisis pack when cardiometabolic syndrome is matched', () => {
    const result = buildSymphonyNativeDifferential({
      facts: [
        { key: 'htn_severity', value: 'crisis', sourceRefs: ['classifiers'] },
        { key: 'trajectory_direction', value: 'worsening', sourceRefs: ['trajectory'] },
      ],
      syndromes: [
        {
          id: 'acute_cardiometabolic_syndrome',
          confidence: 0.71,
          reasons: ['Hypertension significant'],
        },
      ],
      packs: getSymphonyDiagnosisPacks(),
    })

    const htn = result.hypotheses.find(item => item.icd10Code === 'I10')
    expect(htn).toBeDefined()
    expect(htn?.category).toBe('must_not_miss')
  })

  it('emits the full evidence shape (supports, weakens, missing, nextBestQuestions)', () => {
    const result = buildSymphonyNativeDifferential({
      facts: baseFebrileRespiratoryFacts,
      syndromes: baseFebrileRespiratorySyndromes,
      packs: getSymphonyDiagnosisPacks(),
    })

    const top = result.hypotheses[0]
    expect(top?.evidence.supports.length).toBeGreaterThan(0)
    expect(Array.isArray(top?.evidence.weakens)).toBe(true)
    expect(Array.isArray(top?.evidence.missing)).toBe(true)
    expect(top?.evidence.nextBestQuestions.length).toBeGreaterThan(0)
    expect(top?.evidenceRefs.some(ref => ref.startsWith('pack:'))).toBe(true)
    expect(top?.evidenceRefs.some(ref => ref.startsWith('syndrome:'))).toBe(true)
  })

  it('produces deterministic output: same input yields identical hypotheses', () => {
    const input = {
      facts: baseFebrileRespiratoryFacts,
      syndromes: baseFebrileRespiratorySyndromes,
      packs: getSymphonyDiagnosisPacks(),
    }
    const first = buildSymphonyNativeDifferential(input)
    const second = buildSymphonyNativeDifferential(input)
    expect(first).toEqual(second)
  })

  it('returns empty hypotheses when no canonical syndrome is present (no high-confidence default)', () => {
    const result = buildSymphonyNativeDifferential({
      facts: [{ key: 'news2_risk', value: 'low', sourceRefs: ['news2'] }],
      syndromes: [],
      packs: getSymphonyDiagnosisPacks(),
    })
    expect(result.hypotheses).toEqual([])
  })
})
