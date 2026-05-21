// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyAlert, SymphonyVitalsInput } from '../contracts'

export type SymphonyCompositeAlertSeverity = 'critical' | 'high' | 'warning'
export type SymphonyCompositeAlertConfidence = 'high' | 'medium' | 'low'
export type SymphonyCompositeAlertBucket = 'composite_alert' | 'watcher'

export type SymphonyCompositeSyndromeId =
  | 'sepsis_shock_pathway'
  | 'respiratory_deterioration'
  | 'neuro_intracranial_pathway'
  | 'silent_bleed_occult_shock'

export interface SymphonyCompositeDelta {
  valueDelta?: number
  percentDelta?: number
  baselineValue?: number
  baselineWindowMinutes?: number
  sampleCount?: number
  source: 'encounter_window' | 'personal_baseline' | 'none'
}

export interface SymphonyCompositeDerivedMetrics {
  map?: number
  pulsePressure?: number
  shockIndex?: number
  modifiedShockIndex?: number
  deltas: {
    heartRate: SymphonyCompositeDelta
    spo2: SymphonyCompositeDelta
    systolicBp: SymphonyCompositeDelta
    pulsePressure: SymphonyCompositeDelta
  }
}

export interface SymphonyCompositeAlert {
  id: string
  syndrome: SymphonyCompositeSyndromeId
  bucket: SymphonyCompositeAlertBucket
  severity: SymphonyCompositeAlertSeverity
  confidence: SymphonyCompositeAlertConfidence
  title: string
  summary: string
  rationale: string
  evidence: string[]
  recommendedActions: string[]
  triggeredAt: string
  suppressionKey: string
}

export interface SymphonyCompositeEncounterBaseline {
  computedAt: string
  windowMinutes: number
  measurements: SymphonyVitalsInput[]
}

export interface SymphonyCompositePersonalBaseline {
  computedAt: string
  visitCount: number
  params: {
    heartRate?: { mean?: number; median?: number }
    systolicBp?: { mean?: number; median?: number }
    diastolicBp?: { mean?: number; median?: number }
    respiratoryRate?: { mean?: number; median?: number }
    temperatureC?: { mean?: number; median?: number }
    spo2?: { mean?: number; median?: number }
    glucoseMgDl?: { mean?: number; median?: number }
  }
}

export interface SymphonyCompositeStructuredSigns {
  respiratoryDistress?: {
    accessoryMuscleUse?: boolean
    retractions?: boolean
    unableToSpeakFullSentences?: boolean
    cyanosis?: boolean
    distressObserved?: boolean
  }
  perfusionShock?: {
    dizziness?: boolean
    presyncope?: boolean
    syncope?: boolean
    weakness?: boolean
    clammySkin?: boolean
    coldExtremities?: boolean
    oliguria?: boolean
  }
  hmod?: {
    neurologicalDeficit?: boolean
    visionChanges?: boolean
    severeHeadache?: boolean
    alteredMentalStatus?: boolean
  }
}

export interface SymphonyCompositeDeteriorationInput {
  current?: SymphonyVitalsInput
  encounterBaseline?: SymphonyCompositeEncounterBaseline
  personalBaseline?: SymphonyCompositePersonalBaseline
  hasCOPD?: boolean
  structuredSigns?: SymphonyCompositeStructuredSigns
}

export interface SymphonyCompositeWeightedScore {
  parameter:
    | 'respiratory_rate'
    | 'spo2'
    | 'heart_rate'
    | 'systolic_bp'
    | 'temperature'
    | 'consciousness'
    | 'shock_index'
  score: number
  reason: string
}

export interface SymphonyCompositeDataCompleteness {
  requiredSignalsPresent: string[]
  missingSignals: string[]
  encounterTrendAvailable: boolean
  personalBaselineAvailable: boolean
}

export interface SymphonyCompositeDeteriorationResult {
  derived: SymphonyCompositeDerivedMetrics
  weightedScores: SymphonyCompositeWeightedScore[]
  compositeAlerts: SymphonyCompositeAlert[]
  watchers: SymphonyCompositeAlert[]
  dataCompleteness: SymphonyCompositeDataCompleteness
}

const EMPTY_DELTAS: SymphonyCompositeDerivedMetrics['deltas'] = {
  heartRate: { source: 'none' },
  spo2: { source: 'none' },
  systolicBp: { source: 'none' },
  pulsePressure: { source: 'none' },
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function finitePositive(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0
}

function calculateMap(systolicBp: number, diastolicBp: number): number {
  return round(diastolicBp + (systolicBp - diastolicBp) / 3, 1)
}

function buildDelta(
  currentValue: number | undefined,
  baselineValue: number | undefined,
  source: SymphonyCompositeDelta['source'],
  baselineWindowMinutes?: number,
  sampleCount?: number
): SymphonyCompositeDelta {
  if (!finitePositive(currentValue) || !finitePositive(baselineValue)) return { source: 'none' }

  const valueDelta = round(currentValue - baselineValue, 2)
  return {
    valueDelta,
    percentDelta: round((valueDelta / baselineValue) * 100, 1),
    baselineValue: round(baselineValue, 2),
    baselineWindowMinutes,
    sampleCount,
    source,
  }
}

function encounterAverage(
  baseline: SymphonyCompositeEncounterBaseline | undefined,
  key: keyof SymphonyVitalsInput
): number | undefined {
  if (!baseline) return undefined
  return average(
    baseline.measurements
      .map(measurement => measurement[key])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  )
}

function encounterPulsePressureAverage(
  baseline: SymphonyCompositeEncounterBaseline | undefined
): number | undefined {
  if (!baseline) return undefined
  return average(
    baseline.measurements
      .map(measurement => {
        if (!finitePositive(measurement.systolicBp) || !finitePositive(measurement.diastolicBp)) {
          return undefined
        }
        return measurement.systolicBp - measurement.diastolicBp
      })
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  )
}

function buildDerivedMetrics(
  input: SymphonyCompositeDeteriorationInput
): SymphonyCompositeDerivedMetrics {
  const current = input.current
  if (!current) {
    return {
      deltas: EMPTY_DELTAS,
    }
  }

  const map =
    finitePositive(current.systolicBp) && finitePositive(current.diastolicBp)
      ? calculateMap(current.systolicBp, current.diastolicBp)
      : undefined
  const pulsePressure =
    finitePositive(current.systolicBp) && finitePositive(current.diastolicBp)
      ? round(current.systolicBp - current.diastolicBp, 1)
      : undefined
  const shockIndex =
    finitePositive(current.systolicBp) && finitePositive(current.heartRate)
      ? round(current.heartRate / current.systolicBp, 2)
      : undefined
  const modifiedShockIndex =
    finitePositive(map) && finitePositive(current.heartRate)
      ? round(current.heartRate / map, 2)
      : undefined

  const encounterSampleCount = input.encounterBaseline?.measurements.length
  const encounterHrBaseline = encounterAverage(input.encounterBaseline, 'heartRate')
  const encounterSpo2Baseline = encounterAverage(input.encounterBaseline, 'spo2')
  const encounterSbpBaseline = encounterAverage(input.encounterBaseline, 'systolicBp')
  const encounterPulseBaseline = encounterPulsePressureAverage(input.encounterBaseline)
  const personalHrBaseline =
    input.personalBaseline?.params.heartRate?.mean ?? input.personalBaseline?.params.heartRate?.median
  const personalSbpBaseline =
    input.personalBaseline?.params.systolicBp?.mean ?? input.personalBaseline?.params.systolicBp?.median

  return {
    map,
    pulsePressure,
    shockIndex,
    modifiedShockIndex,
    deltas: {
      heartRate: buildDelta(
        current.heartRate,
        encounterHrBaseline ?? personalHrBaseline,
        encounterHrBaseline !== undefined
          ? 'encounter_window'
          : personalHrBaseline !== undefined
            ? 'personal_baseline'
            : 'none',
        input.encounterBaseline?.windowMinutes,
        encounterSampleCount
      ),
      spo2: buildDelta(
        current.spo2,
        encounterSpo2Baseline,
        encounterSpo2Baseline !== undefined ? 'encounter_window' : 'none',
        input.encounterBaseline?.windowMinutes,
        encounterSampleCount
      ),
      systolicBp: buildDelta(
        current.systolicBp,
        encounterSbpBaseline ?? personalSbpBaseline,
        encounterSbpBaseline !== undefined
          ? 'encounter_window'
          : personalSbpBaseline !== undefined
            ? 'personal_baseline'
            : 'none',
        input.encounterBaseline?.windowMinutes,
        encounterSampleCount
      ),
      pulsePressure: buildDelta(
        pulsePressure,
        encounterPulseBaseline,
        encounterPulseBaseline !== undefined ? 'encounter_window' : 'none',
        input.encounterBaseline?.windowMinutes,
        encounterSampleCount
      ),
    },
  }
}

function isAltered(consciousness: SymphonyVitalsInput['consciousness']): boolean {
  return consciousness !== undefined && consciousness !== 'alert' && consciousness !== 'unknown'
}

function hasRespiratorySigns(signs: SymphonyCompositeStructuredSigns | undefined): boolean {
  return Boolean(
    signs?.respiratoryDistress?.accessoryMuscleUse ||
      signs?.respiratoryDistress?.retractions ||
      signs?.respiratoryDistress?.unableToSpeakFullSentences ||
      signs?.respiratoryDistress?.cyanosis ||
      signs?.respiratoryDistress?.distressObserved
  )
}

function hasPerfusionSigns(signs: SymphonyCompositeStructuredSigns | undefined): boolean {
  return Boolean(
    signs?.perfusionShock?.dizziness ||
      signs?.perfusionShock?.presyncope ||
      signs?.perfusionShock?.syncope ||
      signs?.perfusionShock?.weakness ||
      signs?.perfusionShock?.clammySkin ||
      signs?.perfusionShock?.coldExtremities ||
      signs?.perfusionShock?.oliguria
  )
}

function hasNeuroSigns(signs: SymphonyCompositeStructuredSigns | undefined): boolean {
  return Boolean(
    signs?.hmod?.neurologicalDeficit ||
      signs?.hmod?.visionChanges ||
      signs?.hmod?.severeHeadache ||
      signs?.hmod?.alteredMentalStatus
  )
}

function appendIfUnique(alerts: SymphonyCompositeAlert[], alert: SymphonyCompositeAlert): void {
  if (alerts.some(existing => existing.id === alert.id)) return
  alerts.push(alert)
}

function createCompositeAlert(params: {
  id: string
  syndrome: SymphonyCompositeSyndromeId
  bucket?: SymphonyCompositeAlertBucket
  severity: SymphonyCompositeAlertSeverity
  confidence: SymphonyCompositeAlertConfidence
  title: string
  summary: string
  rationale: string
  evidence: string[]
  recommendedActions: string[]
  triggeredAt: string
}): SymphonyCompositeAlert {
  const bucket = params.bucket ?? 'composite_alert'
  return {
    id: params.id,
    syndrome: params.syndrome,
    bucket,
    severity: params.severity,
    confidence: params.confidence,
    title: params.title,
    summary: params.summary,
    rationale: params.rationale,
    evidence: params.evidence,
    recommendedActions: params.recommendedActions,
    triggeredAt: params.triggeredAt,
    suppressionKey: `${params.syndrome}:${params.severity}:${params.confidence}`,
  }
}

function scoreWeighted(
  current: SymphonyVitalsInput | undefined,
  derived: SymphonyCompositeDerivedMetrics,
  hasCOPD: boolean | undefined
): SymphonyCompositeWeightedScore[] {
  if (!current) return []
  const scores: Array<SymphonyCompositeWeightedScore | null> = [
    current.respiratoryRate === undefined
      ? null
      : {
          parameter: 'respiratory_rate',
          score: current.respiratoryRate <= 8 || current.respiratoryRate >= 25 ? 3 : current.respiratoryRate > 20 ? 2 : 0,
          reason: `RR ${current.respiratoryRate}/menit`,
        },
    current.spo2 === undefined
      ? null
      : {
          parameter: 'spo2',
          score: hasCOPD && current.spo2 >= 88 && current.spo2 <= 92 ? 0 : current.spo2 <= 91 ? 3 : current.spo2 <= 95 ? 2 : 0,
          reason: `SpO2 ${current.spo2}%`,
        },
    current.heartRate === undefined
      ? null
      : {
          parameter: 'heart_rate',
          score: current.heartRate <= 40 || current.heartRate > 130 ? 3 : current.heartRate > 90 || current.heartRate <= 50 ? 2 : 0,
          reason: `HR ${current.heartRate} bpm`,
        },
    current.systolicBp === undefined
      ? null
      : {
          parameter: 'systolic_bp',
          score: current.systolicBp <= 90 || current.systolicBp > 220 ? 3 : current.systolicBp <= 110 ? 2 : 0,
          reason: `SBP ${current.systolicBp} mmHg`,
        },
    current.temperatureC === undefined
      ? null
      : {
          parameter: 'temperature',
          score: current.temperatureC < 35 || current.temperatureC > 39.1 ? 3 : current.temperatureC < 36.1 || current.temperatureC > 38 ? 2 : 0,
          reason: `Suhu ${current.temperatureC}C`,
        },
    current.consciousness === undefined
      ? null
      : {
          parameter: 'consciousness',
          score: current.consciousness === 'alert' ? 0 : 3,
          reason: `Kesadaran ${current.consciousness}`,
        },
    derived.shockIndex === undefined
      ? null
      : {
          parameter: 'shock_index',
          score: derived.shockIndex > 0.9 ? 3 : derived.shockIndex >= 0.7 ? 2 : 0,
          reason: `Shock Index ${derived.shockIndex}`,
        },
  ]

  return scores.filter((score): score is SymphonyCompositeWeightedScore => score !== null)
}

function buildDataCompleteness(
  input: SymphonyCompositeDeteriorationInput
): SymphonyCompositeDataCompleteness {
  const current = input.current
  const required: Array<keyof SymphonyVitalsInput> = [
    'heartRate',
    'systolicBp',
    'diastolicBp',
    'respiratoryRate',
    'temperatureC',
    'spo2',
    'consciousness',
  ]

  return {
    requiredSignalsPresent: current
      ? required.filter(key => current[key] !== undefined).map(key => String(key))
      : [],
    missingSignals: current ? required.filter(key => current[key] === undefined).map(key => String(key)) : required.map(String),
    encounterTrendAvailable: Boolean(input.encounterBaseline?.measurements.length),
    personalBaselineAvailable: Boolean(input.personalBaseline?.params && Object.keys(input.personalBaseline.params).length),
  }
}

export function evaluateSymphonyCompositeDeterioration(
  input: SymphonyCompositeDeteriorationInput
): SymphonyCompositeDeteriorationResult {
  const current = input.current
  const derived = buildDerivedMetrics(input)
  const weightedScores = scoreWeighted(current, derived, input.hasCOPD)
  const compositeAlerts: SymphonyCompositeAlert[] = []
  const watchers: SymphonyCompositeAlert[] = []

  if (!current) {
    return {
      derived,
      weightedScores,
      compositeAlerts,
      watchers,
      dataCompleteness: buildDataCompleteness(input),
    }
  }

  const triggeredAt = current.observedAt
  const perfusionSigns = hasPerfusionSigns(input.structuredSigns)
  const respiratorySigns = hasRespiratorySigns(input.structuredSigns)
  const neuroSigns = hasNeuroSigns(input.structuredSigns)

  if (
    derived.shockIndex !== undefined &&
    derived.shockIndex > 0.9 &&
    current.temperatureC !== undefined &&
    current.temperatureC > 38.1 &&
    current.respiratoryRate !== undefined &&
    current.respiratoryRate > 20
  ) {
    const severePerfusion =
      (derived.map !== undefined && derived.map < 65) ||
      isAltered(current.consciousness) ||
      (current.capillaryRefillSec ?? 0) > 3 ||
      perfusionSigns
    appendIfUnique(
      compositeAlerts,
      createCompositeAlert({
        id: 'composite-sepsis-shock-pathway',
        syndrome: 'sepsis_shock_pathway',
        severity: severePerfusion ? 'critical' : 'high',
        confidence: severePerfusion ? 'high' : 'medium',
        title: 'SUSPECTED SEPSIS / SHOCK',
        summary: 'Kombinasi shock index tinggi, demam, dan takipnea mengarah ke deteriorasi sepsis/shock.',
        rationale: 'Composite pattern menggabungkan sirkulasi, inflamasi, respirasi, dan perfusi.',
        evidence: [
          `Shock Index ${derived.shockIndex} >0.9`,
          `Suhu ${current.temperatureC}C >38.1`,
          `RR ${current.respiratoryRate}/menit >20`,
          ...(derived.map !== undefined && derived.map < 65 ? [`MAP ${derived.map} mmHg <65`] : []),
          ...((current.capillaryRefillSec ?? 0) > 3 ? [`CRT ${current.capillaryRefillSec} detik >3`] : []),
        ],
        recommendedActions: [
          'Evaluasi perfusi dan sumber infeksi segera.',
          'Pantau serial MAP, HR, RR, dan status mental.',
          'Pertimbangkan eskalasi/rujukan sesuai protokol sepsis.',
        ],
        triggeredAt,
      })
    )
  }

  if (
    derived.deltas.spo2.source === 'encounter_window' &&
    derived.deltas.spo2.valueDelta !== undefined &&
    derived.deltas.spo2.valueDelta <= -3 &&
    current.respiratoryRate !== undefined &&
    current.respiratoryRate > 24
  ) {
    const critical =
      current.oxygenSupplement === true || respiratorySigns || isAltered(current.consciousness)
    appendIfUnique(
      compositeAlerts,
      createCompositeAlert({
        id: 'composite-respiratory-deterioration',
        syndrome: 'respiratory_deterioration',
        severity: critical ? 'critical' : 'high',
        confidence: (derived.deltas.spo2.sampleCount ?? 0) >= 2 ? 'high' : 'medium',
        title: 'IMPENDING RESPIRATORY FAILURE',
        summary: 'Delta SpO2 encounter dan takipnea menunjukkan deteriorasi respirasi.',
        rationale: 'Penurunan saturasi serial lebih bermakna daripada snapshot tunggal.',
        evidence: [
          `Delta SpO2 ${derived.deltas.spo2.valueDelta}% dari baseline ${derived.deltas.spo2.baselineValue}%`,
          `RR ${current.respiratoryRate}/menit >24`,
          ...(current.oxygenSupplement === true ? ['Pasien sudah mendapat oksigen tambahan'] : []),
        ],
        recommendedActions: [
          'Tingkatkan monitoring respirasi dan nilai work of breathing.',
          'Siapkan oksigenasi lanjutan dan eskalasi airway bila memburuk.',
        ],
        triggeredAt,
      })
    )
  } else if (
    current.respiratoryRate !== undefined &&
    current.respiratoryRate > 24 &&
    ((current.spo2 !== undefined && current.spo2 < 94) || respiratorySigns)
  ) {
    appendIfUnique(
      watchers,
      createCompositeAlert({
        id: 'watcher-respiratory-deterioration',
        syndrome: 'respiratory_deterioration',
        bucket: 'watcher',
        severity: 'warning',
        confidence: 'low',
        title: 'RESPIRATORY DETERIORATION WATCH',
        summary: 'Sinyal respirasi memburuk, tetapi baseline 2 jam belum tersedia.',
        rationale: 'Konfirmasi composite respirasi memerlukan delta SpO2 encounter.',
        evidence: [
          `RR ${current.respiratoryRate}/menit >24`,
          ...(current.spo2 !== undefined ? [`SpO2 ${current.spo2}%`] : []),
        ],
        recommendedActions: ['Ulangi SpO2 serial dan pantau tanda distress napas.'],
        triggeredAt,
      })
    )
  }

  if (
    current.systolicBp !== undefined &&
    current.systolicBp > 180 &&
    current.heartRate !== undefined &&
    current.heartRate < 50 &&
    derived.pulsePressure !== undefined &&
    derived.pulsePressure > 60
  ) {
    appendIfUnique(
      compositeAlerts,
      createCompositeAlert({
        id: 'composite-neuro-intracranial',
        syndrome: 'neuro_intracranial_pathway',
        severity: neuroSigns || isAltered(current.consciousness) ? 'critical' : 'high',
        confidence: neuroSigns || isAltered(current.consciousness) ? 'high' : 'medium',
        title: "CUSHING'S TRIAD WARNING",
        summary: 'Hipertensi, bradikardia, dan pulse pressure lebar mengarah ke risiko neuro/intrakranial.',
        rationale: 'Kombinasi ini lebih berisiko daripada hipertensi terisolasi.',
        evidence: [
          `SBP ${current.systolicBp} mmHg >180`,
          `HR ${current.heartRate} bpm <50`,
          `Pulse Pressure ${derived.pulsePressure} mmHg >60`,
        ],
        recommendedActions: ['Nilai defisit neurologis, severe headache, dan perubahan kesadaran.'],
        triggeredAt,
      })
    )
  }

  if (
    derived.deltas.heartRate.percentDelta !== undefined &&
    derived.deltas.heartRate.percentDelta >= 20 &&
    derived.pulsePressure !== undefined &&
    derived.pulsePressure < 30 &&
    current.systolicBp !== undefined &&
    current.systolicBp > 100
  ) {
    const critical = perfusionSigns || (current.capillaryRefillSec ?? 0) > 3
    appendIfUnique(
      compositeAlerts,
      createCompositeAlert({
        id: 'composite-silent-bleed-occult-shock',
        syndrome: 'silent_bleed_occult_shock',
        severity: critical ? 'critical' : 'high',
        confidence: critical ? 'high' : 'medium',
        title: 'SUSPECTED VOLUME DEPLETION / INTERNAL BLEEDING',
        summary: 'Kenaikan HR relatif dan pulse pressure menyempit mengarah ke occult shock.',
        rationale: 'Kenaikan HR relatif sering mendahului penurunan sistolik nyata.',
        evidence: [
          `HR naik ${derived.deltas.heartRate.percentDelta}% dari baseline ${derived.deltas.heartRate.baselineValue}`,
          `Pulse Pressure ${derived.pulsePressure} mmHg <30`,
          `SBP ${current.systolicBp} mmHg masih >100`,
        ],
        recommendedActions: ['Evaluasi deplesi volume/perdarahan dan pantau perfusi serial.'],
        triggeredAt,
      })
    )
  } else if (
    derived.pulsePressure !== undefined &&
    derived.pulsePressure < 30 &&
    current.systolicBp !== undefined &&
    current.systolicBp > 100 &&
    perfusionSigns
  ) {
    appendIfUnique(
      watchers,
      createCompositeAlert({
        id: 'watcher-silent-bleed-occult-shock',
        syndrome: 'silent_bleed_occult_shock',
        bucket: 'watcher',
        severity: 'warning',
        confidence: 'low',
        title: 'OCCULT SHOCK WATCH',
        summary: 'Perfusi memburuk, tetapi baseline HR belum cukup untuk konfirmasi.',
        rationale: 'Silent bleed composite memerlukan delta HR terhadap baseline.',
        evidence: [`Pulse Pressure ${derived.pulsePressure} mmHg <30`],
        recommendedActions: ['Ulangi HR/BP serial dan nilai CRT, akral, presinkop, serta oliguria.'],
        triggeredAt,
      })
    )
  }

  return {
    derived,
    weightedScores,
    compositeAlerts,
    watchers,
    dataCompleteness: buildDataCompleteness(input),
  }
}

function severityToSymphony(severity: SymphonyCompositeAlertSeverity): SymphonyAlert['severity'] {
  return severity === 'warning' ? 'warning' : severity
}

export function compositeDeteriorationToSymphonyAlerts(
  result: SymphonyCompositeDeteriorationResult
): SymphonyAlert[] {
  return [...result.compositeAlerts, ...result.watchers].map(alert => ({
    id: `symphony-${alert.id}`,
    severity: severityToSymphony(alert.severity),
    title: alert.title,
    reasoning: [alert.summary, alert.rationale, ...alert.evidence, ...alert.recommendedActions],
    source: 'composite',
    acknowledged: false,
    triggeredAt: alert.triggeredAt,
  }))
}
