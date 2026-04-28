/**
 * Modernization baseline — locks current package behavior before honesty pass.
 *
 * Purpose: pin what `packages/fhir-engine` actually does today vs what its
 * documentation claims. These tests will be re-asserted (or rewritten with
 * stronger expectations) by Tasks 3–6 of the modernization plan.
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan: docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import {
  FhirTransformer,
  FhirValidator,
  type FhirObservation,
  type FhirPatient,
} from '../index'

describe('fhir-engine modernization baseline', () => {
  describe('validator support matrix (locked surface)', () => {
    it('Patient passes validation when shape is correct', () => {
      const validator = new FhirValidator()
      const patient: FhirPatient = {
        resourceType: 'Patient',
        id: 'pat-baseline-1',
      }
      const result = validator.validate(patient)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('Patient')
    })

    it('Observation passes validation when shape is correct', () => {
      const validator = new FhirValidator()
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
        },
      }
      const result = validator.validate(observation)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    // Condition was promoted from deferred to supported in the
    // resource-validation expansion plan (Task 2). Positive validator coverage
    // now lives in validator.test.ts; deferred-state coverage was removed
    // from the deferred-resource-baseline test file at the same time.

    it('RiskAssessment is rejected with explicit "Unsupported resource type" error', () => {
      const validator = new FhirValidator()
      const result = validator.validate({
        resourceType: 'RiskAssessment',
        id: 'risk-baseline-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type')
      expect(result.resourceType).toBe('RiskAssessment')
    })

    it('DiagnosticReport is rejected with explicit "Unsupported resource type" error', () => {
      const validator = new FhirValidator()
      const result = validator.validate({
        resourceType: 'DiagnosticReport',
        id: 'dr-baseline-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type')
      expect(result.resourceType).toBe('DiagnosticReport')
    })
  })

  describe('transformer surface (honesty-pass locked behavior)', () => {
    it('normalize() throws — version normalization is not implemented', () => {
      const transformer = new FhirTransformer()
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        code: { coding: [{ system: 'urn:test', code: 'abc', display: 'abc' }] },
      }
      expect(() => transformer.normalize(observation)).toThrow(/not implemented/i)
    })

    it('toInternal() throws — FHIR-to-internal mapping is not part of this package', () => {
      const transformer = new FhirTransformer()
      const patient: FhirPatient = { resourceType: 'Patient', id: 'pat-baseline-2' }
      expect(() => transformer.toInternal<FhirPatient>(patient)).toThrow(/not implemented/i)
    })

    it('toFhir() throws — internal-to-FHIR construction belongs to @the-abyss/symphony', () => {
      const transformer = new FhirTransformer()
      const data = { resourceType: 'Patient', id: 'pat-baseline-3' }
      expect(() => transformer.toFhir<FhirPatient>(data)).toThrow(/not implemented/i)
    })
  })
})
