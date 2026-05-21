// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * Pin the FHIR version-strategy posture so that bumping target version,
 * current shape, or phase is a deliberate review-gated change.
 *
 * Spec: docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md
 * Plan Task 5: docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import {
  FHIR_CURRENT_SHAPE,
  FHIR_TARGET_VERSION,
  FHIR_VERSION_STRATEGY,
  VERSION_STRATEGY_PHASE,
} from '../index'

describe('FHIR version strategy', () => {
  it('targets R5', () => {
    expect(FHIR_TARGET_VERSION).toBe('R5')
  })

  it('declares current shape as R4 transition slice (not "R4 supported")', () => {
    expect(FHIR_CURRENT_SHAPE).toBe('R4-transition-slice')
  })

  it('phase is bounded-transition during the modernization baseline', () => {
    expect(VERSION_STRATEGY_PHASE).toBe('bounded-transition')
  })

  it('aggregated FHIR_VERSION_STRATEGY is consistent with the individual constants', () => {
    expect(FHIR_VERSION_STRATEGY).toEqual({
      target: 'R5',
      currentShape: 'R4-transition-slice',
      phase: 'bounded-transition',
    })
  })
})
