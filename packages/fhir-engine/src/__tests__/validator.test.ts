/**
 * Canonical resource support matrix tests for `FhirValidator`.
 *
 * These tests pin the declared support matrix in code (not just docs):
 *
 *   Supported : Patient, Observation, Condition, RiskAssessment, DiagnosticReport
 *   Deferred  : (none — all three deferred families promoted in Tasks 2–4)
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
  validateDiagnosticReport,
  validateRiskAssessment,
  type FhirCondition,
  type FhirDiagnosticReport,
  type FhirObservation,
  type FhirPatient,
  type FhirRiskAssessment,
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

    it('RiskAssessment passes with the bounded required slots (status, subject)', () => {
      const assessment: FhirRiskAssessment = {
        resourceType: 'RiskAssessment',
        id: 'risk-supported-1',
        status: 'final',
        subject: { reference: 'Patient/pat-1' },
      }
      const result = new FhirValidator().validate(assessment)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('RiskAssessment')
    })

    it('RiskAssessment passes with optional prediction[] populated', () => {
      const assessment: FhirRiskAssessment = {
        resourceType: 'RiskAssessment',
        status: 'final',
        subject: { reference: 'Patient/p-1' },
        occurrenceDateTime: '2026-04-29T00:00:00.000Z',
        prediction: [
          {
            outcome: { coding: [{ system: 'sys', code: 'sepsis' }] },
            probabilityDecimal: 0.42,
            qualitativeRisk: { coding: [{ system: 'sys', code: 'high' }] },
            rationale: 'NEWS2 trajectory rising',
          },
        ],
      }
      const result = new FhirValidator().validate(assessment)
      expect(result.valid).toBe(true)
    })

    it('RiskAssessment fails when status is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'RiskAssessment',
        subject: { reference: 'Patient/p-1' },
      } as unknown as FhirRiskAssessment)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/status/i)
    })

    it('RiskAssessment fails when subject.reference is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'RiskAssessment',
        status: 'final',
      } as unknown as FhirRiskAssessment)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/subject/i)
    })

    it('RiskAssessment fails when status is not in the FHIR R5 enum', () => {
      const result = new FhirValidator().validate({
        resourceType: 'RiskAssessment',
        status: 'definitely-not-a-status',
        subject: { reference: 'Patient/p-1' },
      } as unknown as FhirRiskAssessment)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/status/i)
    })

    it('RiskAssessment fails when prediction[] entries are malformed (non-object)', () => {
      const result = new FhirValidator().validate({
        resourceType: 'RiskAssessment',
        status: 'final',
        subject: { reference: 'Patient/p-1' },
        prediction: ['not-an-object'],
      } as unknown as FhirRiskAssessment)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/prediction/i)
    })

    it('validateRiskAssessment() helper produces the same result as FhirValidator', () => {
      const assessment: FhirRiskAssessment = {
        resourceType: 'RiskAssessment',
        status: 'final',
        subject: { reference: 'Patient/p-1' },
      }
      expect(validateRiskAssessment(assessment).valid).toBe(true)
    })

    it('DiagnosticReport passes with the bounded required slots (status, code)', () => {
      const report: FhirDiagnosticReport = {
        resourceType: 'DiagnosticReport',
        id: 'dr-supported-1',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '24323-8', display: 'Comprehensive metabolic 2000 panel' }],
        },
      }
      const result = new FhirValidator().validate(report)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('DiagnosticReport')
    })

    it('DiagnosticReport passes with optional subject, result[], conclusion populated', () => {
      const report: FhirDiagnosticReport = {
        resourceType: 'DiagnosticReport',
        status: 'final',
        code: { coding: [{ system: 'sys', code: 'X' }] },
        subject: { reference: 'Patient/p-1' },
        effectiveDateTime: '2026-04-29T00:00:00.000Z',
        result: [
          { reference: 'Observation/obs-1' },
          { reference: 'Observation/obs-2' },
        ],
        conclusion: 'Within reference range.',
      }
      const result = new FhirValidator().validate(report)
      expect(result.valid).toBe(true)
    })

    it('DiagnosticReport fails when status is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'DiagnosticReport',
        code: { coding: [{ system: 'sys', code: 'X' }] },
      } as unknown as FhirDiagnosticReport)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/status/i)
    })

    it('DiagnosticReport fails when code is missing', () => {
      const result = new FhirValidator().validate({
        resourceType: 'DiagnosticReport',
        status: 'final',
      } as unknown as FhirDiagnosticReport)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/code/i)
    })

    it('DiagnosticReport fails when status is not in the FHIR R5 enum', () => {
      const result = new FhirValidator().validate({
        resourceType: 'DiagnosticReport',
        status: 'definitely-not-a-status',
        code: { coding: [{ system: 'sys', code: 'X' }] },
      } as unknown as FhirDiagnosticReport)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/status/i)
    })

    it('DiagnosticReport fails when result[] entry is malformed (missing reference)', () => {
      const result = new FhirValidator().validate({
        resourceType: 'DiagnosticReport',
        status: 'final',
        code: { coding: [{ system: 'sys', code: 'X' }] },
        result: [{}],
      } as unknown as FhirDiagnosticReport)
      expect(result.valid).toBe(false)
      expect(result.errors.join(' ')).toMatch(/result|reference/i)
    })

    it('validateDiagnosticReport() helper produces the same result as FhirValidator', () => {
      const report: FhirDiagnosticReport = {
        resourceType: 'DiagnosticReport',
        status: 'final',
        code: { coding: [{ system: 'sys', code: 'X' }] },
      }
      expect(validateDiagnosticReport(report).valid).toBe(true)
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
    it('SUPPORTED_RESOURCE_TYPES contains all 5 promoted resources', () => {
      expect([...SUPPORTED_RESOURCE_TYPES]).toEqual([
        'Patient',
        'Observation',
        'Condition',
        'RiskAssessment',
        'DiagnosticReport',
      ])
    })

    it('DEFERRED_RESOURCE_TYPES is empty after Tasks 2–4 promotions', () => {
      expect([...DEFERRED_RESOURCE_TYPES]).toEqual([])
    })

    it('supported and deferred sets do not overlap', () => {
      const overlap = SUPPORTED_RESOURCE_TYPES.filter((t) =>
        (DEFERRED_RESOURCE_TYPES as readonly string[]).includes(t),
      )
      expect(overlap).toHaveLength(0)
    })
  })
})
