// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * Post-promotion baseline for the deferred resource lane.
 *
 * After resource-validation expansion Tasks 2–4, all three previously
 * deferred families (Condition, RiskAssessment, DiagnosticReport) are
 * supported and validated structurally. This file now guards against silent
 * regression — adding a new deferred resource must update both
 * DEFERRED_RESOURCE_TYPES and these assertions.
 *
 * Plan: docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md
 */
import { describe, expect, it } from 'vitest'

import { DEFERRED_RESOURCE_TYPES } from '../index'

describe('deferred resource baseline (post-promotion)', () => {
  it('DEFERRED_RESOURCE_TYPES is empty — Condition, RiskAssessment, and DiagnosticReport are all supported', () => {
    expect([...DEFERRED_RESOURCE_TYPES]).toEqual([])
  })
})
