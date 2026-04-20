// Designed and constructed by Avvcenna+.
/**
 * symptom-signals — RED test suite for the deterministic Indonesian
 * symptom-signals NLP module.
 *
 * Phase 1 of the SYMPHONY canonicalization migration (Gap #8 in the
 * 2026-04-20 coverage audit). Pure TS, zero runtime deps. Negation-aware
 * matcher with a 3-token left window.
 */

import { describe, expect, it } from 'vitest'

import {
  detectSymphonySymptomSignals,
  type SymphonySymptomSignalInput,
  type SymphonySymptomSignalResult,
} from '../index'

describe('SYMPHONY symptom signals', () => {
  it('returns empty signal set for empty input', () => {
    const input: SymphonySymptomSignalInput = {
      chiefComplaint: '',
    }
    const result: SymphonySymptomSignalResult = detectSymphonySymptomSignals(input)
    expect(result.signals).toEqual([])
    expect(result.negatedSignals).toEqual([])
  })

  it('detects fever from positive Indonesian terms', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'demam tinggi sejak kemarin' })
    expect(result.signals).toContain('fever')
    expect(result.negatedSignals).not.toContain('fever')
  })

  it('strips fever when negated with "tidak"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'tidak demam, cuma lemas' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('strips fever when negated with "tanpa"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'batuk tanpa demam' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('detects fever from panas and meriang synonyms', () => {
    const resultPanas = detectSymphonySymptomSignals({ chiefComplaint: 'panas badan sejak 2 hari' })
    const resultMeriang = detectSymphonySymptomSignals({
      chiefComplaint: 'meriang sepanjang malam',
    })
    expect(resultPanas.signals).toContain('fever')
    expect(resultMeriang.signals).toContain('fever')
  })

  it('detects dyspnea from sesak and sulit napas', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sesak napas saat aktivitas' }).signals
    ).toContain('dyspnea')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sulit napas sejak pagi' }).signals
    ).toContain('dyspnea')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'pasien susah napas' }).signals
    ).toContain('dyspnea')
  })

  it('strips dyspnea when negated', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'batuk tanpa sesak' })
    expect(result.signals).not.toContain('dyspnea')
    expect(result.negatedSignals).toContain('dyspnea')
  })
})
