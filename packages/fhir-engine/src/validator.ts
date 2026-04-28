import { z } from 'zod'

import {
  DEFERRED_RESOURCE_TYPES,
  FhirObservationSchema,
  FhirPatientSchema,
  SUPPORTED_RESOURCE_TYPES,
  type DeferredResourceType,
  type FhirObservation,
  type FhirPatient,
  type ValidationResult,
} from './types'

function isDeferred(resourceType: string): resourceType is DeferredResourceType {
  return (DEFERRED_RESOURCE_TYPES as readonly string[]).includes(resourceType)
}

export class FhirValidator {
  validate<T extends FhirPatient | FhirObservation>(resource: T): ValidationResult {
    const resourceType = resource.resourceType

    try {
      if (resourceType === 'Patient') {
        FhirPatientSchema.parse(resource)
      } else if (resourceType === 'Observation') {
        FhirObservationSchema.parse(resource)
      } else if (isDeferred(resourceType)) {
        return {
          valid: false,
          errors: [
            `Unsupported resource type: ${resourceType}. Declared deferred for the ` +
              `current fhir-engine modernization baseline; supported types are ` +
              `[${SUPPORTED_RESOURCE_TYPES.join(', ')}]. AADI V2 interop construction ` +
              `for ${resourceType} lives in @the-abyss/symphony.`,
          ],
          warnings: [],
          resourceType,
        }
      } else {
        return {
          valid: false,
          errors: [
            `Unsupported resource type: ${resourceType}. Supported types are ` +
              `[${SUPPORTED_RESOURCE_TYPES.join(', ')}].`,
          ],
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
