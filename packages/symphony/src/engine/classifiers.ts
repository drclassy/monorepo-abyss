import type { SymphonyAvpuLevel } from '../contracts'

export interface SymphonyBpReading {
  sbp: number
  dbp: number
  timestamp?: Date
}

export interface SymphonyBpMeasurementSession {
  readings: SymphonyBpReading[]
  finalBp?: SymphonyBpReading
  measurementQuality: 'good' | 'acceptable' | 'poor'
}

export type SymphonyHypertensionType =
  | 'NORMAL'
  | 'PREHYPERTENSION'
  | 'PRIMARY_HTN'
  | 'SECONDARY_HTN'
  | 'ISOLATED_SYSTOLIC_HTN'
  | 'WHITE_COAT_HTN'
  | 'MASKED_HTN'
  | 'RESISTANT_HTN'
  | 'HTN_URGENCY'
  | 'HTN_EMERGENCY'

export type SymphonyHypertensionSeverity = 'normal' | 'prehypertension' | 'stage1' | 'stage2' | 'crisis'

export interface SymphonyHmodRedFlags {
  chestPain: boolean
  pulmonaryEdema: boolean
  neurologicalDeficit: boolean
  visionChanges: boolean
  severeHeadache: boolean
  oliguria: boolean
  alteredMentalStatus: boolean
}

export interface SymphonyHypertensionClassification {
  type: SymphonyHypertensionType
  severity: SymphonyHypertensionSeverity
  finalBp: SymphonyBpReading
  redFlags?: SymphonyHmodRedFlags
  recommendations: string[]
  reasoning: string
}

export interface SymphonyCaptoprilProtocolStep {
  timeMinutes: number
  action: string
  monitoring: string[]
  decisionPoint?: {
    condition: string
    ifTrue: string
    ifFalse: string
  }
}

export const SYMPHONY_BP_THRESHOLDS = {
  NORMAL: { sbp: 120, dbp: 80 },
  PREHYPERTENSION: { sbp: 130, dbp: 85 },
  STAGE1: { sbp: 140, dbp: 90 },
  STAGE2: { sbp: 160, dbp: 100 },
  CRISIS: { sbp: 180, dbp: 110 },
} as const

export const SYMPHONY_CAPTOPRIL_PROTOCOL: SymphonyCaptoprilProtocolStep[] = [
  {
    timeMinutes: 0,
    action: 'Captopril 12.5mg SL',
    monitoring: ['TD baseline', 'Gejala hipoperfusi'],
  },
  {
    timeMinutes: 15,
    action: 'Monitor TD serial',
    monitoring: ['TD', 'Gejala pusing/lemas'],
  },
  {
    timeMinutes: 30,
    action: 'Evaluasi DBP',
    monitoring: ['DBP', 'Perfusi'],
    decisionPoint: {
      condition: 'DBP >100 DAN pasien stabil',
      ifTrue: 'Ulangi Captopril 12.5mg SL (maks 25mg total)',
      ifFalse: 'Lanjut ke maintenance (Amlodipine)',
    },
  },
  {
    timeMinutes: 60,
    action: 'Amlodipine 10mg PO',
    monitoring: ['TD trend', 'Toleransi obat'],
  },
]

export function finalizeSymphonyBloodPressure(
  readings: SymphonyBpReading[]
): SymphonyBpMeasurementSession {
  if (readings.length < 2) {
    throw new Error('Minimum 2 BP readings required')
  }

  const sorted = [...readings]
  const lastThree = sorted.slice(-3)
  const maxSbp = Math.max(...lastThree.map(reading => reading.sbp))
  const minSbp = Math.min(...lastThree.map(reading => reading.sbp))
  const maxDbp = Math.max(...lastThree.map(reading => reading.dbp))
  const minDbp = Math.min(...lastThree.map(reading => reading.dbp))

  let measurementQuality: SymphonyBpMeasurementSession['measurementQuality'] = 'good'
  if (maxSbp - minSbp > 10 || maxDbp - minDbp > 10) {
    measurementQuality = readings.length >= 4 ? 'acceptable' : 'poor'
  }

  const finalPair = sorted.slice(-2)
  const finalBp: SymphonyBpReading = {
    sbp: Math.round(finalPair.reduce((sum, reading) => sum + reading.sbp, 0) / finalPair.length),
    dbp: Math.round(finalPair.reduce((sum, reading) => sum + reading.dbp, 0) / finalPair.length),
    timestamp: finalPair[finalPair.length - 1]?.timestamp,
  }

  return {
    readings: sorted,
    finalBp,
    measurementQuality,
  }
}

export function classifySymphonyHypertensionType(
  bp: SymphonyBpReading,
  context?: {
    onMultipleAgents?: boolean
    suspectedSecondaryCause?: boolean
    clinicHighHomeNormal?: boolean
    clinicNormalHomeHigh?: boolean
  }
): SymphonyHypertensionType {
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.CRISIS.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.CRISIS.dbp) {
    return 'HTN_URGENCY'
  }
  if (context?.suspectedSecondaryCause && (bp.sbp >= 140 || bp.dbp >= 90)) {
    return 'SECONDARY_HTN'
  }
  if (context?.onMultipleAgents && (bp.sbp >= 140 || bp.dbp >= 90)) {
    return 'RESISTANT_HTN'
  }
  if (context?.clinicHighHomeNormal && (bp.sbp >= 140 || bp.dbp >= 90)) {
    return 'WHITE_COAT_HTN'
  }
  if (context?.clinicNormalHomeHigh && bp.sbp < 140 && bp.dbp < 90) {
    return 'MASKED_HTN'
  }
  if (bp.sbp >= 140 && bp.dbp < 90) {
    return 'ISOLATED_SYSTOLIC_HTN'
  }
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.STAGE1.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.STAGE1.dbp) {
    return 'PRIMARY_HTN'
  }
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.PREHYPERTENSION.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.PREHYPERTENSION.dbp) {
    return 'PREHYPERTENSION'
  }
  return 'NORMAL'
}

export function getSymphonyHypertensionSeverity(
  bp: SymphonyBpReading
): SymphonyHypertensionSeverity {
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.CRISIS.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.CRISIS.dbp) {
    return 'crisis'
  }
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.STAGE2.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.STAGE2.dbp) {
    return 'stage2'
  }
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.STAGE1.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.STAGE1.dbp) {
    return 'stage1'
  }
  if (bp.sbp >= SYMPHONY_BP_THRESHOLDS.PREHYPERTENSION.sbp || bp.dbp >= SYMPHONY_BP_THRESHOLDS.PREHYPERTENSION.dbp) {
    return 'prehypertension'
  }
  return 'normal'
}

export function triageSymphonyHypertensiveCrisis(
  bp: SymphonyBpReading,
  redFlags: SymphonyHmodRedFlags
): SymphonyHypertensionType {
  const isCrisis = bp.sbp >= SYMPHONY_BP_THRESHOLDS.CRISIS.sbp || bp.dbp >= 120
  const hasOrganDamage = Object.values(redFlags).some(Boolean)
  if (isCrisis && hasOrganDamage) return 'HTN_EMERGENCY'
  if (isCrisis) return 'HTN_URGENCY'
  return classifySymphonyHypertensionType(bp)
}

export function getSymphonyHypertensionRecommendations(
  type: SymphonyHypertensionType,
  bp: SymphonyBpReading
): string[] {
  switch (type) {
    case 'HTN_EMERGENCY':
      return [
        'Rujuk IGD segera untuk tata laksana hipertensi emergensi.',
        'Target awal: turunkan MAP <=25% dalam 1-2 jam pertama.',
        'Monitor perfusi, neurologi, dan diuresis secara ketat.',
      ]
    case 'HTN_URGENCY':
      return [
        'Turunkan tekanan darah secara bertahap, bukan agresif.',
        'Gunakan protokol captopril sublingual bila sesuai.',
        'Follow-up <=7 hari atau lebih cepat bila gejala memburuk.',
      ]
    case 'PRIMARY_HTN':
    case 'ISOLATED_SYSTOLIC_HTN':
      return [
        'Konfirmasi dengan pengukuran ulang sesuai protokol FKTP.',
        'Mulai modifikasi gaya hidup dan terapi sesuai stratifikasi risiko.',
        `Target awal: <140/90 mmHg dari TD ${bp.sbp}/${bp.dbp} mmHg.`,
      ]
    case 'PREHYPERTENSION':
      return [
        'Fokus pada diet rendah garam, aktivitas fisik, dan kontrol berat badan.',
        'Ulangi evaluasi tekanan darah berkala.',
      ]
    default:
      return ['Lanjutkan monitoring rutin tekanan darah.']
  }
}

export function getSymphonyHypertensionReasoning(
  type: SymphonyHypertensionType,
  bp: SymphonyBpReading
): string {
  switch (type) {
    case 'HTN_EMERGENCY':
      return `STATUS: EMERGENCY. TD ${bp.sbp}/${bp.dbp} mmHg pada zona krisis dengan red flags kerusakan organ akut.`
    case 'HTN_URGENCY':
      return `STATUS: URGENCY. TD ${bp.sbp}/${bp.dbp} mmHg pada zona krisis tanpa bukti kerusakan organ akut.`
    case 'PRIMARY_HTN':
      return `TD ${bp.sbp}/${bp.dbp} mmHg memenuhi kriteria hipertensi primer.`
    case 'ISOLATED_SYSTOLIC_HTN':
      return `SBP ${bp.sbp} mmHg tinggi dengan DBP ${bp.dbp} mmHg masih di bawah ambang hipertensi diastolik.`
    case 'PREHYPERTENSION':
      return `TD ${bp.sbp}/${bp.dbp} mmHg meningkat tetapi belum memenuhi kriteria hipertensi.`
    default:
      return `TD ${bp.sbp}/${bp.dbp} mmHg dalam batas normal.`
  }
}

export function classifySymphonyHypertension(
  session: SymphonyBpMeasurementSession,
  redFlags?: SymphonyHmodRedFlags,
  context?: Parameters<typeof classifySymphonyHypertensionType>[1]
): SymphonyHypertensionClassification {
  if (!session.finalBp) {
    throw new Error('BP session must have finalBp calculated')
  }

  let type = classifySymphonyHypertensionType(session.finalBp, context)
  if (type === 'HTN_URGENCY' && redFlags) {
    type = triageSymphonyHypertensiveCrisis(session.finalBp, redFlags)
  }

  return {
    type,
    severity: getSymphonyHypertensionSeverity(session.finalBp),
    finalBp: session.finalBp,
    redFlags,
    recommendations: getSymphonyHypertensionRecommendations(type, session.finalBp),
    reasoning: getSymphonyHypertensionReasoning(type, session.finalBp),
  }
}

export type SymphonyGlucoseMeasurementType = 'GDS' | 'GDP' | '2JTTGO' | 'HbA1c'

export interface SymphonyGlucoseData {
  gds?: number
  gdp?: number
  ttgo2h?: number
  hba1c?: number
  sampleType: 'capillary' | 'plasma_venous'
  hasClassicSymptoms: boolean
}

export type SymphonyGlucoseClassifierCategory =
  | 'HYPOGLYCEMIA_CRISIS'
  | 'NORMAL'
  | 'PREDIABETES'
  | 'DIABETES_CONFIRMED'
  | 'HYPERGLYCEMIA_CRISIS'

export type SymphonyHyperglycemiaCrisisType =
  | 'NOT_HYPERGLYCEMIA'
  | 'HYPERGLYCEMIA_NO_CRISIS'
  | 'HYPERGLYCEMIC_CRISIS'

export interface SymphonyDkaHhsRedFlags {
  kussmaulBreathing: boolean
  acetoneBreath: boolean
  nauseaVomiting: boolean
  abdominalPain: boolean
  alteredMentalStatus: boolean
  severeDehydration: boolean
  extremeHyperglycemia: boolean
  seizures: boolean
}

export interface SymphonyGlucoseClassification {
  category: SymphonyGlucoseClassifierCategory
  severity: 'critical' | 'high' | 'moderate' | 'normal'
  value: number
  measurementType: SymphonyGlucoseMeasurementType
  recommendations: string[]
  reasoning: string
}

export const SYMPHONY_GLUCOSE_THRESHOLDS = {
  HYPOGLYCEMIA: 70,
  SEVERE_HYPOGLYCEMIA: 54,
  NORMAL: {
    GDP: { min: 70, max: 99 },
    TTGO_2H: { min: 70, max: 139 },
    HbA1c: { min: 0, max: 5.6 },
  },
  PREDIABETES: {
    GDP: { min: 100, max: 125 },
    TTGO_2H: { min: 140, max: 199 },
    HbA1c: { min: 5.7, max: 6.4 },
  },
  DIABETES: {
    GDS: 200,
    GDP: 126,
    TTGO_2H: 200,
    HbA1c: 6.5,
  },
  EXTREME_HYPERGLYCEMIA: 600,
} as const

export function classifySymphonyGlucose(
  data: SymphonyGlucoseData
): Exclude<SymphonyGlucoseClassifierCategory, 'HYPERGLYCEMIA_CRISIS'> {
  if (data.gds !== undefined && data.gds < SYMPHONY_GLUCOSE_THRESHOLDS.HYPOGLYCEMIA) {
    return 'HYPOGLYCEMIA_CRISIS'
  }
  if (
    data.gds !== undefined &&
    data.gds >= SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.GDS &&
    data.hasClassicSymptoms
  ) {
    return 'DIABETES_CONFIRMED'
  }
  if (data.gdp !== undefined && data.gdp >= SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.GDP) {
    return 'DIABETES_CONFIRMED'
  }
  if (data.ttgo2h !== undefined && data.ttgo2h >= SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.TTGO_2H) {
    return 'DIABETES_CONFIRMED'
  }
  if (data.hba1c !== undefined && data.hba1c >= SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.HbA1c) {
    return 'DIABETES_CONFIRMED'
  }
  if (
    data.gdp !== undefined &&
    data.gdp >= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.GDP.min &&
    data.gdp <= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.GDP.max
  ) {
    return 'PREDIABETES'
  }
  if (
    data.ttgo2h !== undefined &&
    data.ttgo2h >= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.TTGO_2H.min &&
    data.ttgo2h <= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.TTGO_2H.max
  ) {
    return 'PREDIABETES'
  }
  if (
    data.hba1c !== undefined &&
    data.hba1c >= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.HbA1c.min &&
    data.hba1c <= SYMPHONY_GLUCOSE_THRESHOLDS.PREDIABETES.HbA1c.max
  ) {
    return 'PREDIABETES'
  }
  return 'NORMAL'
}

export function triageSymphonyHyperglycemia(
  glucose: number,
  redFlags: Partial<SymphonyDkaHhsRedFlags>
): SymphonyHyperglycemiaCrisisType {
  if (glucose < SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.GDS) {
    return 'NOT_HYPERGLYCEMIA'
  }

  const hasCrisisSigns =
    redFlags.severeDehydration ||
    redFlags.nauseaVomiting ||
    redFlags.kussmaulBreathing ||
    redFlags.acetoneBreath ||
    redFlags.alteredMentalStatus ||
    redFlags.abdominalPain ||
    redFlags.seizures ||
    redFlags.extremeHyperglycemia

  return hasCrisisSigns ? 'HYPERGLYCEMIC_CRISIS' : 'HYPERGLYCEMIA_NO_CRISIS'
}

export function getSymphonyGlucoseRecommendations(
  category: SymphonyGlucoseClassifierCategory
): string[] {
  switch (category) {
    case 'HYPOGLYCEMIA_CRISIS':
      return [
        'Tangani hipoglikemia segera dengan 15g karbohidrat cepat serap bila aman menelan.',
        'Ulangi cek gula darah dalam 15 menit.',
        'Bila tidak sadar atau tidak aman menelan, rujuk emergensi untuk dekstrosa/glukagon.',
      ]
    case 'PREDIABETES':
      return [
        'Intervensi gaya hidup intensif: target turun 7% berat badan dalam 6 bulan.',
        'Aktivitas fisik >=150 menit per minggu.',
        'Ulangi evaluasi glukosa 3-6 bulan.',
      ]
    case 'DIABETES_CONFIRMED':
      return [
        'Mulai tata laksana diabetes komprehensif sesuai PERKENI/ADA.',
        'Edukasi diet, latihan, dan target HbA1c individual.',
        'Skrining komplikasi mikro dan makrovaskular.',
      ]
    case 'HYPERGLYCEMIA_CRISIS':
      return [
        'Rujuk emergensi untuk evaluasi DKA/HHS.',
        'Pasang akses intravena dan mulai resusitasi cairan sesuai protokol lokal.',
        'Jangan andalkan OAD oral pada situasi krisis.',
      ]
    default:
      return ['Gula darah dalam batas aman; lanjutkan monitoring dan pencegahan.']
  }
}

export function getSymphonyGlucoseReasoning(
  category: SymphonyGlucoseClassifierCategory,
  value: number,
  measurementType: SymphonyGlucoseMeasurementType
): string {
  switch (category) {
    case 'HYPOGLYCEMIA_CRISIS':
      return `Glukosa ${value} mg/dL di bawah ambang hipoglikemia ${SYMPHONY_GLUCOSE_THRESHOLDS.HYPOGLYCEMIA} mg/dL.`
    case 'PREDIABETES':
      return `${measurementType} ${value} memenuhi rentang prediabetes.`
    case 'DIABETES_CONFIRMED':
      return `${measurementType} ${value} memenuhi kriteria diabetes terkonfirmasi.`
    case 'HYPERGLYCEMIA_CRISIS':
      return `${measurementType} ${value} disertai red flags krisis hiperglikemik.`
    default:
      return `${measurementType} ${value} masih dalam rentang non-kritis.`
  }
}

export function classifySymphonyBloodGlucose(
  data: SymphonyGlucoseData,
  redFlags?: Partial<SymphonyDkaHhsRedFlags>
): SymphonyGlucoseClassification {
  let measurementType: SymphonyGlucoseMeasurementType
  let value: number

  if (data.gds !== undefined) {
    measurementType = 'GDS'
    value = data.gds
  } else if (data.gdp !== undefined) {
    measurementType = 'GDP'
    value = data.gdp
  } else if (data.ttgo2h !== undefined) {
    measurementType = '2JTTGO'
    value = data.ttgo2h
  } else if (data.hba1c !== undefined) {
    measurementType = 'HbA1c'
    value = data.hba1c
  } else {
    throw new Error('No glucose measurement provided')
  }

  let category: SymphonyGlucoseClassifierCategory = classifySymphonyGlucose(data)
  if (
    measurementType === 'GDS' &&
    value >= SYMPHONY_GLUCOSE_THRESHOLDS.DIABETES.GDS &&
    redFlags &&
    triageSymphonyHyperglycemia(value, redFlags) === 'HYPERGLYCEMIC_CRISIS'
  ) {
    category = 'HYPERGLYCEMIA_CRISIS'
  }

  const severity =
    category === 'HYPOGLYCEMIA_CRISIS' || category === 'HYPERGLYCEMIA_CRISIS'
      ? 'critical'
      : category === 'DIABETES_CONFIRMED'
        ? 'high'
        : category === 'PREDIABETES'
          ? 'moderate'
          : 'normal'

  return {
    category,
    severity,
    value,
    measurementType,
    recommendations: getSymphonyGlucoseRecommendations(category),
    reasoning: getSymphonyGlucoseReasoning(category, value, measurementType),
  }
}

export type SymphonyChronicDiseaseType =
  | 'HT'
  | 'DM'
  | 'HF'
  | 'CHD'
  | 'STROKE'
  | 'CKD'
  | 'CA'
  | 'ASTHMA'
  | 'PPOK'
  | 'GERD'
  | 'THYROID'

export type SymphonyChronicDiseaseSeverity = 'critical' | 'moderate'

export interface SymphonyChronicDiseaseClassification {
  type: SymphonyChronicDiseaseType
  shortLabel: string
  fullName: string
  severity: SymphonyChronicDiseaseSeverity
  icdCode: string
}

const SYMPHONY_ICD_DISEASE_MAP: Record<string, SymphonyChronicDiseaseType> = {
  I10: 'HT',
  I11: 'HT',
  I12: 'HT',
  I13: 'HT',
  I15: 'HT',
  E10: 'DM',
  E11: 'DM',
  E13: 'DM',
  E14: 'DM',
  I50: 'HF',
  I20: 'CHD',
  I25: 'CHD',
  I60: 'STROKE',
  I61: 'STROKE',
  I63: 'STROKE',
  I64: 'STROKE',
  N18: 'CKD',
  J45: 'ASTHMA',
  J44: 'PPOK',
  K21: 'GERD',
  E03: 'THYROID',
  E05: 'THYROID',
}

const SYMPHONY_CANCER_CODE_PATTERN = /^C[0-8][0-9]|^C9[0-7]/

const SYMPHONY_DISEASE_SEVERITY: Record<
  SymphonyChronicDiseaseType,
  SymphonyChronicDiseaseSeverity
> = {
  HT: 'critical',
  DM: 'critical',
  HF: 'critical',
  CHD: 'critical',
  STROKE: 'critical',
  CKD: 'critical',
  CA: 'critical',
  ASTHMA: 'moderate',
  PPOK: 'moderate',
  GERD: 'moderate',
  THYROID: 'moderate',
}

const SYMPHONY_DISEASE_FULL_NAMES: Record<SymphonyChronicDiseaseType, string> = {
  HT: 'Hipertensi',
  DM: 'Diabetes Mellitus',
  HF: 'Gagal Jantung',
  CHD: 'Penyakit Jantung Koroner',
  STROKE: 'Stroke',
  CKD: 'Gagal Ginjal Kronik',
  CA: 'Kanker',
  ASTHMA: 'Asma Kronis',
  PPOK: 'PPOK',
  GERD: 'GERD',
  THYROID: 'Gangguan Tiroid',
}

export function classifySymphonyChronicDisease(
  icdCode: string
): SymphonyChronicDiseaseClassification | null {
  if (!icdCode || typeof icdCode !== 'string') return null

  const normalizedCode = icdCode.toUpperCase().trim()
  const baseCode = normalizedCode.split('.')[0]

  if (SYMPHONY_CANCER_CODE_PATTERN.test(baseCode)) {
    return {
      type: 'CA',
      shortLabel: 'CA',
      fullName: SYMPHONY_DISEASE_FULL_NAMES.CA,
      severity: SYMPHONY_DISEASE_SEVERITY.CA,
      icdCode: normalizedCode,
    }
  }

  const diseaseType = SYMPHONY_ICD_DISEASE_MAP[baseCode]
  if (!diseaseType) return null

  return {
    type: diseaseType,
    shortLabel: diseaseType,
    fullName: SYMPHONY_DISEASE_FULL_NAMES[diseaseType],
    severity: SYMPHONY_DISEASE_SEVERITY[diseaseType],
    icdCode: normalizedCode,
  }
}

export function isSymphonyChronicDisease(icdCode: string): boolean {
  return classifySymphonyChronicDisease(icdCode) !== null
}

export function getSymphonySupportedDiseaseTypes(): SymphonyChronicDiseaseType[] {
  return Object.keys(SYMPHONY_DISEASE_FULL_NAMES) as SymphonyChronicDiseaseType[]
}

export function getSymphonyDiseaseFullName(diseaseType: SymphonyChronicDiseaseType): string {
  return SYMPHONY_DISEASE_FULL_NAMES[diseaseType]
}

export interface SymphonyGcsComponents {
  e: number
  v: number
  m: number
}

export type SymphonyConsciousnessSeverity = 'normal' | 'impaired' | 'severe' | 'unresponsive'

export function symphonyAvpuToNews2Score(avpu: SymphonyAvpuLevel): number {
  return avpu === 'A' ? 0 : 3
}

export function symphonyGcsToAvpu(gcs: SymphonyGcsComponents): SymphonyAvpuLevel {
  const total = gcs.e + gcs.v + gcs.m
  if (total >= 15) return 'A'
  if (total === 14) return gcs.v <= 4 ? 'V' : 'A'
  if (total >= 9) return 'V'
  if (total >= 4) return 'P'
  return 'U'
}

export function symphonyAvpuToEstimatedGcs(avpu: SymphonyAvpuLevel): SymphonyGcsComponents {
  switch (avpu) {
    case 'A':
      return { e: 4, v: 5, m: 6 }
    case 'V':
      return { e: 3, v: 3, m: 5 }
    case 'P':
      return { e: 2, v: 2, m: 4 }
    case 'U':
      return { e: 1, v: 1, m: 1 }
  }
}

export function symphonyAvpuToGcsTotal(avpu: SymphonyAvpuLevel): number {
  const gcs = symphonyAvpuToEstimatedGcs(avpu)
  return gcs.e + gcs.v + gcs.m
}

export function assessSymphonyConsciousnessSeverity(
  avpu: SymphonyAvpuLevel,
  gcs?: SymphonyGcsComponents
): SymphonyConsciousnessSeverity {
  if (gcs) {
    const total = gcs.e + gcs.v + gcs.m
    if (total >= 15) return 'normal'
    if (total >= 13) return 'impaired'
    if (total >= 4) return 'severe'
    return 'unresponsive'
  }

  switch (avpu) {
    case 'A':
      return 'normal'
    case 'V':
      return 'impaired'
    case 'P':
      return 'severe'
    case 'U':
      return 'unresponsive'
  }
}

export function getSymphonyBestGcsTotal(
  avpu: SymphonyAvpuLevel,
  gcs?: SymphonyGcsComponents
): number {
  if (gcs) return gcs.e + gcs.v + gcs.m
  return symphonyAvpuToGcsTotal(avpu)
}
