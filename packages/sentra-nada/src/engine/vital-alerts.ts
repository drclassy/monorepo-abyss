// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyAlert, SymphonyVitalsInput } from '../contracts'

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
    source: 'vitals',
    acknowledged: false,
    triggeredAt,
  }
}

export function evaluateSymphonyVitalAlerts(vitals: SymphonyVitalsInput | undefined): SymphonyAlert[] {
  if (!vitals) return []

  const triggeredAt = vitals.observedAt
  const alerts: SymphonyAlert[] = []

  if (vitals.systolicBp !== undefined && vitals.systolicBp >= 180) {
    alerts.push(
      alert(
        'symphony-vitals-hypertensive-crisis',
        'critical',
        `Hipertensi krisis - SBP ${vitals.systolicBp} mmHg`,
        [
          `Sistolik ${vitals.systolicBp} mmHg >=180.`,
          'Evaluasi target-organ damage dan kebutuhan rujukan emergensi.',
        ],
        triggeredAt
      )
    )
  }

  if (vitals.diastolicBp !== undefined && vitals.diastolicBp >= 120) {
    alerts.push(
      alert(
        'symphony-vitals-diastolic-emergency',
        'critical',
        `Hipertensi emergensi - DBP ${vitals.diastolicBp} mmHg`,
        [
          `Diastolik ${vitals.diastolicBp} mmHg >=120.`,
          'Evaluasi target-organ damage dan jangan turunkan tekanan darah agresif tanpa protokol.',
        ],
        triggeredAt
      )
    )
  }

  if (vitals.spo2 !== undefined && vitals.spo2 < 90) {
    alerts.push(
      alert(
        'symphony-vitals-severe-hypoxemia',
        'critical',
        `Hipoksemia berat - SpO2 ${vitals.spo2}%`,
        [`SpO2 ${vitals.spo2}% <90.`, 'Berikan oksigenasi dan evaluasi kegagalan napas segera.'],
        triggeredAt
      )
    )
  }

  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate < 8) {
    alerts.push(
      alert(
        'symphony-vitals-respiratory-depression',
        'critical',
        `Depresi napas - RR ${vitals.respiratoryRate}/menit`,
        [
          `Frekuensi napas ${vitals.respiratoryRate}/menit <8.`,
          'Siapkan airway support dan rujukan emergensi.',
        ],
        triggeredAt
      )
    )
  }

  if (vitals.heartRate !== undefined && vitals.heartRate > 140) {
    alerts.push(
      alert(
        'symphony-vitals-severe-tachycardia',
        'high',
        `Takikardia berat - HR ${vitals.heartRate} bpm`,
        [`Denyut jantung ${vitals.heartRate} bpm >140.`, 'Cari syok, hipoksia, demam, nyeri, atau dehidrasi.'],
        triggeredAt
      )
    )
  }

  if (vitals.heartRate !== undefined && vitals.heartRate < 45) {
    alerts.push(
      alert(
        'symphony-vitals-severe-bradycardia',
        'high',
        `Bradikardia berat - HR ${vitals.heartRate} bpm`,
        [`Denyut jantung ${vitals.heartRate} bpm <45.`, 'Evaluasi perfusi, EKG, obat, dan hipotermia.'],
        triggeredAt
      )
    )
  }

  if (vitals.temperatureC !== undefined && vitals.temperatureC >= 40) {
    alerts.push(
      alert(
        'symphony-vitals-hyperpyrexia',
        'high',
        `Hiperpireksia - ${vitals.temperatureC}C`,
        [`Suhu ${vitals.temperatureC}C >=40.`, 'Evaluasi sepsis, heat illness, dan hidrasi.'],
        triggeredAt
      )
    )
  }

  if (vitals.temperatureC !== undefined && vitals.temperatureC < 35) {
    alerts.push(
      alert(
        'symphony-vitals-hypothermia',
        'high',
        `Hipotermia - ${vitals.temperatureC}C`,
        [`Suhu ${vitals.temperatureC}C <35.`, 'Evaluasi sepsis, paparan dingin, dan gangguan metabolik.'],
        triggeredAt
      )
    )
  }

  return alerts
}
