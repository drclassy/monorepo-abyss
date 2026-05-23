// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import { composeSymphonyExplainability, determineSymphonyClinicalDisposition } from '../index'

describe('determineSymphonyClinicalDisposition', () => {
  it('marks requires_review when critical alerts coexist with coherent hypotheses', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 2,
      hasCriticalAlert: true,
      usedFallback: false,
    })
    expect(disposition).toBe('requires_review')
  })

  it('marks degraded when fallback path is used (highest precedence)', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 2,
      hasCriticalAlert: true,
      usedFallback: true,
    })
    expect(disposition).toBe('degraded')
  })

  it('marks insufficient_data when no native hypotheses are produced', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 0,
      hasCriticalAlert: true,
      usedFallback: false,
    })
    expect(disposition).toBe('insufficient_data')
  })

  it('marks requires_review when arbiter requires review even without critical alert', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 1,
      hasCriticalAlert: false,
      usedFallback: false,
      arbiterRequiresReview: true,
    })
    expect(disposition).toBe('requires_review')
  })

  it('marks ok when hypotheses exist with no critical and no arbiter review trigger', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 1,
      hasCriticalAlert: false,
      usedFallback: false,
    })
    expect(disposition).toBe('ok')
  })

  it('produces deterministic output', () => {
    const input = {
      nativeHypothesisCount: 2,
      hasCriticalAlert: true,
      usedFallback: false,
      arbiterRequiresReview: true,
    }
    expect(determineSymphonyClinicalDisposition(input)).toBe(
      determineSymphonyClinicalDisposition(input)
    )
  })
})

describe('composeSymphonyExplainability', () => {
  it('returns clinician-readable reasoning summary referencing diagnosis name', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia, unspecified organism',
      supportKeys: ['symptom_fever', 'symptom_dyspnea'],
      missingKeys: ['photo_thorax'],
    })
    expect(lines[0]).toContain('Pneumonia')
    expect(lines.join(' ')).toContain('symptom_fever')
    expect(lines.join(' ')).toContain('photo_thorax')
  })

  it('emits "tidak ada" placeholder when supports are empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Hypertensive crisis context',
      supportKeys: [],
      missingKeys: ['htn_severity'],
    })
    expect(lines.some((line) => line.includes('Faktor pendukung: tidak ada'))).toBe(true)
  })

  it('emits "tidak ada" placeholder when missing keys are empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Sepsis, unspecified organism',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
    })
    expect(lines.some((line) => line.includes('Data yang masih dibutuhkan: tidak ada'))).toBe(true)
  })

  it('omits weaken line when weakenKeys are not provided or empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
    })
    expect(lines.some((line) => line.startsWith('Faktor pelemah'))).toBe(false)
  })

  it('includes weaken line when weakenKeys are non-empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
      weakenKeys: ['symptom_chest_pain_pleuritic_absent'],
    })
    expect(lines.some((line) => line.startsWith('Faktor pelemah'))).toBe(true)
    expect(lines.join(' ')).toContain('symptom_chest_pain_pleuritic_absent')
  })

  it('omits next-best-questions line when not provided or empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
      nextBestQuestions: [],
    })
    expect(lines.some((line) => line.startsWith('Pertanyaan klinis lanjutan'))).toBe(false)
  })

  it('includes next-best-questions when provided', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
      nextBestQuestions: ['Apakah ada batuk produktif atau ronki?'],
    })
    expect(lines.some((line) => line.startsWith('Pertanyaan klinis lanjutan'))).toBe(true)
    expect(lines.join(' ')).toContain('batuk produktif')
  })

  it('surfaces arbitration reasons honestly when provided (constraint #2)', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Sepsis',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
      arbitrationReasons: ['safety_critical_alert_present', 'native_must_not_miss_visible'],
    })
    const joined = lines.join(' ')
    expect(joined).toContain('Alert kritikal')
    expect(joined).toContain('must-not-miss')
  })

  it('omits arbiter line when arbitrationReasons is empty or undefined', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia',
      supportKeys: ['symptom_fever'],
      missingKeys: [],
    })
    expect(lines.some((line) => line.startsWith('Catatan arbiter'))).toBe(false)
  })

  it('produces deterministic output (same input → identical lines)', () => {
    const input = {
      topDiagnosisName: 'Sepsis',
      supportKeys: ['symptom_fever', 'screening_gate_count'],
      missingKeys: ['lactate', 'blood_culture'],
      weakenKeys: ['ext_normothermia'],
      nextBestQuestions: ['Sumber infeksi?'],
      arbitrationReasons: ['safety_critical_alert_present'],
    }
    expect(composeSymphonyExplainability(input)).toEqual(composeSymphonyExplainability(input))
  })

  it('does not fabricate content when all evidence inputs are empty', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Unspecified',
      supportKeys: [],
      missingKeys: [],
    })
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('Unspecified')
    expect(lines.some((line) => line.includes('tidak ada'))).toBe(true)
  })
})
