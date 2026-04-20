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
})
