// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyAlert,
  SymphonyPregnancyStatus,
  SymphonySafetyGate,
  SymphonySexAtBirth,
  SymphonyVitalsInput,
} from '../contracts'

export type SymphonyScreeningGate = SymphonySafetyGate

export type SymphonyScreeningVitals = SymphonyVitalsInput & {
  capillaryRefillSec?: number
  ageMonths?: number
}

export interface SymphonyInstantScreeningInput {
  latestVitals?: SymphonyScreeningVitals
  ageYears?: number
  ageMonths?: number
  sexAtBirth?: SymphonySexAtBirth
  pregnancyStatus?: SymphonyPregnancyStatus
  chiefComplaint?: string
  medicalHistory?: string[]
}

interface PediatricBand {
  minMonths: number
  maxMonths: number
  label: string
  sbpLow: number
  hrLow: number
  hrHigh: number
  rrHigh: number
}

const PEDIATRIC_BANDS: PediatricBand[] = [
  {
    minMonths: 0,
    maxMonths: 2,
    label: '0-2 bulan',
    sbpLow: 60,
    hrLow: 100,
    hrHigh: 180,
    rrHigh: 60,
  },
  {
    minMonths: 3,
    maxMonths: 11,
    label: '3-11 bulan',
    sbpLow: 70,
    hrLow: 90,
    hrHigh: 170,
    rrHigh: 50,
  },
  {
    minMonths: 12,
    maxMonths: 47,
    label: '1-3 tahun',
    sbpLow: 90,
    hrLow: 80,
    hrHigh: 125,
    rrHigh: 30,
  },
  {
    minMonths: 48,
    maxMonths: 143,
    label: '4-11 tahun',
    sbpLow: 90,
    hrLow: 70,
    hrHigh: 115,
    rrHigh: 24,
  },
  {
    minMonths: 144,
    maxMonths: 215,
    label: '12-17 tahun',
    sbpLow: 90,
    hrLow: 60,
    hrHigh: 110,
    rrHigh: 22,
  },
]

const SEVERITY_RANK: Record<SymphonyAlert['severity'], number> = {
  critical: 0,
  high: 1,
  warning: 2,
  info: 3,
}

function alert(
  id: string,
  severity: SymphonyAlert['severity'],
  title: string,
  reasoning: string[],
  triggeredAt: string
): SymphonyAlert {
  return {
    id,
    severity,
    title,
    reasoning,
    source: 'safety_gate',
    gate: resolveGateFromAlertId(id),
    acknowledged: false,
    triggeredAt,
  }
}

function resolveGateFromAlertId(id: string): SymphonySafetyGate {
  if (id.includes('glucose')) return 'GATE_3_GLUCOSE'
  if (id.includes('shock')) return 'GATE_4_OCCULT_SHOCK'
  if (id.includes('sepsis')) return 'GATE_5_SEPSIS'
  if (id.includes('respiratory')) return 'GATE_6_RESPIRATORY'
  if (id.includes('pediatric')) return 'GATE_7_PEDIATRIC'
  if (id.includes('obstetric')) return 'GATE_8_OBSTETRIC'
  if (id.includes('hypertensive') || id.includes('hypertension')) return 'GATE_2_HTN'
  return 'GATE_1_VITALS'
}

function calculateMap(systolicBp: number, diastolicBp: number): number {
  return diastolicBp + (systolicBp - diastolicBp) / 3
}

function resolveAgeMonths(input: SymphonyInstantScreeningInput): number | undefined {
  if (input.ageMonths !== undefined) return input.ageMonths
  if (input.latestVitals?.ageMonths !== undefined) return input.latestVitals.ageMonths
  if (input.ageYears !== undefined) return Math.floor(input.ageYears * 12)
  return undefined
}

function findPediatricBand(ageMonths: number | undefined): PediatricBand | undefined {
  if (ageMonths === undefined || ageMonths >= 216) return undefined
  return PEDIATRIC_BANDS.find((band) => ageMonths >= band.minMonths && ageMonths <= band.maxMonths)
}

function isPregnant(input: SymphonyInstantScreeningInput): boolean {
  return input.sexAtBirth === 'female' && input.pregnancyStatus === 'pregnant'
}

export function evaluateSymphonyInstantScreeningGates(
  input: SymphonyInstantScreeningInput
): SymphonyAlert[] {
  const vitals = input.latestVitals
  if (!vitals) return []

  const triggeredAt = vitals.observedAt
  const alerts: SymphonyAlert[] = []

  if (vitals.glucoseMgDl !== undefined) {
    if (vitals.glucoseMgDl < 54) {
      alerts.push(
        alert(
          'symphony-gate-glucose-severe-hypoglycemia',
          'critical',
          `Glukosa sangat rendah - ${vitals.glucoseMgDl} mg/dL`,
          [
            `Glukosa ${vitals.glucoseMgDl} mg/dL <54.`,
            'Tangani hipoglikemia berat dan evaluasi status neurologis segera.',
          ],
          triggeredAt
        )
      )
    } else if (vitals.glucoseMgDl < 70) {
      alerts.push(
        alert(
          'symphony-gate-glucose-hypoglycemia',
          'high',
          `Hipoglikemia - ${vitals.glucoseMgDl} mg/dL`,
          [
            `Glukosa ${vitals.glucoseMgDl} mg/dL <70.`,
            'Berikan koreksi glukosa sesuai protokol klinis.',
          ],
          triggeredAt
        )
      )
    } else if (vitals.glucoseMgDl >= 600) {
      alerts.push(
        alert(
          'symphony-gate-glucose-hyperosmolar-risk',
          'critical',
          `Hiperglikemia krisis - ${vitals.glucoseMgDl} mg/dL`,
          [
            `Glukosa ${vitals.glucoseMgDl} mg/dL >=600.`,
            'Evaluasi HHS/DKA, hidrasi, elektrolit, dan rujukan emergensi.',
          ],
          triggeredAt
        )
      )
    } else if (vitals.glucoseMgDl >= 200) {
      alerts.push(
        alert(
          'symphony-gate-glucose-hyperglycemia',
          'high',
          `Hiperglikemia - ${vitals.glucoseMgDl} mg/dL`,
          [
            `Glukosa ${vitals.glucoseMgDl} mg/dL >=200.`,
            'Korelasikan dengan gejala, keton, hidrasi, dan riwayat diabetes.',
          ],
          triggeredAt
        )
      )
    }
  }

  if (vitals.systolicBp !== undefined && vitals.diastolicBp !== undefined) {
    const map = calculateMap(vitals.systolicBp, vitals.diastolicBp)
    if (map < 65) {
      alerts.push(
        alert(
          'symphony-gate-shock-map-low',
          'critical',
          `MAP rendah - ${Math.round(map)} mmHg`,
          [
            `MAP ${Math.round(map)} mmHg <65 dari BP ${vitals.systolicBp}/${vitals.diastolicBp}.`,
            'Curigai perfusi tidak adekuat; nilai syok, perdarahan, sepsis, dan kebutuhan rujukan.',
          ],
          triggeredAt
        )
      )
    }
  }

  if (vitals.systolicBp !== undefined && vitals.heartRate !== undefined && vitals.systolicBp > 0) {
    const shockIndex = vitals.heartRate / vitals.systolicBp
    if (shockIndex > 1) {
      alerts.push(
        alert(
          'symphony-gate-shock-index',
          shockIndex > 1.2 ? 'critical' : 'high',
          `Shock index tinggi - ${shockIndex.toFixed(2)}`,
          [
            `HR/SBP ${shockIndex.toFixed(2)} >1.0 dari HR ${vitals.heartRate} dan SBP ${vitals.systolicBp}.`,
            'Curigai occult shock meski tekanan darah belum tampak sangat rendah.',
          ],
          triggeredAt
        )
      )
    }
  }

  if (
    vitals.respiratoryRate !== undefined &&
    vitals.systolicBp !== undefined &&
    vitals.consciousness !== undefined
  ) {
    const qsofaScore =
      (vitals.respiratoryRate >= 22 ? 1 : 0) +
      (vitals.systolicBp <= 100 ? 1 : 0) +
      (vitals.consciousness !== 'alert' && vitals.consciousness !== 'unknown' ? 1 : 0)

    if (qsofaScore >= 2) {
      alerts.push(
        alert(
          'symphony-gate-sepsis-qsofa',
          'critical',
          `Risiko sepsis qSOFA - ${qsofaScore}/3`,
          [
            `qSOFA ${qsofaScore}/3 berdasarkan RR, SBP, dan kesadaran.`,
            'Aktifkan evaluasi sepsis dan cari sumber infeksi tanpa menunggu semua data lengkap.',
          ],
          triggeredAt
        )
      )
    }
  }

  if (vitals.spo2 !== undefined && vitals.spo2 < 90) {
    alerts.push(
      alert(
        'symphony-gate-respiratory-severe-hypoxemia',
        'critical',
        `Hipoksemia berat - SpO2 ${vitals.spo2}%`,
        [`SpO2 ${vitals.spo2}% <90.`, 'Berikan oksigenasi dan nilai kegagalan napas segera.'],
        triggeredAt
      )
    )
  } else if (vitals.spo2 !== undefined && vitals.spo2 < 94) {
    alerts.push(
      alert(
        'symphony-gate-respiratory-hypoxemia',
        'high',
        `Hipoksemia - SpO2 ${vitals.spo2}%`,
        [
          `SpO2 ${vitals.spo2}% <94.`,
          'Nilai kerja napas, oksigenasi, dan kebutuhan eskalasi klinis.',
        ],
        triggeredAt
      )
    )
  }

  if (vitals.spo2 !== undefined && vitals.oxygenSupplement === true && vitals.spo2 < 94) {
    alerts.push(
      alert(
        'symphony-gate-respiratory-low-spo2-on-oxygen',
        'critical',
        `SpO2 rendah dengan oksigen - ${vitals.spo2}%`,
        [
          `SpO2 ${vitals.spo2}% tetap <94 meski memakai oksigen.`,
          'Curigai gagal napas atau kebutuhan dukungan oksigen lanjutan.',
        ],
        triggeredAt
      )
    )
  }

  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate < 8) {
    alerts.push(
      alert(
        'symphony-gate-respiratory-depression',
        'critical',
        `Depresi napas - RR ${vitals.respiratoryRate}/menit`,
        [
          `Frekuensi napas ${vitals.respiratoryRate}/menit <8.`,
          'Siapkan airway support dan eskalasi emergensi.',
        ],
        triggeredAt
      )
    )
  } else if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 22) {
    alerts.push(
      alert(
        'symphony-gate-respiratory-tachypnea',
        'high',
        `Takipnea - RR ${vitals.respiratoryRate}/menit`,
        [
          `Frekuensi napas ${vitals.respiratoryRate}/menit >22.`,
          'Cari distress napas, sepsis, pneumonia, asma, nyeri, atau asidosis metabolik.',
        ],
        triggeredAt
      )
    )
  }

  const pediatricBand = findPediatricBand(resolveAgeMonths(input))
  if (pediatricBand) {
    if (vitals.systolicBp !== undefined && vitals.systolicBp < pediatricBand.sbpLow) {
      alerts.push(
        alert(
          'symphony-gate-pediatric-sbp-low',
          'critical',
          `Tekanan sistolik pediatrik rendah - ${vitals.systolicBp} mmHg`,
          [
            `SBP ${vitals.systolicBp} mmHg <${pediatricBand.sbpLow} untuk usia ${pediatricBand.label}.`,
            'Nilai syok pediatrik, perfusi perifer, dehidrasi, dan kebutuhan rujukan.',
          ],
          triggeredAt
        )
      )
    }

    if (
      vitals.heartRate !== undefined &&
      (vitals.heartRate < pediatricBand.hrLow || vitals.heartRate > pediatricBand.hrHigh)
    ) {
      alerts.push(
        alert(
          'symphony-gate-pediatric-hr',
          vitals.heartRate > pediatricBand.hrHigh ? 'high' : 'critical',
          `Denyut jantung pediatrik abnormal - ${vitals.heartRate} bpm`,
          [
            `HR ${vitals.heartRate} bpm di luar batas ${pediatricBand.hrLow}-${pediatricBand.hrHigh} untuk usia ${pediatricBand.label}.`,
            'Korelasikan dengan demam, nyeri, hipoksia, dehidrasi, obat, dan perfusi.',
          ],
          triggeredAt
        )
      )
    }

    if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > pediatricBand.rrHigh) {
      alerts.push(
        alert(
          'symphony-gate-pediatric-rr',
          'high',
          `Napas pediatrik cepat - RR ${vitals.respiratoryRate}/menit`,
          [
            `RR ${vitals.respiratoryRate}/menit >${pediatricBand.rrHigh} untuk usia ${pediatricBand.label}.`,
            'Cari pneumonia, bronkiolitis, asma, sepsis, nyeri, atau asidosis metabolik.',
          ],
          triggeredAt
        )
      )
    }
  }

  if (isPregnant(input)) {
    if (
      (vitals.systolicBp !== undefined && vitals.systolicBp >= 160) ||
      (vitals.diastolicBp !== undefined && vitals.diastolicBp >= 110)
    ) {
      alerts.push(
        alert(
          'symphony-gate-obstetric-severe-hypertension',
          'critical',
          `Hipertensi obstetrik berat - ${vitals.systolicBp ?? '-'} / ${vitals.diastolicBp ?? '-'} mmHg`,
          [
            'SBP >=160 atau DBP >=110 pada pasien hamil.',
            'Curigai preeklamsia berat; nilai gejala neurologis, proteinuria, dan kebutuhan rujukan emergensi.',
          ],
          triggeredAt
        )
      )
    }

    if (vitals.heartRate !== undefined && vitals.heartRate > 120) {
      alerts.push(
        alert(
          'symphony-gate-obstetric-tachycardia',
          'high',
          `Takikardia obstetrik - HR ${vitals.heartRate} bpm`,
          [
            `HR ${vitals.heartRate} bpm >120 pada pasien hamil.`,
            'Cari perdarahan, sepsis, dehidrasi, emboli, anemia, nyeri, atau hipoksia.',
          ],
          triggeredAt
        )
      )
    }

    if (vitals.systolicBp !== undefined && vitals.systolicBp < 90) {
      alerts.push(
        alert(
          'symphony-gate-obstetric-hypotension',
          'critical',
          `Hipotensi obstetrik - SBP ${vitals.systolicBp} mmHg`,
          [
            `SBP ${vitals.systolicBp} mmHg <90 pada pasien hamil.`,
            'Curigai perdarahan, sepsis, emboli, atau dehidrasi berat.',
          ],
          triggeredAt
        )
      )
    }
  }

  return alerts.sort((left, right) => {
    const severityDelta = SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity]
    if (severityDelta !== 0) return severityDelta
    return left.title.localeCompare(right.title)
  })
}
