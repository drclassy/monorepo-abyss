import type { SymphonyAlert, SymphonyVitalsInput } from '../contracts'

import type { SymphonyNEWS2Result } from './news2'

export interface SymphonyEarlyWarningInput {
  latestVitals?: SymphonyVitalsInput
  news2: SymphonyNEWS2Result
  chiefComplaint?: string
  additionalComplaint?: string
  medicalHistory?: string[]
  ageYears?: number
  sexAtBirth?: 'female' | 'male' | 'intersex' | 'unknown'
  pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown' | 'not_applicable'
}

export interface SymphonyEarlyWarningMatch {
  patternId: string
  patternName: string
  severity: SymphonyAlert['severity']
  condition: string
  action: string
  criteriaMet: string[]
  icdCodes: string[]
  leadTime: string
  clinicalBasis: string
}

function clinicalText(input: SymphonyEarlyWarningInput): string {
  return [input.chiefComplaint, input.additionalComplaint, ...(input.medicalHistory ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function isAlteredConsciousness(value: SymphonyVitalsInput['consciousness']): boolean {
  return value !== undefined && value !== 'alert' && value !== 'unknown'
}

function match(
  patternId: string,
  patternName: string,
  severity: SymphonyAlert['severity'],
  condition: string,
  action: string,
  criteriaMet: string[],
  icdCodes: string[],
  leadTime: string,
  clinicalBasis: string
): SymphonyEarlyWarningMatch {
  return {
    patternId,
    patternName,
    severity,
    condition,
    action,
    criteriaMet,
    icdCodes,
    leadTime,
    clinicalBasis,
  }
}

function checkDengueShockPattern(
  input: SymphonyEarlyWarningInput,
  v: SymphonyVitalsInput,
  text: string
): SymphonyEarlyWarningMatch | null {
  if (!/dengue|dbd|demam berdarah|trombosit|peteki/i.test(text)) return null

  const tempDropping = v.temperatureC !== undefined && v.temperatureC >= 35.5 && v.temperatureC <= 37.5
  const tachycardia = v.heartRate !== undefined && v.heartRate > 100
  const hypotension = v.systolicBp !== undefined && v.systolicBp < 100
  const narrowPulsePressure =
    v.systolicBp !== undefined &&
    v.diastolicBp !== undefined &&
    v.systolicBp - v.diastolicBp <= 20

  if (tempDropping && tachycardia && (hypotension || narrowPulsePressure)) {
    return match(
      'DHF_SHOCK_IMMINENT',
      'Dengue Shock Syndrome - Imminent',
      'critical',
      'Suspek fase kritis DHF - syok dengue iminen',
      'Resusitasi cairan sesuai protokol, monitoring ketat, dan siapkan rujukan emergensi.',
      [
        `Suhu turun ke ${v.temperatureC}C`,
        `Takikardia ${v.heartRate} bpm`,
        hypotension ? `Sistolik ${v.systolicBp} mmHg <100` : '',
        narrowPulsePressure && v.systolicBp !== undefined && v.diastolicBp !== undefined
          ? `Tekanan nadi ${v.systolicBp - v.diastolicBp} mmHg <=20`
          : '',
        'Konteks klinis dengue',
      ].filter(Boolean),
      ['A91'],
      '2-6 jam sebelum syok dengue manifest',
      'WHO dengue warning-sign pathway; Dashboard parity pattern.',
    )
  }

  if (tempDropping && tachycardia) {
    return match(
      'DHF_WARNING',
      'Dengue - Warning Phase Kritis',
      'high',
      'Warning fase kritis DHF mungkin dimulai',
      'Tingkatkan monitoring, siapkan akses IV, dan pantau balance cairan.',
      [`Suhu turun ke ${v.temperatureC}C`, `Takikardia ${v.heartRate} bpm`, 'Konteks dengue'],
      ['A91'],
      '6-12 jam sebelum kemungkinan syok',
      'WHO dengue warning-sign pathway; Dashboard parity pattern.',
    )
  }

  return null
}

function checkSepsisPattern(
  input: SymphonyEarlyWarningInput,
  v: SymphonyVitalsInput,
  text: string
): SymphonyEarlyWarningMatch | null {
  const qsofaCriteria: string[] = []
  if (v.respiratoryRate !== undefined && v.respiratoryRate >= 22) {
    qsofaCriteria.push(`RR ${v.respiratoryRate}/menit >=22`)
  }
  if (v.systolicBp !== undefined && v.systolicBp <= 100) {
    qsofaCriteria.push(`Sistolik ${v.systolicBp} mmHg <=100`)
  }
  if (isAlteredConsciousness(v.consciousness)) {
    qsofaCriteria.push(`Altered mental status: ${v.consciousness}`)
  }

  if (qsofaCriteria.length >= 2) {
    return match(
      'SEPSIS_QSOFA',
      'qSOFA Positif - Suspek Sepsis',
      'critical',
      `qSOFA ${qsofaCriteria.length}/3: suspek kuat sepsis`,
      'Evaluasi sumber infeksi, resusitasi sesuai kondisi, antibiotik sesuai protokol, dan rujuk cepat.',
      [...qsofaCriteria, `qSOFA skor: ${qsofaCriteria.length}/3`],
      ['A41.9', 'R65.1'],
      'Sepsis mungkin sudah berlangsung - tindakan segera',
      'Sepsis-3 qSOFA bedside criteria; Dashboard parity pattern.',
    )
  }

  const sirsCriteria: string[] = []
  if (v.temperatureC !== undefined && (v.temperatureC > 38 || v.temperatureC < 36)) {
    sirsCriteria.push(`Suhu ${v.temperatureC}C`)
  }
  if (v.heartRate !== undefined && v.heartRate > 90) {
    sirsCriteria.push(`HR ${v.heartRate} bpm >90`)
  }
  if (v.respiratoryRate !== undefined && v.respiratoryRate > 20) {
    sirsCriteria.push(`RR ${v.respiratoryRate}/menit >20`)
  }

  const hasInfectionContext = /infeksi|demam|sepsis|isk|ispa|pneumoni|selulitis|abses/i.test(text)
  if (sirsCriteria.length >= 2 && hasInfectionContext) {
    return match(
      'SEPSIS_SIRS',
      'SIRS + Konteks Infeksi',
      'high',
      'SIRS >=2 dengan konteks infeksi',
      'Monitoring ketat, evaluasi sumber infeksi, dan pertimbangkan eskalasi sesuai kondisi.',
      [...sirsCriteria, `SIRS skor: ${sirsCriteria.length}/3`],
      ['A41.9', 'R65.0'],
      '5-48 jam sebelum sepsis berat jika tidak ditangani',
      'SIRS criteria; Dashboard parity pattern.',
    )
  }

  if (sirsCriteria.length >= 2 && input.news2.aggregateScore >= 4) {
    return match(
      'SIRS_ELEVATED',
      'SIRS + NEWS2 Elevasi',
      'warning',
      `SIRS >=2 dengan NEWS2 skor ${input.news2.aggregateScore}`,
      'Evaluasi sumber infeksi dan monitoring serial.',
      [...sirsCriteria, `NEWS2 aggregate: ${input.news2.aggregateScore}`],
      ['R65.0'],
      'Observasi - cari sumber infeksi',
      'SIRS criteria and NEWS2 aggregate risk; Dashboard parity pattern.',
    )
  }

  return null
}

function checkRespiratoryDeterioration(
  v: SymphonyVitalsInput,
  text: string
): SymphonyEarlyWarningMatch | null {
  if (!/sesak|napas|asma|batuk|pneumoni|covid|paru|wheezing|mengi/i.test(text)) return null

  const tachypnea = v.respiratoryRate !== undefined && v.respiratoryRate > 24
  const lowSpO2 = v.spo2 !== undefined && v.spo2 < 94
  const tachycardia = v.heartRate !== undefined && v.heartRate > 100

  if (tachypnea && lowSpO2 && tachycardia) {
    return match(
      'RESP_FAILURE_IMMINENT',
      'Gagal Napas Iminen',
      'critical',
      'Trias gagal napas: takipnea + hipoksia + takikardia',
      'Oksigenasi segera, posisi optimal, terapi penyebab, dan rujuk emergensi.',
      [`RR ${v.respiratoryRate}/menit`, `SpO2 ${v.spo2}% <94`, `HR ${v.heartRate} bpm`],
      ['J96.0', 'J45', 'J18'],
      'Menit hingga jam sebelum gagal napas total',
      'Respiratory deterioration pathway; Dashboard parity pattern.',
    )
  }

  const count = [tachypnea, lowSpO2, tachycardia].filter(Boolean).length
  if (count >= 2) {
    return match(
      'RESP_DETERIORATION',
      'Deteriorasi Respirasi',
      'high',
      'Deteriorasi respirasi - dua dari tiga tanda positif',
      'Oksigen jika hipoksemia, evaluasi penyebab, dan monitoring ketat.',
      [
        tachypnea ? `RR ${v.respiratoryRate}/menit` : '',
        lowSpO2 ? `SpO2 ${v.spo2}%` : '',
        tachycardia ? `HR ${v.heartRate} bpm` : '',
      ].filter(Boolean),
      ['J45', 'J18', 'J06'],
      'Jam sebelum deteriorasi signifikan',
      'Respiratory deterioration pathway; Dashboard parity pattern.',
    )
  }

  return null
}

function checkCardiovascularPattern(
  v: SymphonyVitalsInput,
  text: string
): SymphonyEarlyWarningMatch | null {
  const hasChestPain = /nyeri dada|dada sakit|dada terasa berat|sesak dada|angina/i.test(text)
  const hasHFContext = /sesak|bengkak kaki|orthopnea|gagal jantung/i.test(text)
  const tachycardia = v.heartRate !== undefined && v.heartRate > 100
  const hypotension = v.systolicBp !== undefined && v.systolicBp < 100
  const hypertension = v.systolicBp !== undefined && v.systolicBp >= 160
  const tachypnea = v.respiratoryRate !== undefined && v.respiratoryRate > 22
  const lowSpO2 = v.spo2 !== undefined && v.spo2 < 94

  if (hasChestPain && tachycardia && hypotension) {
    return match(
      'ACS_SHOCK',
      'Suspek ACS dengan Syok Kardiogenik',
      'critical',
      'Nyeri dada + takikardia + hipotensi',
      'EKG bila tersedia, aspirin sesuai protokol bila tidak kontraindikasi, dan rujuk IGD segera.',
      ['Nyeri dada', `HR ${v.heartRate} bpm`, `Sistolik ${v.systolicBp} mmHg`],
      ['I21', 'I20'],
      'Menit - kegawatan kardiovaskular',
      'ACS emergency pattern; Dashboard parity pattern.',
    )
  }

  if (hasChestPain && hypertension && tachycardia) {
    return match(
      'ACS_HYPERTENSIVE',
      'Suspek ACS Hipertensif',
      'high',
      'Nyeri dada + hipertensi + takikardia',
      'EKG, terapi awal sesuai protokol, dan rujuk segera.',
      ['Nyeri dada', `Sistolik ${v.systolicBp} mmHg`, `HR ${v.heartRate} bpm`],
      ['I20', 'I21'],
      'Menit hingga jam',
      'ACS emergency pattern; Dashboard parity pattern.',
    )
  }

  if (hasHFContext && tachypnea && tachycardia) {
    return match(
      'HF_EXACERBATION',
      'Eksaserbasi Gagal Jantung',
      lowSpO2 ? 'critical' : 'high',
      'Deteriorasi gagal jantung - sesak + takipnea + takikardia',
      'Posisi semi-Fowler, oksigen bila perlu, terapi sesuai protokol, dan rujuk.',
      [`RR ${v.respiratoryRate}/menit`, `HR ${v.heartRate} bpm`, lowSpO2 ? `SpO2 ${v.spo2}%` : ''].filter(Boolean),
      ['I50'],
      'Jam sebelum edema paru akut',
      'Heart failure deterioration pattern; Dashboard parity pattern.',
    )
  }

  return null
}

function checkPreeclampsiaPattern(
  input: SymphonyEarlyWarningInput,
  v: SymphonyVitalsInput,
  text: string
): SymphonyEarlyWarningMatch | null {
  if (input.sexAtBirth !== 'female') return null
  if ((input.ageYears ?? 0) < 12) return null

  const hasPregnancyContext =
    input.pregnancyStatus === 'pregnant' || /hamil|kehamilan|trimester|janin/i.test(text)
  if (!hasPregnancyContext) return null

  const severeHypertension = v.systolicBp !== undefined && v.systolicBp >= 160
  const severeDiastolic = v.diastolicBp !== undefined && v.diastolicBp >= 110
  const hypertension = v.systolicBp !== undefined && v.systolicBp >= 140
  const diastolicHigh = v.diastolicBp !== undefined && v.diastolicBp >= 90
  const neuroSymptoms = /sakit kepala|pandangan kabur|mata berkunang|kejang|nyeri ulu hati/i.test(text)

  if ((severeHypertension || severeDiastolic) && neuroSymptoms) {
    return match(
      'ECLAMPSIA_IMMINENT',
      'Preeklampsia Berat / Eklampsia Iminen',
      'critical',
      'Hipertensi berat + gejala neurologis pada kehamilan',
      'MgSO4 dan antihipertensi sesuai protokol, posisi miring kiri, dan rujuk segera.',
      [
        severeHypertension ? `Sistolik ${v.systolicBp} mmHg >=160` : '',
        severeDiastolic ? `Diastolik ${v.diastolicBp} mmHg >=110` : '',
        'Gejala neurologis positif',
      ].filter(Boolean),
      ['O14.1', 'O15'],
      'Menit hingga jam sebelum eklampsia',
      'Obstetric emergency pathway; Dashboard parity pattern.',
    )
  }

  if (hypertension || diastolicHigh) {
    return match(
      'PREECLAMPSIA_WARNING',
      'Suspek Preeklampsia',
      'high',
      'Hipertensi pada kehamilan',
      'Cek proteinuria, monitoring, evaluasi gejala impending eclampsia, dan rujuk SpOG.',
      [
        hypertension ? `Sistolik ${v.systolicBp} mmHg >=140` : '',
        diastolicHigh ? `Diastolik ${v.diastolicBp} mmHg >=90` : '',
      ].filter(Boolean),
      ['O14.0', 'O13'],
      'Hari hingga minggu jika tidak ditangani',
      'Obstetric warning pathway; Dashboard parity pattern.',
    )
  }

  return null
}

export function detectSymphonyEarlyWarningPatterns(
  input: SymphonyEarlyWarningInput
): SymphonyEarlyWarningMatch[] {
  const v = input.latestVitals
  if (!v) return []

  const text = clinicalText(input)
  const checks = [
    checkDengueShockPattern(input, v, text),
    checkSepsisPattern(input, v, text),
    checkRespiratoryDeterioration(v, text),
    checkCardiovascularPattern(v, text),
    checkPreeclampsiaPattern(input, v, text),
  ]
  const severityOrder: Record<SymphonyAlert['severity'], number> = {
    critical: 0,
    high: 1,
    warning: 2,
    info: 3,
  }

  return checks
    .filter((candidate): candidate is SymphonyEarlyWarningMatch => candidate !== null)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

export function earlyWarningsToSymphonyAlerts(
  matches: SymphonyEarlyWarningMatch[],
  triggeredAt: string
): SymphonyAlert[] {
  return matches.map(match => ({
    id: `symphony-pattern-${match.patternId.toLowerCase().replaceAll('_', '-')}`,
    severity: match.severity,
    title: match.patternName,
    reasoning: [
      match.condition,
      ...match.criteriaMet,
      `Lead time: ${match.leadTime}`,
      match.clinicalBasis,
    ],
    source: 'pattern',
    acknowledged: false,
    triggeredAt,
  }))
}
