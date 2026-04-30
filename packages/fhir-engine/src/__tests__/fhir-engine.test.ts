// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, it, expect } from 'vitest'

import type { FhirPatient, FhirObservation } from '../types'
import { FhirValidator, validatePatient, validateObservation } from '../validator'

describe('FhirValidator', () => {
  const validator = new FhirValidator()

  describe('validate Patient resource', () => {
    it('should validate a valid Patient resource', () => {
      const patient: FhirPatient = {
        resourceType: 'Patient',
        id: 'patient-001',
        name: [{ family: 'Doe', given: ['John'] }],
        gender: 'male',
        birthDate: '1990-01-01',
      }

      const result = validator.validate(patient)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('Patient')
    })

    it('should return error for invalid Patient resource', () => {
      const invalidPatient = {
        resourceType: 'Patient',
        gender: 'invalid-gender', // Invalid enum value
      } as unknown as FhirPatient

      const result = validator.validate(invalidPatient)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.resourceType).toBe('Patient')
    })

    it('should validate minimal Patient resource', () => {
      const minimalPatient: FhirPatient = {
        resourceType: 'Patient',
      }

      const result = validator.validate(minimalPatient)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validate Observation resource', () => {
    it('should validate a valid Observation resource', () => {
      const observation: FhirObservation = {
        resourceType: 'Observation',
        id: 'obs-001',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Body height',
            },
          ],
          text: 'Height',
        },
        subject: { reference: 'Patient/patient-001' },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        valueQuantity: {
          value: 175,
          unit: 'cm',
          system: 'http://unitsofmeasure.org',
          code: 'cm',
        },
      }

      const result = validator.validate(observation)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.resourceType).toBe('Observation')
    })

    it('should return error for missing required fields in Observation', () => {
      const invalidObservation = {
        resourceType: 'Observation',
        // Missing required 'status' and 'code'
      } as FhirObservation

      const result = validator.validate(invalidObservation)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate Observation with string value', () => {
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '33717-0',
              display: 'General notes',
            },
          ],
        },
        valueString: 'Patient reports feeling better',
      }

      const result = validator.validate(observation)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validate unsupported resource type', () => {
    it('should return error for unsupported resource type', () => {
      const unsupportedResource = {
        resourceType: 'Medication',
        id: 'med-001',
      } as unknown as FhirPatient

      const result = validator.validate(unsupportedResource)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Unsupported resource type')
      expect(result.resourceType).toBe('Medication')
    })
  })
})

describe('validatePatient helper', () => {
  it('should validate patient using helper function', () => {
    const patient: FhirPatient = {
      resourceType: 'Patient',
      name: [{ family: 'Smith', given: ['Jane'] }],
      gender: 'female',
    }

    const result = validatePatient(patient)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('validateObservation helper', () => {
  it('should validate observation using helper function', () => {
    const observation: FhirObservation = {
      resourceType: 'Observation',
      status: 'preliminary',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate',
          },
        ],
      },
    }

    const result = validateObservation(observation)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

// FhirTransformer tests moved to transformer.test.ts after the Task 3 honesty
// pass. The methods now throw explicit "not implemented" errors instead of
// returning cast-only no-ops.
