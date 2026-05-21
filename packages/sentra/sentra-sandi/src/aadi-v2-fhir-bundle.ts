// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { canValidateResourceType } from './validation-hooks'

export interface AadiV2FhirCoding {
  system: string
  code: string
  display?: string
}

export interface AadiV2FhirCodeableConcept {
  coding: AadiV2FhirCoding[]
}

export interface AadiV2FhirCondition {
  resourceType: 'Condition'
  id: string
  code: AadiV2FhirCodeableConcept
  category: 'working' | 'review' | 'must_not_miss' | 'deferred'
  verificationStatus: 'provisional' | 'differential' | 'unconfirmed'
  rank: number
  confidence: number
}

export interface AadiV2FhirRiskAssessment {
  resourceType: 'RiskAssessment'
  id: string
  status: 'final'
  prediction: {
    qualitativeRisk: AadiV2FhirCodeableConcept
  }[]
}

export interface AadiV2FhirDiagnosticReport {
  resourceType: 'DiagnosticReport'
  id: string
  status: 'final'
  conclusion: string
}

export interface AadiV2FhirObservation {
  resourceType: 'Observation'
  id: string
  status: 'final'
  code: AadiV2FhirCodeableConcept
  valueString: string
}

export type AadiV2FhirBundleResource =
  | AadiV2FhirCondition
  | AadiV2FhirRiskAssessment
  | AadiV2FhirDiagnosticReport
  | AadiV2FhirObservation

export interface AadiV2FhirBundleProjection {
  contractVersion: string
  generatedAt: string
  entries: AadiV2FhirBundleResource[]
}

export interface AadiV2FhirBundle {
  resourceType: 'Bundle'
  type: 'collection'
  entry: { resource: AadiV2FhirBundleResource }[]
  meta: {
    contractVersion: string
    generatedAt: string
  }
}

function assertBundleResourceType(resourceType: AadiV2FhirBundleResource['resourceType']): void {
  if (!canValidateResourceType(resourceType)) {
    throw new Error(
      `Unsupported AADI V2 bundle resource type: ${resourceType}. ` +
        'The current fhir-engine support matrix does not validate this resource family.'
    )
  }
}

function toBundleEntry(resource: AadiV2FhirBundleResource): { resource: AadiV2FhirBundleResource } {
  assertBundleResourceType(resource.resourceType)

  switch (resource.resourceType) {
    case 'Condition':
    case 'RiskAssessment':
    case 'DiagnosticReport':
    case 'Observation':
      return { resource }
  }
}

/**
 * Assemble the final FHIR Bundle from an already-projected AADI V2 resource set.
 *
 * This function is intentionally thin:
 * - it does not know `SymphonyResult`
 * - it does not perform clinical reasoning
 * - it does not expand terminology or resolve profiles
 * - it only assembles a deterministic Bundle from supported resource families
 */
export function mapValidatedAadiV2Bundle(projection: AadiV2FhirBundleProjection): AadiV2FhirBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: projection.entries.map(toBundleEntry),
    meta: {
      contractVersion: projection.contractVersion,
      generatedAt: projection.generatedAt,
    },
  }
}
