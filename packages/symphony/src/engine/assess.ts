import { checkDrugInteractions } from '@the-abyss/clinical-references'

import {
  SYMPHONY_CONTRACT_VERSION,
  type SymphonyPatientContext,
  type SymphonyResult,
  type SymphonyVitalsInput,
} from '../contracts'

import { anaphylaxisToSymphonyAlerts, detectSymphonyAnaphylaxis } from './anaphylaxis'
import {
  compositeDeteriorationToSymphonyAlerts,
  evaluateSymphonyCompositeDeterioration,
} from './composite-deterioration'
import {
  detectSymphonyEarlyWarningPatterns,
  earlyWarningsToSymphonyAlerts,
} from './early-warning'
import {
  applySymphonyHybridDecisioning,
  type SymphonyHybridDiagnosisCandidate,
} from './hybrid-decisioning'
import { calculateSymphonyNEWS2, news2ToSymphonyAlerts } from './news2'
import { detectSymphonyPeSuspect, peSuspectToSymphonyAlerts } from './pe-suspect'
import { evaluateSymphonyInstantScreeningGates } from './screening-gates'
import {
  classifySymphonyTrafficLight,
  trafficLightToSymphonyAlert,
} from './traffic-light'
import {
  analyzeSymphonyTrajectory,
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
  const shouldEvaluateTrafficLight =
    hybridDecisioning.suggestions.length > 0 ||
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
        diagnosisSuggestions: hybridDecisioning.suggestions,
        patientAge: input.patientContext.ageYears,
        chronicDiseases: input.chronicDiseases,
        ddiResult,
      })
    : undefined
  const trafficLightAlert = trafficLight
    ? trafficLightToSymphonyAlert(trafficLight, latestVitals?.observedAt ?? input.metadata.requestedAt)
    : null

  return {
    metadata: {
      engineVersion: SYMPHONY_ENGINE_VERSION,
      contractVersion: SYMPHONY_CONTRACT_VERSION,
      generatedAt: input.metadata.requestedAt,
      status: 'degraded',
      confidenceBand: 'insufficient_data',
      rationale: [
        'SYMPHONY deterministic NEWS2 and hard vital-alert slice is active; full diagnosis and trajectory engines are not migrated yet.',
      ],
      degradedReason: 'symphony_engine_partial_migration',
    },
    patientContext: input.patientContext,
    latestVitals,
    diagnosisSuggestions: hybridDecisioning.suggestions,
    alerts: trafficLightAlert ? [...alertsBeforeTrafficLight, trafficLightAlert] : alertsBeforeTrafficLight,
    trafficLight,
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
      safetyFlags: ['symphony_engine_partial_migration'],
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
      ],
    },
  }
}
