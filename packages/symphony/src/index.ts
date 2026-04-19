export {
  SYMPHONY_ENGINE_PACKAGE_NAME,
  SYMPHONY_ENGINE_VERSION,
  assessSymphonyInput,
  type SymphonyAssessmentCaller,
  type SymphonyAssessmentInput,
  type SymphonyAssessmentMetadata,
} from './engine/assess'

export {
  compositeDeteriorationToSymphonyAlerts,
  evaluateSymphonyCompositeDeterioration,
  type SymphonyCompositeAlert,
  type SymphonyCompositeAlertBucket,
  type SymphonyCompositeAlertConfidence,
  type SymphonyCompositeAlertSeverity,
  type SymphonyCompositeDataCompleteness,
  type SymphonyCompositeDelta,
  type SymphonyCompositeDerivedMetrics,
  type SymphonyCompositeDeteriorationInput,
  type SymphonyCompositeDeteriorationResult,
  type SymphonyCompositeEncounterBaseline,
  type SymphonyCompositePersonalBaseline,
  type SymphonyCompositeStructuredSigns,
  type SymphonyCompositeSyndromeId,
  type SymphonyCompositeWeightedScore,
} from './engine/composite-deterioration'

export {
  calculateSymphonyNEWS2,
  news2ToSymphonyAlerts,
  type SymphonyNEWS2Input,
  type SymphonyNEWS2ParameterScore,
  type SymphonyNEWS2Result,
  type SymphonyNEWS2RiskLevel,
} from './engine/news2'

export {
  detectSymphonyEarlyWarningPatterns,
  earlyWarningsToSymphonyAlerts,
  type SymphonyEarlyWarningInput,
  type SymphonyEarlyWarningMatch,
} from './engine/early-warning'

export {
  evaluateSymphonyInstantScreeningGates,
  type SymphonyInstantScreeningInput,
  type SymphonyScreeningGate,
  type SymphonyScreeningVitals,
} from './engine/screening-gates'

export { evaluateSymphonyVitalAlerts } from './engine/vital-alerts'

export {
  SYMPHONY_CONTRACT_VERSION,
  type SymphonyAlert,
  type SymphonyAlertSeverity,
  type SymphonyAlertSource,
  type SymphonyConfidenceBand,
  type SymphonyConsciousnessLevel,
  type SymphonyContractVersion,
  type SymphonyDecisionCategory,
  type SymphonyDiagnosisSuggestion,
  type SymphonyEngineStatus,
  type SymphonyMetadata,
  type SymphonyPatientContext,
  type SymphonyPregnancyStatus,
  type SymphonyQualitySummary,
  type SymphonyResult,
  type SymphonySafetyGate,
  type SymphonySexAtBirth,
  type SymphonyTrajectoryDirection,
  type SymphonyTrajectoryMomentum,
  type SymphonyTrajectorySummary,
  type SymphonyVitalsInput,
} from './contracts'
