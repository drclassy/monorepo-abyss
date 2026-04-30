// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { checkDrugInteractions } from '@the-abyss/clinical-references'

import {
  SYMPHONY_CONTRACT_VERSION,
  type SymphonyClinicalDisposition,
  type SymphonyClinicalFact,
  type SymphonyDecisionCategory,
  type SymphonyDiagnosisSuggestion,
  type SymphonyDiagnosticHypothesis,
  type SymphonyEngineStatus,
  type SymphonyPatientContext,
  type SymphonyResult,
  type SymphonyVitalsInput,
} from '../contracts'

import { anaphylaxisToSymphonyAlerts, detectSymphonyAnaphylaxis } from './anaphylaxis'
import { buildSymphonyClinicalFacts } from './clinical-facts'
import {
  compositeDeteriorationToSymphonyAlerts,
  evaluateSymphonyCompositeDeterioration,
} from './composite-deterioration'
import { determineSymphonyClinicalDisposition } from './confidence-engine'
import { getSymphonyDiagnosisPacks } from './diagnosis-packs'
import {
  detectSymphonyEarlyWarningPatterns,
  earlyWarningsToSymphonyAlerts,
} from './early-warning'
import { composeSymphonyExplainability } from './explainability'
import {
  applySymphonyHybridDecisioning,
  type SymphonyHybridDiagnosisCandidate,
} from './hybrid-decisioning'
import { buildSymphonyNativeDifferential } from './native-differential'
import { calculateSymphonyNEWS2, news2ToSymphonyAlerts } from './news2'
import { detectSymphonyPeSuspect, peSuspectToSymphonyAlerts } from './pe-suspect'
import { arbitrateSymphonyReasoning } from './reasoning-arbiter'
import { evaluateSymphonyInstantScreeningGates } from './screening-gates'
import { compareSymphonyShadowPaths } from './shadow-comparison'
import { classifySymphonySyndromes } from './syndrome-classifier'
import {
  classifySymphonyTrafficLight,
  trafficLightToSymphonyAlert,
} from './traffic-light'
import {
  analyzeSymphonyTrajectory,
  buildSymphonyPersonalBaseline,
  detectSymphonyTreatmentResponse,
  trajectoryDirectionFromAnalysis,
  trajectoryMomentumFromAnalysis,
} from './trajectory'
import { evaluateSymphonyVitalAlerts } from './vital-alerts'

export const SYMPHONY_ENGINE_PACKAGE_NAME = '@the-abyss/symphony' as const

export const SYMPHONY_ENGINE_VERSION = '0.0.1-scaffold' as const

export type SymphonyAssessmentCaller = 'dashboard' | 'assist' | 'system'

export interface SymphonyAssessmentMetadata {
  requestId: string
  requestedAt: string
  caller: SymphonyAssessmentCaller
}

export interface SymphonyAssessmentInput {
  metadata: SymphonyAssessmentMetadata
  patientContext: SymphonyPatientContext
  vitals: SymphonyVitalsInput[]
  hasCOPD?: boolean
  chiefComplaint?: string
  additionalComplaint?: string
  medicalHistory?: string[]
  allergies?: string[]
  activeMedications?: string[]
  chronicDiseases?: string[]
  diagnosisCandidates?: SymphonyHybridDiagnosisCandidate[]
}

interface AadiV2State {
  clinicalFacts: SymphonyClinicalFact[]
  nativeHypotheses: SymphonyDiagnosticHypothesis[]
  clinicalDisposition: SymphonyClinicalDisposition
  arbitrationReasons: string[]
  explainabilityLines: string[]
  pipelineFailed: boolean
  failureReason: string
}

const NATIVE_CATEGORY_TO_DECISION: Record<
  SymphonyDiagnosticHypothesis['category'],
  SymphonyDecisionCategory
> = {
  working: 'recommended',
  review: 'review',
  must_not_miss: 'must_not_miss',
  deferred: 'deferred',
}

function nativeHypothesisToCompatibilitySuggestion(
  hypothesis: SymphonyDiagnosticHypothesis,
): SymphonyDiagnosisSuggestion {
  return {
    id: `native:${hypothesis.id}`,
    icd10Code: hypothesis.icd10Code,
    diagnosisName: hypothesis.diagnosisName,
    confidence: hypothesis.confidence,
    decisionCategory: NATIVE_CATEGORY_TO_DECISION[hypothesis.category],
    reasoning: [...hypothesis.evidence.supports],
    evidenceRefs: [...hypothesis.evidenceRefs],
    mustNotMiss: hypothesis.category === 'must_not_miss',
  }
}

function classifyAadiV2FailureReason(error: unknown): string {
  if (error instanceof Error && typeof error.name === 'string' && error.name.length > 0) {
    return error.name
  }
  return 'unknown'
}

export function assessSymphonyInput(input: SymphonyAssessmentInput): SymphonyResult {
  const latestVitals = input.vitals.at(-1)
  const news2 = calculateSymphonyNEWS2({
    vitals: latestVitals,
    hasCOPD: input.hasCOPD,
  })
  const vitalAlerts = evaluateSymphonyVitalAlerts(latestVitals)
  const safetyGateAlerts = evaluateSymphonyInstantScreeningGates({
    latestVitals,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
    chiefComplaint: input.chiefComplaint,
    medicalHistory: input.medicalHistory,
  })
  const compositeDeterioration = evaluateSymphonyCompositeDeterioration({
    current: latestVitals,
    hasCOPD: input.hasCOPD,
  })
  const compositeAlerts = compositeDeteriorationToSymphonyAlerts(compositeDeterioration)
  const peSuspect = detectSymphonyPeSuspect({
    latestVitals,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const peSuspectAlerts = peSuspectToSymphonyAlerts(
    peSuspect,
    latestVitals?.observedAt ?? input.metadata.requestedAt
  )
  const anaphylaxis = detectSymphonyAnaphylaxis({
    latestVitals,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    allergies: input.allergies,
    ageYears: input.patientContext.ageYears,
  })
  const anaphylaxisAlerts = anaphylaxisToSymphonyAlerts(
    anaphylaxis,
    latestVitals?.observedAt ?? input.metadata.requestedAt
  )
  const trajectoryAnalysis = analyzeSymphonyTrajectory(input.vitals)
  const news2Alerts = news2ToSymphonyAlerts(
    news2,
    latestVitals?.observedAt ?? input.metadata.requestedAt
  )
  const earlyWarnings = detectSymphonyEarlyWarningPatterns({
    latestVitals,
    news2,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const patternAlerts = earlyWarningsToSymphonyAlerts(
    earlyWarnings,
    latestVitals?.observedAt ?? input.metadata.requestedAt
  )
  const hybridDecisioning = applySymphonyHybridDecisioning({
    candidates: input.diagnosisCandidates ?? [],
    patientContext: input.patientContext,
    latestVitals,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    allergies: input.allergies,
  })
  const alertsBeforeTrafficLight = [
    ...vitalAlerts,
    ...safetyGateAlerts,
    ...peSuspectAlerts,
    ...anaphylaxisAlerts,
    ...compositeAlerts,
    ...news2Alerts,
    ...patternAlerts,
  ]

  const aadiv2: AadiV2State = {
    clinicalFacts: [],
    nativeHypotheses: [],
    clinicalDisposition: 'insufficient_data',
    arbitrationReasons: [],
    explainabilityLines: [],
    pipelineFailed: false,
    failureReason: 'none',
  }

  try {
    const clinicalFactsResult = buildSymphonyClinicalFacts(input)
    const syndromes = classifySymphonySyndromes(clinicalFactsResult.facts)
    const packs = getSymphonyDiagnosisPacks()
    const differential = buildSymphonyNativeDifferential({
      facts: clinicalFactsResult.facts,
      syndromes,
      packs,
    })
    const personalBaseline = buildSymphonyPersonalBaseline(
      input.vitals,
      input.metadata.requestedAt
    )
    const treatmentResponse = detectSymphonyTreatmentResponse(
      trajectoryAnalysis.momentum.params
    )
    const arbitration = arbitrateSymphonyReasoning({
      nativeHypotheses: differential.hypotheses,
      hybridSuggestions: hybridDecisioning.suggestions,
      alerts: alertsBeforeTrafficLight,
      personalBaseline,
      treatmentResponse,
      latestVitals,
    })
    const hasCriticalAlert = alertsBeforeTrafficLight.some(
      alert => alert.severity === 'critical'
    )
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: arbitration.nativeHypotheses.length,
      hasCriticalAlert,
      usedFallback: false,
      arbiterRequiresReview: arbitration.requiresReview,
    })
    const topHypothesis = arbitration.nativeHypotheses[0]
    const explainabilityLines = topHypothesis
      ? composeSymphonyExplainability({
          topDiagnosisName: topHypothesis.diagnosisName,
          supportKeys: topHypothesis.evidence.supports,
          missingKeys: topHypothesis.evidence.missing,
          weakenKeys: topHypothesis.evidence.weakens,
          nextBestQuestions: topHypothesis.evidence.nextBestQuestions,
          arbitrationReasons: arbitration.arbitrationReasons,
        })
      : []

    aadiv2.clinicalFacts = clinicalFactsResult.facts
    aadiv2.nativeHypotheses = arbitration.nativeHypotheses
    aadiv2.clinicalDisposition = disposition
    aadiv2.arbitrationReasons = arbitration.arbitrationReasons
    aadiv2.explainabilityLines = explainabilityLines
  } catch (error) {
    aadiv2.clinicalDisposition = 'degraded'
    aadiv2.pipelineFailed = true
    aadiv2.failureReason = classifyAadiV2FailureReason(error)
  }

  const nativeCompatibilitySuggestions = aadiv2.nativeHypotheses.map(
    nativeHypothesisToCompatibilitySuggestion,
  )
  const trafficLightSuggestions: SymphonyDiagnosisSuggestion[] = [
    ...hybridDecisioning.suggestions,
    ...nativeCompatibilitySuggestions,
  ]
  const shouldEvaluateTrafficLight =
    trafficLightSuggestions.length > 0 ||
    (input.activeMedications?.length ?? 0) > 1 ||
    (input.chronicDiseases?.length ?? 0) > 0
  const ddiResult =
    shouldEvaluateTrafficLight && (input.activeMedications?.length ?? 0) > 1
      ? checkDrugInteractions({
          activeMedications: input.activeMedications ?? [],
        })
      : undefined
  const trafficLight = shouldEvaluateTrafficLight
    ? classifySymphonyTrafficLight({
        alerts: alertsBeforeTrafficLight,
        diagnosisSuggestions: trafficLightSuggestions,
        patientAge: input.patientContext.ageYears,
        chronicDiseases: input.chronicDiseases,
        ddiResult,
      })
    : undefined
  const trafficLightAlert = trafficLight
    ? trafficLightToSymphonyAlert(trafficLight, latestVitals?.observedAt ?? input.metadata.requestedAt)
    : null

  const shouldEvaluateOldTrafficLight =
    hybridDecisioning.suggestions.length > 0 ||
    (input.activeMedications?.length ?? 0) > 1 ||
    (input.chronicDiseases?.length ?? 0) > 0
  const oldPathTrafficLight = shouldEvaluateOldTrafficLight
    ? classifySymphonyTrafficLight({
        alerts: alertsBeforeTrafficLight,
        diagnosisSuggestions: hybridDecisioning.suggestions,
        patientAge: input.patientContext.ageYears,
        chronicDiseases: input.chronicDiseases,
        ddiResult,
      })
    : undefined

  const shadowComparison = compareSymphonyShadowPaths({
    hybridSuggestions: hybridDecisioning.suggestions,
    nativeHypotheses: aadiv2.nativeHypotheses,
    alerts: alertsBeforeTrafficLight,
    oldTrafficLightLevel: oldPathTrafficLight?.level,
    newTrafficLightLevel: trafficLight?.level,
    newClinicalDisposition: aadiv2.clinicalDisposition,
    newPathFailed: aadiv2.pipelineFailed,
  })

  const engineStatus: SymphonyEngineStatus = aadiv2.pipelineFailed
    ? 'degraded'
    : aadiv2.clinicalDisposition === 'degraded'
      ? 'degraded'
      : 'ready'
  const engineDegradedReason = aadiv2.pipelineFailed
    ? `aadiv2_pipeline_failure:${aadiv2.failureReason}`
    : aadiv2.clinicalDisposition === 'degraded'
      ? 'aadiv2_clinical_degraded'
      : undefined

  return {
    metadata: {
      engineVersion: SYMPHONY_ENGINE_VERSION,
      contractVersion: SYMPHONY_CONTRACT_VERSION,
      generatedAt: input.metadata.requestedAt,
      status: engineStatus,
      confidenceBand: 'insufficient_data',
      rationale: aadiv2.explainabilityLines,
      ...(engineDegradedReason !== undefined ? { degradedReason: engineDegradedReason } : {}),
    },
    clinicalDisposition: aadiv2.clinicalDisposition,
    patientContext: input.patientContext,
    latestVitals,
    diagnosisSuggestions: hybridDecisioning.suggestions,
    nativeHypotheses:
      aadiv2.nativeHypotheses.length > 0 ? aadiv2.nativeHypotheses : undefined,
    clinicalFacts:
      aadiv2.clinicalFacts.length > 0 ? aadiv2.clinicalFacts : undefined,
    alerts: trafficLightAlert ? [...alertsBeforeTrafficLight, trafficLightAlert] : alertsBeforeTrafficLight,
    trafficLight,
    shadowComparison,
    trajectory: {
      direction: trajectoryDirectionFromAnalysis(trajectoryAnalysis),
      momentum: trajectoryMomentumFromAnalysis(trajectoryAnalysis),
      summary: trajectoryAnalysis.summary,
      evidenceRefs: [
        `trajectory_state:${trajectoryAnalysis.globalDeterioration.state}`,
        `trajectory_score:${trajectoryAnalysis.globalDeterioration.deteriorationScore}`,
        `momentum_level:${trajectoryAnalysis.momentum.level}`,
        `convergence_pattern:${trajectoryAnalysis.momentum.convergence.pattern}`,
      ],
    },
    quality: {
      completenessScore: 0,
      missingFields: [],
      safetyFlags: aadiv2.pipelineFailed
        ? [`aadiv2_pipeline_failure:${aadiv2.failureReason}`]
        : [],
      auditHints: [
        input.metadata.requestId,
        input.metadata.caller,
        `news2_score:${news2.aggregateScore}`,
        `news2_risk:${news2.riskLevel}`,
        `safety_gate_count:${safetyGateAlerts.length}`,
        `pe_suspect:${peSuspect.suspect ? 1 : 0}`,
        `pe_criteria_count:${peSuspect.score}`,
        `anaphylaxis_suspect:${anaphylaxis.suspect ? 1 : 0}`,
        `anaphylaxis_trigger:${anaphylaxis.trigger ?? 'none'}`,
        `composite_alert_count:${compositeDeterioration.compositeAlerts.length}`,
        `composite_watcher_count:${compositeDeterioration.watchers.length}`,
        `early_warning_count:${earlyWarnings.length}`,
        `traffic_light:${trafficLight?.level ?? 'not_evaluated'}`,
        `traffic_light_override:${trafficLight?.overrideApplied === true ? 1 : 0}`,
        `ddi_reference_status:${ddiResult?.status ?? 'not_evaluated'}`,
        `trajectory_state:${trajectoryAnalysis.globalDeterioration.state}`,
        `trajectory_momentum:${trajectoryAnalysis.momentum.level}`,
        ...hybridDecisioning.auditHints,
        `clinical_facts_count:${aadiv2.clinicalFacts.length}`,
        `native_hypothesis_count:${aadiv2.nativeHypotheses.length}`,
        `clinical_disposition:${aadiv2.clinicalDisposition}`,
        `arbiter_requires_review:${aadiv2.arbitrationReasons.length > 0 ? 1 : 0}`,
        `aadiv2_pipeline_failed:${aadiv2.pipelineFailed ? 1 : 0}`,
        `aadiv2_failure_reason:${aadiv2.failureReason}`,
        `native_compat_suggestion_count:${nativeCompatibilitySuggestions.length}`,
        `shadow_agreement:${shadowComparison.agreementLevel}`,
        `shadow_top_changed:${shadowComparison.topDiagnosisChanged ? 1 : 0}`,
        `shadow_escalation_changed:${shadowComparison.escalationChanged ? 1 : 0}`,
        `shadow_disposition_changed:${shadowComparison.clinicalDispositionChanged ? 1 : 0}`,
      ],
    },
  }
}
