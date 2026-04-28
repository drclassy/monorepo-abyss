/**
 * Canonical resource support matrix tests for `FhirValidator`.
 *
 * These tests pin the declared support matrix in code (not just docs):
 *
 *   Supported : Patient, Observation
 *   Deferred  : Condition, RiskAssessment, DiagnosticReport
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan Task 4: docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import {
  DEFERRED_RESOURCE_TYPES,
  FhirValidator,
  SUPPORTED_RESOURCE_TYPES,
  type FhirObservation,
  type FhirPatient,
} from '../index'

describe('FhirValidator support matrix', () => {
  describe('supported resources pass valid examples', () => {
    it('Patient passes', () => {
      const patient: FhirPatient = {
        resourceType: 'Patient',
        id: 'pat-supported-1',
        name: [{ family: 'Doe', given: ['Jane'] }],
        gender: 'female',
      }
      const result = new FhirValidator().validate(patient)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('Patient')
    })

    it('Observation passes', () => {
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
        },
      }
      const result = new FhirValidator().validate(observation)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('deferred resources fail honestly with explicit error', () => {
    it('Condition is rejected and the error mentions @the-abyss/symphony as interop home', () => {
      const result = new FhirValidator().validate({
        resourceType: 'Condition',
        id: 'cond-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type: Condition')
      expect(result.errors[0]).toContain('@the-abyss/symphony')
      expect(result.resourceType).toBe('Condition')
    })

    it('RiskAssessment is rejected with explicit deferred messaging', () => {
      const result = new FhirValidator().validate({
        resourceType: 'RiskAssessment',
        id: 'risk-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type: RiskAssessment')
      expect(result.errors[0]).toContain('@the-abyss/symphony')
    })

    it('DiagnosticReport is rejected with explicit deferred messaging', () => {
      const result = new FhirValidator().validate({
        resourceType: 'DiagnosticReport',
        id: 'dr-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type: DiagnosticReport')
      expect(result.errors[0]).toContain('@the-abyss/symphony')
    })
  })

  describe('unknown resources fail with the supported-types list', () => {
    it('Medication (not in deferred list) is rejected and lists supported types', () => {
      const result = new FhirValidator().validate({
        resourceType: 'Medication',
        id: 'med-1',
      } as never)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type: Medication')
      expect(result.errors[0]).toContain('Patient')
      expect(result.errors[0]).toContain('Observation')
    })
  })

  describe('declared support matrix consts stay aligned', () => {
    it('SUPPORTED_RESOURCE_TYPES contains exactly Patient and Observation', () => {
      expect([...SUPPORTED_RESOURCE_TYPES]).toEqual(['Patient', 'Observation'])
    })

    it('DEFERRED_RESOURCE_TYPES contains exactly Condition, RiskAssessment, DiagnosticReport', () => {
      expect([...DEFERRED_RESOURCE_TYPES]).toEqual([
        'Condition',
        'RiskAssessment',
        'DiagnosticReport',
      ])
    })

    it('supported and deferred sets do not overlap', () => {
      const overlap = SUPPORTED_RESOURCE_TYPES.filter((t) =>
        (DEFERRED_RESOURCE_TYPES as readonly string[]).includes(t),
      )
      expect(overlap).toHaveLength(0)
    })
  })
})
