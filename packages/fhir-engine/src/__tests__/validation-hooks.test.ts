/**
 * Tests for the thin validation hook seam.
 *
 * Pin behavior so future promotion (moving structural validation out of
 * symphony interop) cannot accidentally widen this surface into reasoning.
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan: docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md (Task 5)
 */
import { describe, expect, it } from 'vitest'

import {
  canValidateResourceType,
  validateSupportedResource,
  type FhirCondition,
  type FhirDiagnosticReport,
  type FhirObservation,
  type FhirPatient,
  type FhirRiskAssessment,
} from '../index'

describe('canValidateResourceType', () => {
  it('returns true for declared supported types', () => {
    expect(canValidateResourceType('Patient')).toBe(true)
    expect(canValidateResourceType('Observation')).toBe(true)
    expect(canValidateResourceType('Condition')).toBe(true)
    expect(canValidateResourceType('RiskAssessment')).toBe(true)
    expect(canValidateResourceType('DiagnosticReport')).toBe(true)
  })

  it('returns false for unknown / arbitrary resource types', () => {
    expect(canValidateResourceType('Medication')).toBe(false)
    expect(canValidateResourceType('Encounter')).toBe(false)
    expect(canValidateResourceType('')).toBe(false)
    expect(canValidateResourceType('not-a-resource')).toBe(false)
  })
})

describe('validateSupportedResource', () => {
  it('passes a valid Patient through to the bounded validator', () => {
    const patient: FhirPatient = {
      resourceType: 'Patient',
      id: 'pat-hooks-1',
    }
    const result = validateSupportedResource(patient)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.resourceType).toBe('Patient')
  })

  it('passes a valid Observation through to the bounded validator', () => {
    const observation: FhirObservation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
      },
    }
    const result = validateSupportedResource(observation)
    expect(result.valid).toBe(true)
  })

  it('passes a valid Condition through to the bounded validator', () => {
    const condition: FhirCondition = {
      resourceType: 'Condition',
      clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
      code: { coding: [{ system: 'sys', code: 'X' }] },
      subject: { reference: 'Patient/p-1' },
    }
    const result = validateSupportedResource(condition)
    expect(result.valid).toBe(true)
    expect(result.resourceType).toBe('Condition')
  })

  it('passes a valid RiskAssessment through to the bounded validator', () => {
    const assessment: FhirRiskAssessment = {
      resourceType: 'RiskAssessment',
      status: 'final',
      subject: { reference: 'Patient/p-1' },
    }
    const result = validateSupportedResource(assessment)
    expect(result.valid).toBe(true)
    expect(result.resourceType).toBe('RiskAssessment')
  })

  it('passes a valid DiagnosticReport through to the bounded validator', () => {
    const report: FhirDiagnosticReport = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: { coding: [{ system: 'sys', code: 'X' }] },
    }
    const result = validateSupportedResource(report)
    expect(result.valid).toBe(true)
    expect(result.resourceType).toBe('DiagnosticReport')
  })

  it('still surfaces structural failures honestly for supported types (e.g. Condition missing subject)', () => {
    const result = validateSupportedResource({
      resourceType: 'Condition',
      clinicalStatus: { coding: [{ system: 'sys', code: 'active' }] },
      code: { coding: [{ system: 'sys', code: 'X' }] },
    })
    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toMatch(/subject/i)
  })

  it('rejects unknown resources honestly via the validator (no deferred types remain)', () => {
    const result = validateSupportedResource({
      resourceType: 'Medication',
      id: 'med-hooks-1',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type: Medication')
  })

  it('does not reinterpret severity, disposition, or clinical meaning', () => {
    const patient: FhirPatient = {
      resourceType: 'Patient',
      id: 'pat-hooks-2',
    }
    const result = validateSupportedResource(patient)
    // Result shape stays bounded: only valid/errors/warnings/resourceType.
    expect(Object.keys(result).sort()).toEqual([
      'errors',
      'resourceType',
      'valid',
      'warnings',
    ])
  })
})
