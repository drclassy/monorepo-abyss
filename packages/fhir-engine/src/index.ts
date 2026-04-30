// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
// @the-abyss/fhir-engine — bounded FHIR validation and normalization candidate (modernization in progress)
//
// Role: structural validator + normalization seam, R5-target.
// NOT a clinical reasoning engine. NOT a terminology server.
// AADI V2 interop mapping authority remains in @the-abyss/symphony.
//
// See README.md for the full support matrix and modernization roadmap.

/** Bounded structural validator for the supported FHIR resource matrix (Patient, Observation, Condition, RiskAssessment, DiagnosticReport). */
export {
  FhirValidator,
  validateCondition,
  validateDiagnosticReport,
  validateObservation,
  validatePatient,
  validateRiskAssessment,
} from './validator'

/**
 * Modernization placeholder — methods are deliberately bounded passthrough.
 * Do not treat `toInternal()` / `toFhir()` / `normalize()` as real conversions.
 * Honesty pass will replace these with explicit semantics in a follow-up task.
 */
export { FhirTransformer } from './transformer'

/** Bounded FHIR type contracts — current schemas are an R4-shape transition slice on the way to R5. */
export type {
  DeferredResourceType,
  FhirCondition,
  FhirDiagnosticReport,
  FhirObservation,
  FhirPatient,
  FhirResource,
  FhirRiskAssessment,
  SupportedResourceType,
  ValidationResult,
} from './types'

/** Declared resource support matrix. Adding to either list requires a docs + test update. */
export { DEFERRED_RESOURCE_TYPES, SUPPORTED_RESOURCE_TYPES } from './types'

/** AADI V2 FHIR bundle assembly from already-projected inputs. No SymphonyResult mapping lives here. */
export {
  mapValidatedAadiV2Bundle,
  type AadiV2FhirBundle,
  type AadiV2FhirBundleProjection,
  type AadiV2FhirBundleResource,
  type AadiV2FhirCodeableConcept,
  type AadiV2FhirCoding,
  type AadiV2FhirCondition,
  type AadiV2FhirDiagnosticReport,
  type AadiV2FhirObservation,
  type AadiV2FhirRiskAssessment,
} from './aadi-v2-fhir-bundle'

/** Honest FHIR version posture (R5-target modernization, current shape is R4 transition slice). */
export {
  FHIR_CURRENT_SHAPE,
  FHIR_TARGET_VERSION,
  FHIR_VERSION_STRATEGY,
  VERSION_STRATEGY_PHASE,
  type FhirVersionStrategy,
  type VersionStrategyPhase,
} from './version-strategy'

/**
 * Validation hook seam for future promotion. Thin dispatcher only — does NOT
 * build resources, expand terminology, or reinterpret clinical meaning.
 */
export { canValidateResourceType, validateSupportedResource } from './validation-hooks'
