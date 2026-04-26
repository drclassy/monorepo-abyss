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
  runSymphonyParityFixture,
  runSymphonyParityFixtures,
  SYMPHONY_PARITY_FIXTURE_CASES,
  type SymphonyParityExpectation,
  type SymphonyParityFixtureCase,
  type SymphonyParityFixtureResult,
  type SymphonyParitySnapshot,
} from './engine/parity-fixtures'

export {
  detectSymphonyEarlyWarningPatterns,
  earlyWarningsToSymphonyAlerts,
  type SymphonyEarlyWarningInput,
  type SymphonyEarlyWarningMatch,
} from './engine/early-warning'

export {
  applySymphonyHybridDecisioning,
  type SymphonyHybridDecisionCounts,
  type SymphonyHybridDecisionInput,
  type SymphonyHybridDecisionResult,
  type SymphonyHybridDiagnosisCandidate,
  type SymphonyHybridValidationFlag,
} from './engine/hybrid-decisioning'

export {
  evaluateSymphonyInstantScreeningGates,
  type SymphonyInstantScreeningInput,
  type SymphonyScreeningGate,
  type SymphonyScreeningVitals,
} from './engine/screening-gates'

export {
  analyzeSymphonyTrajectory,
  buildSymphonyPersonalBaseline,
  detectSymphonyTreatmentResponse,
  trajectoryDirectionFromAnalysis,
  trajectoryMomentumFromAnalysis,
  type SymphonyAcuteAttackRisk24h,
  type SymphonyClinicalSafeOutput,
  type SymphonyConvergencePattern,
  type SymphonyConvergenceResult,
  type SymphonyEarlyWarningBurden,
  type SymphonyGlobalDeteriorationState,
  type SymphonyMomentumAnalysis,
  type SymphonyMomentumLevel,
  type SymphonyMomentumParam,
  type SymphonyMortalityProxyRisk,
  type SymphonyPersonalBaseline,
  type SymphonyPersonalBaselineParam,
  type SymphonyTimeToCriticalEstimate,
  type SymphonyTimeToCriticalProjection,
  type SymphonyTreatmentResponse,
  type SymphonyTreatmentResponseInterpretation,
  type SymphonyTrajectoryAnalysis,
  type SymphonyTrajectoryRiskLevel,
  type SymphonyTrajectoryVolatility,
  type SymphonyVitalTrend,
} from './engine/trajectory'

export {
  classifySymphonyTrafficLight,
  trafficLightToSymphonyAlert,
  type SymphonyTrafficLightInput,
} from './engine/traffic-light'

export { evaluateSymphonyVitalAlerts } from './engine/vital-alerts'

export {
  detectSymphonySymptomSignals,
} from './engine/symptom-signals'

export {
  detectSymphonyPeSuspect,
  peSuspectToSymphonyAlerts,
  SYMPHONY_PE_SUSPECT_THRESHOLD,
  type SymphonyPeSuspectCriterion,
  type SymphonyPeSuspectInput,
  type SymphonyPeSuspectResult,
} from './engine/pe-suspect'

export {
  anaphylaxisToSymphonyAlerts,
  detectSymphonyAnaphylaxis,
  type SymphonyAnaphylaxisInput,
  type SymphonyAnaphylaxisOrganSystem,
  type SymphonyAnaphylaxisResult,
} from './engine/anaphylaxis'

export {
  adaptAssistPatternToSymphonyAlert,
  assistPatternAlertId,
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  ASSIST_PATTERN_PARITY_FIXTURE_CASES,
  getAssistPatternParityDefinition,
  runAssistPatternParityFixture,
  runAssistPatternParityFixtures,
  type AdaptAssistPatternToSymphonyAlertOptions,
  type AssistPatternCriterionOp,
  type AssistPatternParityCriterion,
  type AssistPatternParityCriteria,
  type AssistPatternParityDefinition,
  type AssistPatternParityFixtureCase,
  type AssistPatternParityFixtureResult,
  type AssistPatternParityGate,
  type AssistPatternParityId,
  type AssistPatternParityTier,
} from './adapters/assist-patterns-parity'

export {
  evaluateSymphonyPatterns,
  type SymphonyPatternEvaluationOptions,
} from './engine/pattern-engine'

export {
  attachSymphonyActionProtocol,
  getSymphonyActionProtocol,
  SYMPHONY_ACTION_PROTOCOLS,
} from './engine/action-protocols'

export {
  SYMPHONY_BP_THRESHOLDS,
  SYMPHONY_CAPTOPRIL_PROTOCOL,
  SYMPHONY_GLUCOSE_THRESHOLDS,
  assessSymphonyConsciousnessSeverity,
  classifySymphonyBloodGlucose,
  classifySymphonyChronicDisease,
  classifySymphonyHypertension,
  classifySymphonyHypertensionType,
  classifySymphonyGlucose,
  finalizeSymphonyBloodPressure,
  getSymphonyBestGcsTotal,
  getSymphonyDiseaseFullName,
  getSymphonyGlucoseReasoning,
  getSymphonyGlucoseRecommendations,
  getSymphonyHypertensionReasoning,
  getSymphonyHypertensionRecommendations,
  getSymphonyHypertensionSeverity,
  getSymphonySupportedDiseaseTypes,
  isSymphonyChronicDisease,
  symphonyAvpuToEstimatedGcs,
  symphonyAvpuToGcsTotal,
  symphonyAvpuToNews2Score,
  symphonyGcsToAvpu,
  triageSymphonyHyperglycemia,
  triageSymphonyHypertensiveCrisis,
  type SymphonyBpMeasurementSession,
  type SymphonyBpReading,
  type SymphonyCaptoprilProtocolStep,
  type SymphonyChronicDiseaseClassification,
  type SymphonyChronicDiseaseSeverity,
  type SymphonyChronicDiseaseType,
  type SymphonyConsciousnessSeverity,
  type SymphonyDkaHhsRedFlags,
  type SymphonyGcsComponents,
  type SymphonyGlucoseClassification,
  type SymphonyGlucoseClassifierCategory,
  type SymphonyGlucoseData,
  type SymphonyGlucoseMeasurementType,
  type SymphonyHmodRedFlags,
  type SymphonyHypertensionClassification,
  type SymphonyHypertensionSeverity,
  type SymphonyHypertensionType,
  type SymphonyHyperglycemiaCrisisType,
} from './engine/classifiers'

export {
  clinicalPatternMatchToSymphonyAlert,
  evaluateClinicalPatterns,
  SYMPHONY_CLINICAL_PATTERNS,
} from './engine/clinical-patterns'

export {
  buildSymphonyClinicalFacts,
  type SymphonyClinicalFactsResult,
} from './engine/clinical-facts'

export {
  classifySymphonySyndromes,
  type SymphonySyndromeId,
  type SymphonySyndromeMatch,
} from './engine/syndrome-classifier'


export {
  SYMPHONY_CONTRACT_VERSION,
  type SymphonyActionProtocol,
  type SymphonyActionProtocolId,
  type SymphonyActionProtocolReferral,
  type SymphonyActionProtocolSection,
  type SymphonyActionProtocolSectionKey,
  type SymphonyAlert,
  type SymphonyAlertSeverity,
  type SymphonyAlertSource,
  type SymphonyAvpuLevel,
  type SymphonyClinicalDisposition,
  type SymphonyClinicalFact,
  type SymphonyClinicalHistory,
  type SymphonyClinicalPattern,
  type SymphonyEvaluablePattern,
  type SymphonyClinicalSnapshot,
  type SymphonyDiagnosticHypothesis,
  type SymphonyConfidenceBand,
  type SymphonyConsciousnessLevel,
  type SymphonyContractVersion,
  type SymphonyCriterion,
  type SymphonyCriterionOp,
  type SymphonyDecisionCategory,
  type SymphonyDerivedValues,
  type SymphonyDiagnosisSuggestion,
  type SymphonyEngineStatus,
  type SymphonyGlucoseCategory,
  type SymphonyHistoricalBP,
  type SymphonyHtnSeverity,
  type SymphonyMetadata,
  type SymphonyParsedVitals,
  type SymphonyPatientContext,
  type SymphonyPatternMatch,
  type SymphonyPatternSeverity,
  type SymphonyPatternTier,
  type SymphonyPhysiologyBand,
  type SymphonyPregnancyStatus,
  type SymphonyQualitySummary,
  type SymphonyReasoningEvidence,
  type SymphonyReferralUrgency,
  type SymphonyResult,
  type SymphonySafetyGate,
  type SymphonyShadowComparison,
  type SymphonyScoreResult,
  type SymphonySexAtBirth,
  type SymphonySnapshotPatient,
  type SymphonySymptomContext,
  type SymphonySymptomSignal,
  type SymphonySymptomSignalInput,
  type SymphonySymptomSignalResult,
  type SymphonyTrajectoryDirection,
  type SymphonyTrajectoryMomentum,
  type SymphonyTrajectorySummary,
  type SymphonyTrafficLightGateResult,
  type SymphonyTrafficLightLevel,
  type SymphonyTrafficLightOutput,
  type SymphonyVitalsInput,
} from './contracts'
