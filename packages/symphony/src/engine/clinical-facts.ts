import type {
  SymphonyAlert,
  SymphonyClinicalFact,
  SymphonyClinicalSnapshot,
  SymphonyGlucoseCategory,
  SymphonyHtnSeverity,
  SymphonyVitalsInput,
} from '../contracts'

import { detectSymphonyAnaphylaxis, type SymphonyAnaphylaxisResult } from './anaphylaxis'
import type { SymphonyAssessmentInput } from './assess'
import {
  classifySymphonyBloodGlucose,
  classifySymphonyChronicDisease,
  classifySymphonyHypertension,
  finalizeSymphonyBloodPressure,
  getSymphonyHypertensionSeverity,
  normalizeSymphonyConsciousnessToAvpu,
} from './classifiers'
import { evaluateClinicalPatterns } from './clinical-patterns'
import { evaluateSymphonyCompositeDeterioration } from './composite-deterioration'
import { detectSymphonyEarlyWarningPatterns } from './early-warning'
import { calculateSymphonyNEWS2 } from './news2'
import { detectSymphonyPeSuspect, type SymphonyPeSuspectResult } from './pe-suspect'
import { evaluateSymphonyInstantScreeningGates } from './screening-gates'
import { detectSymphonySymptomSignals } from './symptom-signals'
import {
  analyzeSymphonyTrajectory,
  trajectoryDirectionFromAnalysis,
  trajectoryMomentumFromAnalysis,
} from './trajectory'

export interface SymphonyClinicalFactsResult {
  facts: SymphonyClinicalFact[]
  snapshot: SymphonyClinicalSnapshot
  screeningAlerts: SymphonyAlert[]
  patternAlerts: SymphonyAlert[]
  peSuspect: SymphonyPeSuspectResult
  anaphylaxis: SymphonyAnaphylaxisResult
  news2: ReturnType<typeof calculateSymphonyNEWS2>
  earlyWarnings: ReturnType<typeof detectSymphonyEarlyWarningPatterns>
  composite: ReturnType<typeof evaluateSymphonyCompositeDeterioration>
  trajectory: ReturnType<typeof analyzeSymphonyTrajectory>
}

function pushFact(
  facts: SymphonyClinicalFact[],
  key: string,
  value: string | number | boolean,
  sourceRefs: string[],
  confidence?: number,
): void {
  facts.push({ key, value, sourceRefs, confidence })
}

function latestVitals(vitals: SymphonyVitalsInput[]): SymphonyVitalsInput | undefined {
  return vitals.at(-1)
}


function toSnapshotGlucoseCategory(glucoseMgDl: number | undefined): SymphonyGlucoseCategory | undefined {
  if (glucoseMgDl === undefined) return undefined
  if (glucoseMgDl < 70) return 'hypoglycemic'
  if (glucoseMgDl >= 300) return 'severe_hyperglycemia'
  if (glucoseMgDl >= 200) return 'diabetic'
  if (glucoseMgDl >= 100) return 'prediabetic'
  return 'normal'
}

function toSnapshotHtnSeverity(latest: SymphonyVitalsInput | undefined): SymphonyHtnSeverity | undefined {
  if (latest?.systolicBp === undefined || latest.diastolicBp === undefined) return undefined
  return getSymphonyHypertensionSeverity({
    sbp: latest.systolicBp,
    dbp: latest.diastolicBp,
  })
}

function buildSnapshot(input: SymphonyAssessmentInput): SymphonyClinicalSnapshot {
  const latest = latestVitals(input.vitals)
  const symptoms = detectSymphonySymptomSignals({
    chiefComplaint: input.chiefComplaint ?? '',
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory?.join(' '),
  })
  const chronicClasses = (input.chronicDiseases ?? [])
    .map(code => classifySymphonyChronicDisease(code))
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    vitals: {
      sbp: latest?.systolicBp ?? 120,
      dbp: latest?.diastolicBp ?? 80,
      hr: latest?.heartRate ?? 80,
      rr: latest?.respiratoryRate ?? 16,
      temp: latest?.temperatureC ?? 36.8,
      spo2: latest?.spo2 ?? 98,
      glucose: latest?.glucoseMgDl ?? 0,
    },
    derived: {
      map:
        latest?.systolicBp !== undefined && latest.diastolicBp !== undefined
          ? Math.round(latest.diastolicBp + (latest.systolicBp - latest.diastolicBp) / 3)
          : undefined,
      shockIndex:
        latest?.systolicBp !== undefined &&
        latest.heartRate !== undefined &&
        latest.systolicBp > 0
          ? Number((latest.heartRate / latest.systolicBp).toFixed(2))
          : undefined,
      avpuLevel: normalizeSymphonyConsciousnessToAvpu(latest?.consciousness) ?? 'A',
      htnSeverity: toSnapshotHtnSeverity(latest),
      glucoseCategory: toSnapshotGlucoseCategory(latest?.glucoseMgDl),
      hasHypotension: (latest?.systolicBp ?? 999) < 90,
      pulsePressure:
        latest?.systolicBp !== undefined && latest.diastolicBp !== undefined
          ? latest.systolicBp - latest.diastolicBp
          : undefined,
    },
    symptoms: {
      ...symptoms,
      dyspnea: symptoms.signals.includes('dyspnea'),
      chestPain: symptoms.signals.includes('chest_pain'),
      dizziness: symptoms.signals.includes('dizziness'),
      focalNeuroDeficit: symptoms.signals.includes('neurologic_focal_deficit'),
      kussmaulBreathing: symptoms.signals.includes('kussmaul_breathing'),
      polyuria: symptoms.signals.includes('polyuria'),
      seizure: symptoms.signals.includes('seizure'),
      suspectedInfection: symptoms.signals.includes('fever'),
      syncope: symptoms.signals.includes('syncope'),
      weakness: symptoms.signals.includes('weakness'),
    },
    history: {
      bpHistory: input.vitals
        .filter(item => item.systolicBp !== undefined && item.diastolicBp !== undefined)
        .map(item => ({
          sbp: item.systolicBp as number,
          dbp: item.diastolicBp as number,
          timestamp: new Date(item.observedAt).getTime(),
        })),
      knownHTN: chronicClasses.some(item => item.type === 'HT'),
      knownDM: chronicClasses.some(item => item.type === 'DM'),
      knownAsthma: chronicClasses.some(item => item.type === 'ASTHMA'),
      knownCOPD: Boolean(input.hasCOPD) || chronicClasses.some(item => item.type === 'PPOK'),
      pregnancyStatus:
        input.patientContext.pregnancyStatus === 'pregnant'
          ? true
          : input.patientContext.pregnancyStatus === 'not_pregnant' ||
              input.patientContext.pregnancyStatus === 'not_applicable'
            ? false
            : null,
      allergies: input.allergies ?? [],
      chronicDiseases: input.chronicDiseases ?? [],
    },
    patient: {
      age: input.patientContext.ageYears ?? 0,
      physiology:
        (input.patientContext.ageYears ?? 0) >= 65
          ? 'geriatric'
          : (input.patientContext.ageYears ?? 0) >= 18
            ? 'adult'
            : 'child',
      avpuManual: normalizeSymphonyConsciousnessToAvpu(latest?.consciousness) ?? 'A',
      supplementalO2: latest?.oxygenSupplement ?? false,
      painScore: 0,
    },
    timestamp: latest ? new Date(latest.observedAt).getTime() : Date.now(),
  }
}

export function buildSymphonyClinicalFacts(
  input: SymphonyAssessmentInput,
): SymphonyClinicalFactsResult {
  const facts: SymphonyClinicalFact[] = []
  const latest = latestVitals(input.vitals)
  const snapshot = buildSnapshot(input)
  const symptoms = snapshot.symptoms
  const news2 = calculateSymphonyNEWS2({
    vitals: latest,
    hasCOPD: input.hasCOPD,
  })
  const screeningAlerts = evaluateSymphonyInstantScreeningGates({
    latestVitals: latest,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
    chiefComplaint: input.chiefComplaint,
    medicalHistory: input.medicalHistory,
  })
  const earlyWarnings = detectSymphonyEarlyWarningPatterns({
    latestVitals: latest,
    news2,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const trajectory = analyzeSymphonyTrajectory(input.vitals)
  const pe = detectSymphonyPeSuspect({
    latestVitals: latest,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const composite = evaluateSymphonyCompositeDeterioration({
    current: latest,
    hasCOPD: input.hasCOPD,
  })
  const anaphylaxis = detectSymphonyAnaphylaxis({
    latestVitals: latest,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    allergies: input.allergies,
    ageYears: input.patientContext.ageYears,
  })
  const patternAlerts = evaluateClinicalPatterns(
    snapshot,
    undefined,
    latest?.observedAt ?? input.metadata.requestedAt,
  )

  if (symptoms.signals.includes('fever')) {
    pushFact(facts, 'symptom_fever', true, ['symptom-signals'])
  }
  if (symptoms.signals.includes('dyspnea')) {
    pushFact(facts, 'symptom_dyspnea', true, ['symptom-signals'])
  }

  const bpReadings = input.vitals
    .filter(item => item.systolicBp !== undefined && item.diastolicBp !== undefined)
    .slice(-3)
    .map(item => ({
      sbp: item.systolicBp as number,
      dbp: item.diastolicBp as number,
      timestamp: new Date(item.observedAt),
    }))

  if (bpReadings.length >= 2) {
    const hypertension = classifySymphonyHypertension({
      readings: bpReadings,
      finalBp: finalizeSymphonyBloodPressure(bpReadings).finalBp,
      measurementQuality: finalizeSymphonyBloodPressure(bpReadings).measurementQuality,
    })
    pushFact(facts, 'htn_severity', hypertension.severity, ['classifiers'])
  }

  if (latest?.glucoseMgDl) {
    const glucose = classifySymphonyBloodGlucose({
      gds: latest.glucoseMgDl,
      sampleType: 'capillary',
      hasClassicSymptoms:
        symptoms.signals.includes('polyuria') ||
        symptoms.signals.includes('kussmaul_breathing'),
    })
    pushFact(facts, 'glucose_category', glucose.category, ['classifiers'])
  }

  pushFact(
    facts,
    'news2_risk',
    news2.riskLevel,
    ['news2'],
  )
  pushFact(
    facts,
    'screening_gate_count',
    screeningAlerts.length,
    ['screening-gates'],
  )
  pushFact(
    facts,
    'early_warning_count',
    earlyWarnings.length,
    ['early-warning'],
  )
  pushFact(
    facts,
    'pattern_alert_count',
    patternAlerts.length,
    ['clinical-patterns'],
  )
  pushFact(
    facts,
    'trajectory_direction',
    trajectoryDirectionFromAnalysis(trajectory),
    ['trajectory'],
  )
  pushFact(
    facts,
    'trajectory_momentum',
    trajectoryMomentumFromAnalysis(trajectory),
    ['trajectory'],
  )
  pushFact(
    facts,
    'composite_alert_count',
    composite.compositeAlerts.length,
    ['composite-deterioration'],
  )
  pushFact(
    facts,
    'pe_suspect',
    pe.suspect,
    ['pe-suspect'],
  )
  pushFact(
    facts,
    'anaphylaxis_suspect',
    anaphylaxis.suspect,
    ['anaphylaxis'],
  )

  return {
    facts,
    snapshot,
    screeningAlerts,
    patternAlerts,
    peSuspect: pe,
    anaphylaxis,
    news2,
    earlyWarnings,
    composite,
    trajectory,
  }
}
