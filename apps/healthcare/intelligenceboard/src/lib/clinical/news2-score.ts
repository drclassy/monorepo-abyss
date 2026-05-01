import type { ClinicalConsciousnessLevel, ClinicalTrajectoryVitalPoint } from '@the-abyss/shared-types'

// NEWS2 (National Early Warning Score 2) — Royal College of Physicians 2017.
// Scale 1 (standard SpO2) used throughout — no hypercapnic/COPD flag available in legacy pipeline.
// O2 supplement score is always 0 — no device data in VisitRecord.

function scoreRR(rr: number): number {
  if (rr <= 8)  return 3
  if (rr <= 11) return 1
  if (rr <= 20) return 0
  if (rr <= 24) return 2
  return 3
}

// Scale 1: standard target saturation (not COPD/hypercapnic).
function scoreSpo2(spo2: number): number {
  if (spo2 <= 91) return 3
  if (spo2 <= 93) return 2
  if (spo2 <= 95) return 1
  return 0
}

function scoreSBP(sbp: number): number {
  if (sbp <= 90)  return 3
  if (sbp <= 100) return 2
  if (sbp <= 110) return 1
  if (sbp <= 219) return 0
  return 3
}

function scoreHR(hr: number): number {
  if (hr <= 40)  return 3
  if (hr <= 50)  return 1
  if (hr <= 90)  return 0
  if (hr <= 110) return 1
  if (hr <= 130) return 2
  return 3
}

function scoreTemp(temp: number): number {
  if (temp <= 35.0) return 3
  if (temp <= 36.0) return 1
  if (temp <= 38.0) return 0
  if (temp <= 39.0) return 1
  return 2
}

// Any ACVPU ≠ A = 3 points. 'unknown' defaults to 0 (alert assumed — no data).
function scoreConsciousness(level: ClinicalConsciousnessLevel | undefined): number {
  if (!level || level === 'alert' || level === 'unknown') return 0
  return 3
}

/**
 * Computes a NEWS2 total score (0–20) from a CT v1 vital point.
 *
 * Returns `undefined` if any required vital (rr, spo2, sbp, hr, temp) is absent.
 * O2 supplement is always scored 0 — no device data available.
 * SpO2 Scale 1 used — no hypercapnic risk indicator in legacy pipeline.
 */
export function computeNEWS2(vital: ClinicalTrajectoryVitalPoint): number | undefined {
  if (
    vital.rr   == null ||
    vital.spo2 == null ||
    vital.sbp  == null ||
    vital.hr   == null ||
    vital.temp == null
  ) {
    return undefined
  }
  return (
    scoreRR(vital.rr) +
    scoreSpo2(vital.spo2) +
    0 + // O2 supplement — assumed breathing air (no device data)
    scoreSBP(vital.sbp) +
    scoreHR(vital.hr) +
    scoreConsciousness(vital.consciousness) +
    scoreTemp(vital.temp)
  )
}
