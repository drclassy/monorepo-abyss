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

    it('Condition is rejected with explicit "Unsupported resource type" error', () => {
      const validator = new FhirValidator()
      const result = validator.validate({
        resourceType: 'Condition',
        id: 'cond-baseline-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type')
      expect(result.resourceType).toBe('Condition')
    })

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

  describe('transformer current behavior (cast-only — to be made honest in Task 3)', () => {
    it('normalize() is currently a passthrough — no version normalization implemented', () => {
      const transformer = new FhirTransformer()
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{ system: 'urn:test', code: 'abc', display: 'abc' }],
        },
      }
      const normalized = transformer.normalize(observation)
      // Locks current behavior: returns input unchanged (TODO in transformer.ts:25).
      // Task 3 will replace this with an explicit honesty decision.
      expect(normalized).toEqual(observation)
    })

    it('toInternal() currently performs no transformation — it casts the input through', () => {
      const transformer = new FhirTransformer()
      const patient: FhirPatient = {
        resourceType: 'Patient',
        id: 'pat-baseline-2',
        name: [{ family: 'Doe', given: ['John'] }],
      }
      const internal = transformer.toInternal<FhirPatient>(patient)
      // Locks current behavior: cast-only (TODO in transformer.ts:9).
      // Task 3 will replace with explicit unsupported/throw or removal.
      expect(internal).toEqual(patient)
    })

    it('toFhir() currently performs no transformation — it casts the input through', () => {
      const transformer = new FhirTransformer()
      const data = {
        resourceType: 'Patient',
        id: 'pat-baseline-3',
      }
      const fhir = transformer.toFhir<FhirPatient>(data)
      // Locks current behavior: cast-only (TODO in transformer.ts:17).
      // Task 3 will replace with explicit unsupported/throw or removal.
      expect(fhir.resourceType).toBe('Patient')
      expect(fhir.id).toBe('pat-baseline-3')
    })
  })
})
