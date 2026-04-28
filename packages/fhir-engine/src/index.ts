// @the-abyss/fhir-engine — bounded FHIR validation and normalization candidate (modernization in progress)
//
// Role: structural validator + normalization seam, R5-target.
// NOT a clinical reasoning engine. NOT a terminology server.
// AADI V2 interop mapping authority remains in @the-abyss/symphony.
//
// See README.md for the full support matrix and modernization roadmap.

/** Bounded structural validator for the supported FHIR resource matrix (Patient, Observation, Condition). */
export {
  FhirValidator,
  validateCondition,
  validateObservation,
  validatePatient,
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
  FhirObservation,
  FhirPatient,
  FhirResource,
  SupportedResourceType,
  ValidationResult,
} from './types'

/** Declared resource support matrix. Adding to either list requires a docs + test update. */
export { DEFERRED_RESOURCE_TYPES, SUPPORTED_RESOURCE_TYPES } from './types'

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
