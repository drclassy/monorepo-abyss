// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  AadiV2FhirBundleProjection,
  AadiV2FhirCondition,
  AadiV2FhirDiagnosticReport,
  AadiV2FhirObservation,
  AadiV2FhirRiskAssessment,
} from '@sentra/sandi'
import type {
  SymphonyAlert,
  SymphonyDiagnosticHypothesis,
  SymphonyResult,
  SymphonyTrafficLightOutput,
} from '../contracts'

const ICD10_SYSTEM = 'http://hl7.org/fhir/sid/icd-10' as const
const TRAFFIC_LIGHT_SYSTEM = 'urn:symphony:traffic-light' as const
const ALERT_SEVERITY_SYSTEM = 'urn:symphony:alert-severity' as const

function categoryToVerificationStatus(
  category: SymphonyDiagnosticHypothesis['category'],
): AadiV2FhirCondition['verificationStatus'] {
  switch (category) {
    case 'working':
      return 'provisional'
    case 'review':
    case 'must_not_miss':
      return 'differential'
    case 'deferred':
      return 'unconfirmed'
  }
}

function hypothesisToCondition(
  hypothesis: SymphonyDiagnosticHypothesis,
): AadiV2FhirCondition {
  return {
    resourceType: 'Condition',
    id: `cond-${hypothesis.rank}`,
    code: {
      coding: [
        {
          system: ICD10_SYSTEM,
          code: hypothesis.icd10Code,
          display: hypothesis.diagnosisName,
        },
      ],
    },
    category: hypothesis.category,
    verificationStatus: categoryToVerificationStatus(hypothesis.category),
    rank: hypothesis.rank,
    confidence: hypothesis.confidence,
  }
}

function trafficLightToRiskAssessment(
  trafficLight: SymphonyTrafficLightOutput,
): AadiV2FhirRiskAssessment {
  return {
    resourceType: 'RiskAssessment',
    id: 'risk-traffic-light',
    status: 'final',
    prediction: [
      {
        qualitativeRisk: {
          coding: [
            {
              system: TRAFFIC_LIGHT_SYSTEM,
              code: trafficLight.level,
            },
          ],
        },
      },
    ],
  }
}

function rationaleToDiagnosticReport(
  rationale: readonly string[],
): AadiV2FhirDiagnosticReport {
  return {
    resourceType: 'DiagnosticReport',
    id: 'report-rationale',
    status: 'final',
    conclusion: rationale.join(' '),
  }
}

function alertToObservation(alert: SymphonyAlert): AadiV2FhirObservation {
  return {
    resourceType: 'Observation',
    id: `obs-${alert.id}`,
    status: 'final',
    code: {
      coding: [
        {
          system: ALERT_SEVERITY_SYSTEM,
          code: alert.id,
        },
      ],
    },
    valueString: alert.severity,
  }
}

export function projectSymphonyResultToFhirBundle(
  result: SymphonyResult,
): AadiV2FhirBundleProjection {
  const entries = [
    ...(result.nativeHypotheses ?? []).map(hypothesisToCondition),
    ...(result.trafficLight ? [trafficLightToRiskAssessment(result.trafficLight)] : []),
    ...(result.metadata.rationale.length > 0
      ? [rationaleToDiagnosticReport(result.metadata.rationale)]
      : []),
    ...result.alerts
      .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
      .map(alertToObservation),
  ]

  return {
    contractVersion: result.metadata.contractVersion,
    generatedAt: result.metadata.generatedAt,
    entries,
  }
}
