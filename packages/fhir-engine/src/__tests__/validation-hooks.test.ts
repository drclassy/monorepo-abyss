/**
 * Tests for the thin validation hook seam.
 *
 * Pin behavior so future promotion (moving structural validation out of
 * symphony interop) cannot accidentally widen this surface into reasoning.
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan Task 6: docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md
 */
import { describe, expect, it } from 'vitest'

import {
  canValidateResourceType,
  validateSupportedResource,
  type FhirObservation,
  type FhirPatient,
} from '../index'

describe('canValidateResourceType', () => {
  it('returns true for declared supported types', () => {
    expect(canValidateResourceType('Patient')).toBe(true)
    expect(canValidateResourceType('Observation')).toBe(true)
    expect(canValidateResourceType('Condition')).toBe(true)
    expect(canValidateResourceType('RiskAssessment')).toBe(true)
  })

  it('returns false for declared deferred types', () => {
    expect(canValidateResourceType('DiagnosticReport')).toBe(false)
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

  it('rejects still-deferred resources honestly via the validator', () => {
    const result = validateSupportedResource({
      resourceType: 'DiagnosticReport',
      id: 'dr-hooks-1',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type: DiagnosticReport')
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
