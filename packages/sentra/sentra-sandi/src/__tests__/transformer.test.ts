// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * FhirTransformer honesty pass tests.
 *
 * Pins the explicit modernization decision: every transformer method throws
 * with a clear message rather than pretending a cast-only no-op is a real
 * transformation. See:
 *
 * - Spec: docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md
 * - Plan Task 3: docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import { FhirTransformer, type FhirObservation, type FhirPatient } from '../index'

describe('FhirTransformer (honesty pass)', () => {
  it('toInternal() throws with an explicit not-implemented message', () => {
    const transformer = new FhirTransformer()
    const patient: FhirPatient = { resourceType: 'Patient', id: 'pat-1' }
    expect(() => transformer.toInternal(patient)).toThrow(/not implemented/i)
    expect(() => transformer.toInternal(patient)).toThrow(/FHIR-to-internal/i)
  })

  it('toFhir() throws with an explicit not-implemented message and points to @sentra/nada', () => {
    const transformer = new FhirTransformer()
    expect(() => transformer.toFhir({ resourceType: 'Patient' })).toThrow(/not implemented/i)
    expect(() => transformer.toFhir({ resourceType: 'Patient' })).toThrow(/@sentra\/nada/)
  })

  it('normalize() throws — multi-version normalization is out of scope', () => {
    const transformer = new FhirTransformer()
    const observation: FhirObservation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{ system: 'urn:test', code: 'abc', display: 'abc' }],
      },
    }
    expect(() => transformer.normalize(observation)).toThrow(/not implemented/i)
  })

  it('no method silently returns its input — every call surfaces the unimplemented status', () => {
    const transformer = new FhirTransformer()
    const patient: FhirPatient = { resourceType: 'Patient', id: 'pat-2' }
    expect(() => transformer.toInternal(patient)).toThrow()
    expect(() => transformer.toFhir(patient)).toThrow()
    expect(() => transformer.normalize(patient)).toThrow()
  })
})
