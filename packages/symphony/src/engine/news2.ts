// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyAlert, SymphonyVitalsInput } from '../contracts'

export type SymphonyNEWS2RiskLevel = 'low' | 'low_medium' | 'medium' | 'high'

export interface SymphonyNEWS2ParameterScore {
  parameter: string
  value: number | string | boolean | undefined
  score: number
  unit: string
}

export interface SymphonyNEWS2Input {
  vitals?: SymphonyVitalsInput
  hasCOPD?: boolean
}

export interface SymphonyNEWS2Result {
  aggregateScore: number
  riskLevel: SymphonyNEWS2RiskLevel
  parameterScores: SymphonyNEWS2ParameterScore[]
  hasExtremeSingle: boolean
  monitoringRecommendation: string
  clinicalResponse: string
  scoreableParameters: number
}

function scoreRespiratoryRate(rr: number | undefined): SymphonyNEWS2ParameterScore {
  if (rr === undefined)
    return { parameter: 'respiratory_rate', value: undefined, score: 0, unit: 'x/mnt' }
  let score = 0
  if (rr <= 8) score = 3
  else if (rr <= 11) score = 1
  else if (rr <= 20) score = 0
  else if (rr <= 24) score = 2
  else score = 3
  return { parameter: 'respiratory_rate', value: rr, score, unit: 'x/mnt' }
}

function scoreSpO2Scale1(spo2: number | undefined): SymphonyNEWS2ParameterScore {
  if (spo2 === undefined) return { parameter: 'spo2', value: undefined, score: 0, unit: '%' }
  let score = 0
  if (spo2 <= 91) score = 3
  else if (spo2 <= 93) score = 2
  else if (spo2 <= 95) score = 1
  else score = 0
  return { parameter: 'spo2', value: spo2, score, unit: '%' }
}

function scoreSpO2Scale2(spo2: number | undefined): SymphonyNEWS2ParameterScore {
  if (spo2 === undefined)
    return { parameter: 'spo2_scale2', value: undefined, score: 0, unit: '%' }
  let score = 0
  if (spo2 <= 83) score = 3
  else if (spo2 <= 85) score = 2
  else if (spo2 <= 87) score = 1
  else if (spo2 <= 92) score = 0
  else if (spo2 <= 94) score = 1
  else if (spo2 <= 96) score = 2
  else score = 3
  return { parameter: 'spo2_scale2', value: spo2, score, unit: '%' }
}

function scoreSystolic(systolic: number | undefined): SymphonyNEWS2ParameterScore {
  if (systolic === undefined)
    return { parameter: 'systolic', value: undefined, score: 0, unit: 'mmHg' }
  let score = 0
  if (systolic <= 90) score = 3
  else if (systolic <= 100) score = 2
  else if (systolic <= 110) score = 1
  else if (systolic <= 219) score = 0
  else score = 3
  return { parameter: 'systolic', value: systolic, score, unit: 'mmHg' }
}

function scoreHeartRate(hr: number | undefined): SymphonyNEWS2ParameterScore {
  if (hr === undefined)
    return { parameter: 'heart_rate', value: undefined, score: 0, unit: 'bpm' }
  let score = 0
  if (hr <= 40) score = 3
  else if (hr <= 50) score = 1
  else if (hr <= 90) score = 0
  else if (hr <= 110) score = 1
  else if (hr <= 130) score = 2
  else score = 3
  return { parameter: 'heart_rate', value: hr, score, unit: 'bpm' }
}

function scoreTemperature(temp: number | undefined): SymphonyNEWS2ParameterScore {
  if (temp === undefined)
    return { parameter: 'temperature', value: undefined, score: 0, unit: 'C' }
  let score = 0
  if (temp <= 35.0) score = 3
  else if (temp <= 36.0) score = 1
  else if (temp <= 38.0) score = 0
  else if (temp <= 39.0) score = 1
  else score = 2
  return { parameter: 'temperature', value: temp, score, unit: 'C' }
}

function scoreConsciousness(
  consciousness: SymphonyVitalsInput['consciousness']
): SymphonyNEWS2ParameterScore {
  if (consciousness === undefined)
    return { parameter: 'consciousness', value: undefined, score: 0, unit: 'AVPU' }
  const score = consciousness === 'alert' ? 0 : 3
  return { parameter: 'consciousness', value: consciousness, score, unit: 'AVPU' }
}

function scoreSupplementalO2(onO2: boolean | undefined): SymphonyNEWS2ParameterScore {
  if (onO2 === undefined)
    return { parameter: 'supplemental_o2', value: undefined, score: 0, unit: '' }
  return { parameter: 'supplemental_o2', value: onO2 ? 'Yes' : 'No', score: onO2 ? 2 : 0, unit: '' }
}

function determineRiskLevel(
  aggregateScore: number,
  hasExtremeSingle: boolean
): SymphonyNEWS2RiskLevel {
  if (aggregateScore >= 7) return 'high'
  if (aggregateScore >= 5) return 'medium'
  if (hasExtremeSingle) return 'low_medium'
  return 'low'
}

function getMonitoringRecommendation(risk: SymphonyNEWS2RiskLevel): string {
  switch (risk) {
    case 'high':
      return 'Monitoring vital signs kontinu. Pertimbangkan rujuk ke fasilitas dengan ICU.'
    case 'medium':
      return 'Monitoring vital signs tiap 1 jam. Review urgent oleh dokter.'
    case 'low_medium':
      return 'Monitoring vital signs tiap 1 jam. Review oleh dokter untuk tentukan eskalasi.'
    case 'low':
      return 'Monitoring vital signs tiap 4-6 jam.'
  }
}

function getClinicalResponse(risk: SymphonyNEWS2RiskLevel): string {
  switch (risk) {
    case 'high':
      return 'Asesmen emergensi oleh tim klinis. Pertimbangkan transfer ke level perawatan lebih tinggi.'
    case 'medium':
      return 'Review urgent oleh dokter atau perawat senior. Evaluasi apakah perlu critical care.'
    case 'low_medium':
      return 'Review urgent oleh dokter. Tentukan penyebab dan putuskan perubahan monitoring atau eskalasi.'
    case 'low':
      return 'Asesmen oleh perawat. Putuskan perubahan frekuensi monitoring jika diperlukan.'
  }
}

export function calculateSymphonyNEWS2(input: SymphonyNEWS2Input): SymphonyNEWS2Result {
  const vitals = input.vitals

  if (!vitals) {
    return {
      aggregateScore: 0,
      riskLevel: 'low',
      parameterScores: [],
      hasExtremeSingle: false,
      monitoringRecommendation: 'Tanda vital belum tersedia. Lengkapi pengukuran vital signs.',
      clinicalResponse: 'Tidak dapat menilai risiko tanpa data tanda vital.',
      scoreableParameters: 0,
    }
  }

  const spo2Score = input.hasCOPD
    ? scoreSpO2Scale2(vitals.spo2)
    : scoreSpO2Scale1(vitals.spo2)

  const parameterScores = [
    scoreRespiratoryRate(vitals.respiratoryRate),
    spo2Score,
    scoreSystolic(vitals.systolicBp),
    scoreHeartRate(vitals.heartRate),
    scoreTemperature(vitals.temperatureC),
    scoreConsciousness(vitals.consciousness),
    scoreSupplementalO2(vitals.oxygenSupplement),
  ]

  const scoreable = parameterScores.filter(parameter => parameter.value !== undefined)
  const aggregateScore = parameterScores.reduce((sum, parameter) => sum + parameter.score, 0)
  const hasExtremeSingle = parameterScores.some(parameter => parameter.score === 3)
  const riskLevel = determineRiskLevel(aggregateScore, hasExtremeSingle)

  return {
    aggregateScore,
    riskLevel,
    parameterScores: scoreable,
    hasExtremeSingle,
    monitoringRecommendation: getMonitoringRecommendation(riskLevel),
    clinicalResponse: getClinicalResponse(riskLevel),
    scoreableParameters: scoreable.length,
  }
}

export function news2ToSymphonyAlerts(
  result: SymphonyNEWS2Result,
  triggeredAt: string
): SymphonyAlert[] {
  if (result.riskLevel === 'low' || result.scoreableParameters < 2) return []

  const severity =
    result.riskLevel === 'high' ? 'critical' : result.riskLevel === 'medium' ? 'high' : 'warning'
  const abnormalParams = result.parameterScores
    .filter(parameter => parameter.score > 0)
    .map(parameter => `${parameter.parameter}: ${parameter.value} ${parameter.unit} (skor ${parameter.score})`)

  return [
    {
      id: `symphony-news2-${result.riskLevel}`,
      severity,
      title: `NEWS2 Skor ${result.aggregateScore}`,
      reasoning: [
        `Aggregate NEWS2: ${result.aggregateScore}`,
        `Risiko: ${result.riskLevel}`,
        `Parameter abnormal: ${abnormalParams.join(', ') || 'tidak ada'}`,
        result.monitoringRecommendation,
        result.clinicalResponse,
      ],
      source: 'news2',
      acknowledged: false,
      triggeredAt,
    },
  ]
}
