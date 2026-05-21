// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import { normalizeSymphonyConsciousnessToAvpu } from '../engine/classifiers'

describe('normalizeSymphonyConsciousnessToAvpu', () => {
  it("maps 'alert' → 'A'", () => {
    expect(normalizeSymphonyConsciousnessToAvpu('alert')).toBe('A')
  })

  it("maps 'voice' → 'V'", () => {
    expect(normalizeSymphonyConsciousnessToAvpu('voice')).toBe('V')
  })

  it("maps 'pain' → 'P'", () => {
    expect(normalizeSymphonyConsciousnessToAvpu('pain')).toBe('P')
  })

  it("maps 'unresponsive' → 'U'", () => {
    expect(normalizeSymphonyConsciousnessToAvpu('unresponsive')).toBe('U')
  })

  it("maps 'unknown' → undefined (no silent coercion to 'U' or 'A')", () => {
    expect(normalizeSymphonyConsciousnessToAvpu('unknown')).toBeUndefined()
  })

  it('maps undefined → undefined (no coercion)', () => {
    expect(normalizeSymphonyConsciousnessToAvpu(undefined)).toBeUndefined()
  })

  it('is deterministic — same input returns same output on repeated calls', () => {
    expect(normalizeSymphonyConsciousnessToAvpu('pain')).toBe(normalizeSymphonyConsciousnessToAvpu('pain'))
    expect(normalizeSymphonyConsciousnessToAvpu('unknown')).toBe(normalizeSymphonyConsciousnessToAvpu('unknown'))
  })

  it('covers all four AVPU levels without overlap or gap', () => {
    expect(normalizeSymphonyConsciousnessToAvpu('alert')).toBe('A')
    expect(normalizeSymphonyConsciousnessToAvpu('voice')).toBe('V')
    expect(normalizeSymphonyConsciousnessToAvpu('pain')).toBe('P')
    expect(normalizeSymphonyConsciousnessToAvpu('unresponsive')).toBe('U')
    expect(normalizeSymphonyConsciousnessToAvpu('unknown')).toBeUndefined()
    expect(normalizeSymphonyConsciousnessToAvpu(undefined)).toBeUndefined()
  })
})
