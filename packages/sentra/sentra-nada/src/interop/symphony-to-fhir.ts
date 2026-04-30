// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import {
  mapValidatedAadiV2Bundle,
  type AadiV2FhirBundle as SymphonyFhirBundle,
} from '@sentra/sandi'
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
} from '@sentra/sandi'

export function mapSymphonyResultToFhirBundle(
  result: SymphonyResult,
): SymphonyFhirBundle {
  return mapValidatedAadiV2Bundle(projectSymphonyResultToFhirBundle(result))
}
