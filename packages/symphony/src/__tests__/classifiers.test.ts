import { describe, expect, it } from 'vitest'

import {
  assessSymphonyConsciousnessSeverity,
  symphonyAvpuToEstimatedGcs,
  symphonyAvpuToGcsTotal,
  symphonyAvpuToNews2Score,
  symphonyGcsToAvpu,
} from '../index'

describe('assessSymphonyConsciousnessSeverity', () => {
  describe('AVPU path (no GCS)', () => {
    it("'A' → 'normal'", () => {
      expect(assessSymphonyConsciousnessSeverity('A')).toBe('normal')
    })
    it("'V' → 'impaired'", () => {
      expect(assessSymphonyConsciousnessSeverity('V')).toBe('impaired')
    })
    it("'P' → 'severe'", () => {
      expect(assessSymphonyConsciousnessSeverity('P')).toBe('severe')
    })
    it("'U' → 'unresponsive'", () => {
      expect(assessSymphonyConsciousnessSeverity('U')).toBe('unresponsive')
    })
  })

  describe('GCS path (overrides AVPU when provided)', () => {
    it('GCS 15 → normal', () => {
      expect(assessSymphonyConsciousnessSeverity('U', { e: 4, v: 5, m: 6 })).toBe('normal')
    })
    it('GCS 14 → impaired (total 13–14 range)', () => {
      expect(assessSymphonyConsciousnessSeverity('A', { e: 4, v: 4, m: 6 })).toBe('impaired')
    })
    it('GCS 9 → severe (total 4–12 range)', () => {
      expect(assessSymphonyConsciousnessSeverity('A', { e: 3, v: 3, m: 3 })).toBe('severe')
    })
    it('GCS 3 → unresponsive (total < 4)', () => {
      expect(assessSymphonyConsciousnessSeverity('A', { e: 1, v: 1, m: 1 })).toBe('unresponsive')
    })
  })
})

describe('symphonyAvpuToNews2Score', () => {
  it("'A' → 0 (alert = no derangement)", () => {
    expect(symphonyAvpuToNews2Score('A')).toBe(0)
  })
  it("'V' → 3 (maximum NEWS2 consciousness score)", () => {
    expect(symphonyAvpuToNews2Score('V')).toBe(3)
  })
  it("'P' → 3", () => {
    expect(symphonyAvpuToNews2Score('P')).toBe(3)
  })
  it("'U' → 3", () => {
    expect(symphonyAvpuToNews2Score('U')).toBe(3)
  })
})

describe('symphonyAvpuToGcsTotal', () => {
  it("'A' → 15", () => {
    expect(symphonyAvpuToGcsTotal('A')).toBe(15)
  })
  it("'V' → 11", () => {
    expect(symphonyAvpuToGcsTotal('V')).toBe(11)
  })
  it("'P' → 8", () => {
    expect(symphonyAvpuToGcsTotal('P')).toBe(8)
  })
  it("'U' → 3", () => {
    expect(symphonyAvpuToGcsTotal('U')).toBe(3)
  })
})

describe('symphonyAvpuToEstimatedGcs', () => {
  it("'A' → { e:4, v:5, m:6 }", () => {
    expect(symphonyAvpuToEstimatedGcs('A')).toEqual({ e: 4, v: 5, m: 6 })
  })
  it("'V' → { e:3, v:3, m:5 }", () => {
    expect(symphonyAvpuToEstimatedGcs('V')).toEqual({ e: 3, v: 3, m: 5 })
  })
  it("'P' → { e:2, v:2, m:4 }", () => {
    expect(symphonyAvpuToEstimatedGcs('P')).toEqual({ e: 2, v: 2, m: 4 })
  })
  it("'U' → { e:1, v:1, m:1 }", () => {
    expect(symphonyAvpuToEstimatedGcs('U')).toEqual({ e: 1, v: 1, m: 1 })
  })
  it('round-trip: symphonyGcsToAvpu(symphonyAvpuToEstimatedGcs(x)) === x for all AVPU levels', () => {
    for (const avpu of ['A', 'V', 'P', 'U'] as const) {
      expect(symphonyGcsToAvpu(symphonyAvpuToEstimatedGcs(avpu))).toBe(avpu)
    }
  })
})

describe('symphonyGcsToAvpu', () => {
  it('GCS 15 → A', () => {
    expect(symphonyGcsToAvpu({ e: 4, v: 5, m: 6 })).toBe('A')
  })
  it('GCS 14 with v ≤ 4 → V (impaired verbalization threshold)', () => {
    expect(symphonyGcsToAvpu({ e: 4, v: 4, m: 6 })).toBe('V')
  })
  it('GCS 14 with v > 4 → A (preserved verbalization)', () => {
    expect(symphonyGcsToAvpu({ e: 3, v: 5, m: 6 })).toBe('A')
  })
  it('GCS 9 → V', () => {
    expect(symphonyGcsToAvpu({ e: 3, v: 3, m: 3 })).toBe('V')
  })
  it('GCS 4 → P (lower boundary of Pain response range)', () => {
    expect(symphonyGcsToAvpu({ e: 2, v: 1, m: 1 })).toBe('P')
  })
  it('GCS 3 → U (minimum possible GCS)', () => {
    expect(symphonyGcsToAvpu({ e: 1, v: 1, m: 1 })).toBe('U')
  })
})
