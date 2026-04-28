/**
 * Canonical resource support matrix tests for `FhirValidator`.
 *
 * These tests pin the declared support matrix in code (not just docs):
 *
 *   Supported : Patient, Observation, Condition
 *   Deferred  : RiskAssessment, DiagnosticReport
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan Task 4: docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import {
  DEFERRED_RESOURCE_TYPES,
  FhirValidator,
  SUPPORTED_RESOURCE_TYPES,
  validateCondition,
  type FhirCondition,
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

    it('Condition passes with the bounded required slots (clinicalStatus, code, subject)', () => {
      const condition: FhirCondition = {
        resourceType: 'Condition',
        id: 'cond-supported-1',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
            },
          ],
        },
        code: {
          coding: [
            { system: 'http://hl7.org/fhir/sid/icd-10', code: 'J18.9', display: 'Pneumonia' },
          ],
        },
        subject: { reference: 'Patient/pat-1' },
      }
      const result = new FhirValidator().validate(condition)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('Condition')
    })

    it('Condition passes with optional verificationStatus, category, encounter populated', () => {
      const condition: FhirCondition = {
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
        verificationStatus: { coding: [{ system: 'sys', code: 'confirmed' }] },
        category: [{ coding: [{ system: 'sys', code: 'problem-list-item' }] }],
        code: { coding: [{ system: 'sys', code: 'X' }] },
        subject: { reference: 'Patient/p-1' },
        encounter: { reference: 'Encounter/e-1' },
      }
      const result = new FhirValidator().validate(condition)
      expect(result.valid).toBe(true)
    })

    it('Condition fails when subject.reference is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
        code: { coding: [{ system: 'sys', code: 'X' }] },
      } as unknown as FhirCondition)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/subject/i)
    })

    it('Condition fails when clinicalStatus is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'Condition',
        code: { coding: [{ system: 'sys', code: 'X' }] },
        subject: { reference: 'Patient/p-1' },
      } as unknown as FhirCondition)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/clinicalStatus/i)
    })

    it('Condition fails when code is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
        subject: { reference: 'Patient/p-1' },
      } as unknown as FhirCondition)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/code/i)
    })

    it('validateCondition() helper produces the same result as FhirValidator', () => {
      const condition: FhirCondition = {
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
        code: { coding: [{ system: 'sys', code: 'X' }] },
        subject: { reference: 'Patient/p-1' },
      }
      expect(validateCondition(condition).valid).toBe(true)
    })
  })

  describe('deferred resources fail honestly with explicit error', () => {
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
    it('SUPPORTED_RESOURCE_TYPES contains exactly Patient, Observation, and Condition', () => {
      expect([...SUPPORTED_RESOURCE_TYPES]).toEqual(['Patient', 'Observation', 'Condition'])
    })

    it('DEFERRED_RESOURCE_TYPES contains exactly RiskAssessment and DiagnosticReport', () => {
      expect([...DEFERRED_RESOURCE_TYPES]).toEqual(['RiskAssessment', 'DiagnosticReport'])
    })

    it('supported and deferred sets do not overlap', () => {
      const overlap = SUPPORTED_RESOURCE_TYPES.filter((t) =>
        (DEFERRED_RESOURCE_TYPES as readonly string[]).includes(t),
      )
      expect(overlap).toHaveLength(0)
    })
  })
})
