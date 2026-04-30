// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { z } from 'zod'

import {
  DEFERRED_RESOURCE_TYPES,
  FhirConditionSchema,
  FhirDiagnosticReportSchema,
  FhirObservationSchema,
  FhirPatientSchema,
  FhirRiskAssessmentSchema,
  SUPPORTED_RESOURCE_TYPES,
  type DeferredResourceType,
  type FhirCondition,
  type FhirDiagnosticReport,
  type FhirObservation,
  type FhirPatient,
  type FhirRiskAssessment,
  type ValidationResult,
} from './types'

function isDeferred(resourceType: string): resourceType is DeferredResourceType {
  return (DEFERRED_RESOURCE_TYPES as readonly string[]).includes(resourceType)
}

export class FhirValidator {
  validate<
    T extends
      | FhirPatient
      | FhirObservation
      | FhirCondition
      | FhirRiskAssessment
      | FhirDiagnosticReport,
  >(resource: T): ValidationResult {
    const resourceType = resource.resourceType

    try {
      if (resourceType === 'Patient') {
        FhirPatientSchema.parse(resource)
      } else if (resourceType === 'Observation') {
        FhirObservationSchema.parse(resource)
      } else if (resourceType === 'Condition') {
        FhirConditionSchema.parse(resource)
      } else if (resourceType === 'RiskAssessment') {
        FhirRiskAssessmentSchema.parse(resource)
      } else if (resourceType === 'DiagnosticReport') {
        FhirDiagnosticReportSchema.parse(resource)
      } else if (isDeferred(resourceType)) {
        return {
          valid: false,
          errors: [
            `Unsupported resource type: ${resourceType}. Declared deferred for the ` +
              `current fhir-engine modernization baseline; supported types are ` +
              `[${SUPPORTED_RESOURCE_TYPES.join(', ')}]. AADI V2 interop construction ` +
              `for ${resourceType} lives in @sentra/nada.`,
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

export function validateCondition(condition: FhirCondition): ValidationResult {
  return new FhirValidator().validate(condition)
}

export function validateRiskAssessment(assessment: FhirRiskAssessment): ValidationResult {
  return new FhirValidator().validate(assessment)
}

export function validateDiagnosticReport(report: FhirDiagnosticReport): ValidationResult {
  return new FhirValidator().validate(report)
}
