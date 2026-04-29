import {
  mapValidatedAadiV2Bundle,
  type AadiV2FhirBundle as SymphonyFhirBundle,
} from '../../../fhir-engine/src/index'
import type { SymphonyResult } from '../contracts'

import { projectSymphonyResultToFhirBundle } from './fhir-bundle-projection'

export type {
  AadiV2FhirBundle as SymphonyFhirBundle,
  AadiV2FhirCodeableConcept as SymphonyFhirCodeableConcept,
  AadiV2FhirCoding as SymphonyFhirCoding,
  AadiV2FhirCondition as SymphonyFhirCondition,
  AadiV2FhirDiagnosticReport as SymphonyFhirDiagnosticReport,
  AadiV2FhirObservation as SymphonyFhirObservation,
  AadiV2FhirBundleResource as SymphonyFhirResource,
  AadiV2FhirRiskAssessment as SymphonyFhirRiskAssessment,
} from '../../../fhir-engine/src/index'

export function mapSymphonyResultToFhirBundle(
  result: SymphonyResult,
): SymphonyFhirBundle {
  return mapValidatedAadiV2Bundle(projectSymphonyResultToFhirBundle(result))
}
