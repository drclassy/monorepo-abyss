// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * Validation hook seam for future promotion of structural validation
 * responsibilities out of `@the-abyss/symphony/src/interop/`.
 *
 * This module is deliberately thin. It only:
 *   - reports which resource types this package can validate today
 *   - dispatches an already-mapped FHIR resource to the bounded validator
 *
 * It deliberately does NOT:
 *   - build FHIR resources from `SymphonyResult` (lives in symphony)
 *   - expand terminology (no CodeSystem/ValueSet expansion)
 *   - reinterpret clinical meaning, severity, or disposition
 *   - re-score the patient
 *
 * Spec: docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
 * Plan: docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md (Task 5)
 */
import {
  SUPPORTED_RESOURCE_TYPES,
  type FhirCondition,
  type FhirDiagnosticReport,
  type FhirObservation,
  type FhirPatient,
  type FhirResource,
  type FhirRiskAssessment,
  type ValidationResult,
} from './types'
import { FhirValidator } from './validator'

/**
 * Predicate for callers that want to gate a resource on validator support
 * without throwing or invoking validation.
 *
 * Returns `true` only for resource types declared in `SUPPORTED_RESOURCE_TYPES`.
 */
export function canValidateResourceType(resourceType: string): boolean {
  return (SUPPORTED_RESOURCE_TYPES as readonly string[]).includes(resourceType)
}

/**
 * Validate a fully-formed FHIR resource using the package's bounded validator.
 *
 * Accepts the broader `FhirResource` union so that interop callers (which may
 * hold a generically-typed resource) can dispatch without casting at the call
 * site. The validator continues to fail honestly on unsupported types.
 */
export function validateSupportedResource(resource: FhirResource): ValidationResult {
  return new FhirValidator().validate(
    resource as
      | FhirPatient
      | FhirObservation
      | FhirCondition
      | FhirRiskAssessment
      | FhirDiagnosticReport
  )
}
