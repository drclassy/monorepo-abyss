import type {
  SymphonyAlert,
  SymphonyDiagnosticHypothesis,
  SymphonyResult,
  SymphonyTrafficLightOutput,
} from '../contracts'

const ICD10_SYSTEM = 'http://hl7.org/fhir/sid/icd-10' as const
const TRAFFIC_LIGHT_SYSTEM = 'urn:symphony:traffic-light' as const
const ALERT_SEVERITY_SYSTEM = 'urn:symphony:alert-severity' as const

export interface SymphonyFhirCoding {
  system: string
  code: string
  display?: string
}

export interface SymphonyFhirCodeableConcept {
  coding: SymphonyFhirCoding[]
}

export interface SymphonyFhirCondition {
  resourceType: 'Condition'
  id: string
  code: SymphonyFhirCodeableConcept
  category: SymphonyDiagnosticHypothesis['category']
  verificationStatus: 'provisional' | 'differential' | 'unconfirmed'
  rank: number
  confidence: number
}

export interface SymphonyFhirRiskAssessment {
  resourceType: 'RiskAssessment'
  id: string
  status: 'final'
  prediction: {
    qualitativeRisk: SymphonyFhirCodeableConcept
  }[]
}

export interface SymphonyFhirDiagnosticReport {
  resourceType: 'DiagnosticReport'
  id: string
  status: 'final'
  conclusion: string
}

export interface SymphonyFhirObservation {
  resourceType: 'Observation'
  id: string
  status: 'final'
  code: SymphonyFhirCodeableConcept
  valueString: string
}

export type SymphonyFhirResource =
  | SymphonyFhirCondition
  | SymphonyFhirRiskAssessment
  | SymphonyFhirDiagnosticReport
  | SymphonyFhirObservation

export interface SymphonyFhirBundle {
  resourceType: 'Bundle'
  type: 'collection'
  entry: { resource: SymphonyFhirResource }[]
  meta: {
    contractVersion: string
    generatedAt: string
  }
}

function categoryToVerificationStatus(
  category: SymphonyDiagnosticHypothesis['category'],
): SymphonyFhirCondition['verificationStatus'] {
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
): SymphonyFhirCondition {
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
): SymphonyFhirRiskAssessment {
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
): SymphonyFhirDiagnosticReport {
  return {
    resourceType: 'DiagnosticReport',
    id: 'report-rationale',
    status: 'final',
    conclusion: rationale.join(' '),
  }
}

function alertToObservation(alert: SymphonyAlert): SymphonyFhirObservation {
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

export function mapSymphonyResultToFhirBundle(
  result: SymphonyResult,
): SymphonyFhirBundle {
  const entry: { resource: SymphonyFhirResource }[] = []

  const hypotheses = result.nativeHypotheses ?? []
  hypotheses.forEach(hypothesis => {
    entry.push({ resource: hypothesisToCondition(hypothesis) })
  })

  if (result.trafficLight) {
    entry.push({ resource: trafficLightToRiskAssessment(result.trafficLight) })
  }

  if (result.metadata.rationale.length > 0) {
    entry.push({ resource: rationaleToDiagnosticReport(result.metadata.rationale) })
  }

  result.alerts
    .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
    .forEach(alert => {
      entry.push({ resource: alertToObservation(alert) })
    })

  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry,
    meta: {
      contractVersion: result.metadata.contractVersion,
      generatedAt: result.metadata.generatedAt,
    },
  }
}
