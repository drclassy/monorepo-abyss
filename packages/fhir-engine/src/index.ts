// @the-abyss/fhir-engine — bounded FHIR validation and normalization candidate (modernization in progress)
//
// Role: structural validator + normalization seam, R5-target.
// NOT a clinical reasoning engine. NOT a terminology server.
// AADI V2 interop mapping authority remains in @the-abyss/symphony.
//
// See README.md for the full support matrix and modernization roadmap.

/** Bounded structural validator for the supported FHIR resource matrix (Patient, Observation). */
export { FhirValidator, validatePatient, validateObservation } from './validator'

/**
 * Modernization placeholder — methods are deliberately bounded passthrough.
 * Do not treat `toInternal()` / `toFhir()` / `normalize()` as real conversions.
 * Honesty pass will replace these with explicit semantics in a follow-up task.
 */
export { FhirTransformer } from './transformer'

/** Bounded FHIR type contracts — current schemas are an R4-shape transition slice on the way to R5. */
export type {
  DeferredResourceType,
  FhirObservation,
  FhirPatient,
  FhirResource,
  SupportedResourceType,
  ValidationResult,
} from './types'

/** Declared resource support matrix. Adding to either list requires a docs + test update. */
export { DEFERRED_RESOURCE_TYPES, SUPPORTED_RESOURCE_TYPES } from './types'
