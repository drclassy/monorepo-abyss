// @the-abyss/fhir-engine - FHIR R4 Validation & Processing

/** FHIR R4 resource validator and field-level validation helpers. */
export { FhirValidator, validatePatient, validateObservation } from './validator'

/** Transforms raw FHIR payloads to/from internal domain models. */
export { FhirTransformer } from './transformer'

/** Core FHIR R4 type contracts — use these instead of raw Prisma-generated types. */
export type { FhirResource, FhirPatient, FhirObservation, ValidationResult } from './types'
