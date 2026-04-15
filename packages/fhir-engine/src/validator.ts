import { z } from 'zod'

import type { FhirPatient, FhirObservation, ValidationResult } from './types'
import { FhirPatientSchema, FhirObservationSchema } from './types'

export class FhirValidator {
  validate<T extends FhirPatient | FhirObservation>(resource: T): ValidationResult {
    const resourceType = resource.resourceType

    try {
      if (resourceType === 'Patient') {
        FhirPatientSchema.parse(resource)
      } else if (resourceType === 'Observation') {
        FhirObservationSchema.parse(resource)
      } else {
        return {
          valid: false,
          errors: [`Unsupported resource type: ${resourceType}`],
          warnings: [],
          resourceType,
        }
      }

      return {
        valid: true,
        errors: [],
        warnings: [],
        resourceType,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
          warnings: [],
          resourceType,
        }
      }
      throw error
    }
  }
}

export function validatePatient(patient: FhirPatient): ValidationResult {
  return new FhirValidator().validate(patient)
}

export function validateObservation(observation: FhirObservation): ValidationResult {
  return new FhirValidator().validate(observation)
}
