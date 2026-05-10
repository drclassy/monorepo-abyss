'use client'

import type { CSSProperties, JSX, Ref } from 'react'
import { useEffect, useRef, useState } from 'react'

import SectionNumberMark from '@/components/SectionNumberMark'
import { TextScramble } from '@/components/ui/text-scramble'

type HeaderTone = 'muted' | 'accent'
type HistoryPhase = 'idle' | 'loading' | 'ready'
type AnomalyTone = 'critical' | 'warning' | 'default'
type ReasoningTone = 'primary' | 'warning' | 'muted'
type PlanTone = 'urgent' | 'primary' | 'supportive'
type SeverityKey = 'ringan' | 'sedang' | 'berat'
type SimulationFocusTarget = 'complaint' | 'history' | 'evidence' | 'exam' | 'assessment'

type VitalSign = {
  label: string
  value: string
  unit: string
  critical?: boolean
}

type EntityTag = {
  text: string
  type: string
}

type LabRecommendation = {
  name: string
  status: string
}

type LabResult = {
  name: string
  value: string
  interpretation: string
  alert?: boolean
}

type TrajectoryPoint = {
  label: string
  value: string
}

type TrajectoryMedication = {
  name: string
  dosage: string
}

type PhysicalExamRow = {
  organ: string
  result: string
  alert?: boolean
}

type AnomalyTag = EntityTag & {
  tone: AnomalyTone
}

type ClinicalReasoning = {
  title: string
  type: string
  summary: string
  tone: ReasoningTone
}

type ManagementStep = {
  title: string
  detail: string
  tone: PlanTone
}

type AllergyRow = {
  label: string
  value: string
  alert?: boolean
}

type MedicationOrder = {
  name: string
  regimen: string
  note: string
  tone: PlanTone
}

type SimulationBranch = {
  label: string
  severityLabel: string
  headline: string
  finalAnamnesaText: string
  caseMetadata: readonly string[]
  directedHistory: readonly string[]
  historyNow: string
  pastHistory: string
  positiveFlags: string
  negativeFlags: string
  allergies: readonly AllergyRow[]
  anamnesaTags: readonly EntityTag[]
  vitals: readonly VitalSign[]
  labRecommendations: readonly LabRecommendation[]
  labResults: readonly LabResult[]
  trajectoryPoints: readonly TrajectoryPoint[]
  trajectoryOxygenPolyline: string
  trajectoryTemperaturePolyline: string
  trajectoryFinalPoint: { x: number; y: number }
  trajectoryMedications: readonly TrajectoryMedication[]
  physicalExamRows: readonly PhysicalExamRow[]
  anomalyTags: readonly AnomalyTag[]
  clinicalReasoning: readonly ClinicalReasoning[]
  medications: readonly MedicationOrder[]
  therapies: readonly ManagementStep[]
  routeTitle: string
  routeDetail: string
  routeReason: string
  trajectoryInsight: string
}

const sentraSimThemeStyle = {
  background:
    'radial-gradient(circle at top right, rgba(242, 237, 232, 0.06), transparent 34%), radial-gradient(circle at bottom left, rgba(242, 237, 232, 0.04), transparent 28%), #1a1a1a',
  backgroundColor: '#1a1a1a',
  fontFamily: 'Georgia, serif',
  ['--fi-paper' as const]: '#ece7d7',
  ['--fi-paper-2' as const]: '#ece7d7',
  ['--fi-white' as const]: '#ece7d7',
  ['--fi-token-color-paper' as const]: '#ece7d7',
  ['--fi-token-color-paper-alt' as const]: '#ece7d7',
  ['--fi-token-color-white' as const]: '#ece7d7',
} as CSSProperties

const sentraSimGeorgiaFontStyle = {
  fontFamily: 'Georgia, serif',
} as CSSProperties

const sentraSimTransparentSurfaceStyle = {
  background: 'transparent',
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxShadow: 'none',
} as CSSProperties

const sentraSimComposerStyle = {
  ...sentraSimTransparentSurfaceStyle,
  ...sentraSimGeorgiaFontStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
} as CSSProperties

const ANAMNESA_IDLE_STEPS = [
  {
    label: 'Lapisan 01',
    title: 'Keluhan inti',
    detail: 'Sistem menunggu gejala utama, durasi, dan pola progres untuk membuka narasi kasus.',
  },
  {
    label: 'Lapisan 02',
    title: 'Sinyal risiko awal',
    detail:
      'Demam, sesak, komorbid, dan konteks paparan akan dibaca untuk menentukan arah severity.',
  },
  {
    label: 'Lapisan 03',
    title: 'Cabang keputusan',
    detail:
      'Begitu keluhan terkunci, simulasi akan meneruskan kasus ke riwayat, vital, dan red flag.',
  },
] as const

const STATUS_TEXT = {
  idle: 'SENTRA / RSIA MELINDA // RM-88492-A // LIVE CASE: IDLE',
  synthesizing: 'SENTRA // RM-88492-A // STRUCTURING CHIEF COMPLAINT...',
  emr: 'SENTRA // RM-88492-A // RETRIEVING HISTORY, ALLERGY, AND COMORBID',
  synced: 'SENTRA // RM-88492-A // TRIAGE CONTEXT VERIFIED',
  lab: 'SENTRA // RM-88492-A // REQUESTING DIAGNOSTIC WORKUP...',
  evidence: 'SENTRA // RM-88492-A // FUSING LAB AND RADIOLOGY EVIDENCE...',
  trajectory: 'SENTRA // RM-88492-A // MONITORING CLINICAL RESPONSE...',
  diagnosis: 'SENTRA // RM-88492-A // RANKING DIFFERENTIAL DIAGNOSES...',
  management: 'SENTRA // RM-88492-A // BUILDING INITIAL MANAGEMENT PLAN...',
  complete: 'SENTRA // RM-88492-A // CASE SIMULATION COMPLETE',
} as const

type SimulationStatus = (typeof STATUS_TEXT)[keyof typeof STATUS_TEXT]

type SimulationState = {
  isRunning: boolean
  isComplete: boolean
  status: SimulationStatus
  headerTone: HeaderTone
  anamnesaText: string
  anamnesaTagCount: number
  historyPhase: HistoryPhase
  showVitalsAnomaly: boolean
  vitalsTagCount: number
  labOpen: boolean
  selectedLabCount: number
  showLabResults: boolean
  labResultCount: number
  trajectoryOpen: boolean
  showTrajectoryInsight: boolean
  showDiagnosis: boolean
  diagnosisCount: number
  showManagement: boolean
  managementCount: number
  vitalsRevealCount: number
  examRevealCount: number
  historyRevealCount: number
  showAnamnesaIdle: boolean
  showPanel02: boolean
  showPanel03: boolean
  showPanel04: boolean
}

const BASE_LAB_RECOMMENDATIONS: readonly LabRecommendation[] = [
  { name: 'Hematologi Lengkap', status: 'DIPILIH UNTUK KONFIRMASI INFEKSI' },
  { name: 'C-Reactive Protein (CRP)', status: 'DIPILIH UNTUK MENILAI INFLAMASI' },
  { name: 'Foto Toraks AP/PA', status: 'DIPILIH UNTUK EVALUASI INFILTRAT' },
]

const MODERATE_BRANCH: SimulationBranch = {
  label: 'Sedang',
  severityLabel: 'CAP Sedang',
  headline: 'Observasi klinis dengan oksigen awal dan verifikasi penunjang',
  finalAnamnesaText:
    'demam tinggi, batuk produktif kehijauan, sesak saat aktivitas ringan, dan nyeri dada kanan saat batuk',
  caseMetadata: ['Perempuan, 46 tahun', 'Keluhan sejak 3 hari', 'Triage prioritas kuning'],
  directedHistory: [
    'Demam mencapai 38.8 C, menggigil, dan dahak berubah menjadi mukopurulen.',
    'Sesak muncul saat berjalan ke kamar mandi, tanpa riwayat asma aktif.',
    'Tidak ada hemoptisis, tidak ada penurunan kesadaran, dan tidak ada nyeri dada tipe iskemik.',
  ],
  historyNow:
    'Keluhan dominan berupa demam tinggi, batuk produktif, dan sesak saat aktivitas ringan dengan progres memburuk dalam 24 jam terakhir.',
  pastHistory:
    'Hipertensi terkontrol, alergi amoksisilin, dan tidak ada rawat inap paru dalam 12 bulan terakhir.',
  positiveFlags:
    'Hipoksemia ringan, takipnea, ronki lokal kanan, serta infiltrat fokal yang konsisten dengan pneumonia komunitas.',
  negativeFlags:
    'Belum ada hipotensi, penurunan kesadaran, hemoptisis, atau tanda gagal napas berat.',
  allergies: [
    { label: 'Alergi obat', value: 'Amoksisilin', alert: true },
    { label: 'Komorbid', value: 'Hipertensi terkontrol' },
    { label: 'Obat rutin', value: 'Amlodipin 5 mg' },
  ],
  anamnesaTags: [
    { text: 'Demam Tinggi', type: 'SYMPTOM' },
    { text: 'Batuk Produktif Hijau', type: 'SYMPTOM' },
    { text: 'Sesak Aktivitas Ringan', type: 'RED FLAG' },
    { text: 'Nyeri Pleuritik Kanan', type: 'OBSERVATION' },
  ],
  vitals: [
    { label: 'GCS', value: '15', unit: 'E4V5M6' },
    { label: 'Tekanan Darah', value: '132/84', unit: 'mmHg' },
    { label: 'Nadi', value: '108', unit: 'bpm', critical: true },
    { label: 'Napas', value: '24', unit: 'x/m', critical: true },
    { label: 'Suhu', value: '38.8', unit: 'C', critical: true },
    { label: 'SpO2', value: '92', unit: '%', critical: true },
    { label: 'CRT', value: '< 2', unit: 'detik' },
  ],
  labRecommendations: BASE_LAB_RECOMMENDATIONS,
  labResults: [
    {
      name: 'Leukosit',
      value: '15.200/uL',
      interpretation: 'Leukositosis neutrofilik',
      alert: true,
    },
    { name: 'CRP', value: '86 mg/L', interpretation: 'Inflamasi akut bermakna', alert: true },
    {
      name: 'Foto Toraks',
      value: 'Infiltrat lobus bawah kanan',
      interpretation: 'Konsolidasi sesuai CAP',
      alert: true,
    },
  ],
  trajectoryPoints: [
    { label: 'Masuk', value: 'SpO2 92% / T 38.8 C' },
    { label: '30 Menit O2', value: 'SpO2 94% / T 38.4 C' },
    { label: '2 Jam', value: 'SpO2 96% / T 37.8 C' },
  ],
  trajectoryOxygenPolyline: '50,100 180,88 320,72 450,58',
  trajectoryTemperaturePolyline: '50,42 180,54 320,72 450,90',
  trajectoryFinalPoint: { x: 450, y: 58 },
  trajectoryMedications: [
    { name: 'Oksigen nasal kanul', dosage: '2-3 L/menit' },
    { name: 'Antipiretik', dosage: 'sesuai protokol' },
    { name: 'Antibiotik empirik', dosage: 'setelah verifikasi alergi' },
  ],
  physicalExamRows: [
    {
      organ: 'Kepala & Leher',
      result: 'Mukosa mulut agak kering, faring hiperemis ringan, tidak ada deviasi trakea',
    },
    {
      organ: 'Dada (Cor & Pulmo)',
      result:
        'Gerak dinding dada simetris, rhonki basah kasar basal kanan, suara napas menurun ringan di basis kanan',
      alert: true,
    },
    {
      organ: 'Perut (Abdomen)',
      result: 'Supel, bising usus normal, tidak ada nyeri tekan, hepar lien tidak teraba',
    },
    { organ: 'Ekstremitas', result: 'Akral hangat, edema tidak ada, perfusi perifer baik' },
  ],
  anomalyTags: [
    { text: 'SpO2 92%', type: 'HYPOXEMIA', tone: 'critical' },
    { text: 'RR 24 x/menit', type: 'TACHYPNEA', tone: 'warning' },
    { text: 'T 38.8 C', type: 'FEBRILE', tone: 'warning' },
    { text: 'Alergi Amoksisilin', type: 'ALLERGY', tone: 'critical' },
    { text: 'Hipertensi Terkontrol', type: 'COMORBID', tone: 'default' },
  ],
  clinicalReasoning: [
    {
      title: 'Pneumonia komunitas lobus bawah kanan',
      type: 'DIAGNOSIS KERJA',
      summary:
        'Paling sesuai karena ada demam, batuk produktif, ronki lokal, desaturasi, leukositosis, dan infiltrat fokal.',
      tone: 'primary',
    },
    {
      title: 'Bronkopneumonia bakterial',
      type: 'DIAGNOSIS BANDING',
      summary:
        'Masih mungkin bila distribusi infiltrat lebih menyebar, namun temuan saat ini lebih fokal di basal kanan.',
      tone: 'warning',
    },
    {
      title: 'ISPA virus dengan superinfeksi sekunder',
      type: 'DIAGNOSIS BANDING',
      summary:
        'Dipertimbangkan karena awal gejala menyerupai infeksi saluran napas atas, tetapi bukti bakteri lebih dominan.',
      tone: 'muted',
    },
  ],
  medications: [
    {
      name: 'Levofloxacin',
      regimen: '750 mg IV atau PO sesuai protokol fasilitas',
      note: 'Pilihan non-amoksisilin dipertimbangkan setelah verifikasi alergi, fungsi ginjal, dan risiko QT.',
      tone: 'primary',
    },
    {
      name: 'Parasetamol',
      regimen: '500-1000 mg sesuai protokol antipiretik',
      note: 'Untuk kontrol demam dan kenyamanan pasien selama observasi.',
      tone: 'supportive',
    },
  ],
  therapies: [
    {
      title: 'Stabilisasi awal dan monitoring',
      detail:
        'Berikan oksigen nasal kanul dengan target SpO2 94-96 persen, lalu monitor nadi, RR, suhu, dan respons klinis serial.',
      tone: 'urgent',
    },
    {
      title: 'Antibiotik empirik berbasis protokol',
      detail:
        'Hindari amoksisilin. Pilih regimen non-amoksisilin sesuai protokol fasilitas dan verifikasi ulang riwayat alergi beta-laktam sebelum pemberian.',
      tone: 'primary',
    },
    {
      title: 'Terapi suportif dan disposition',
      detail:
        'Berikan antipiretik, cairan adekuat, edukasi tanda bahaya, dan pertimbangkan observasi atau rawat inap karena hipoksemia dan takipnea.',
      tone: 'supportive',
    },
  ],
  routeTitle: 'Cabang sedang terpilih',
  routeDetail:
    'Pasien memerlukan observasi/rawat inap karena desaturasi ringan, takipnea, dan infiltrat fokal yang jelas.',
  routeReason: 'Severity sedang + kebutuhan oksigen awal + bukti CAP terkonfirmasi.',
  trajectoryInsight:
    'Respons awal terhadap oksigen dan terapi suportif terlihat membaik, tetapi kombinasi hipoksemia ringan, takipnea, dan infiltrat fokal tetap membuat kasus ini lebih aman diposisikan sebagai pneumonia yang perlu observasi ketat dan evaluasi lanjut.',
}

const MILD_BRANCH: SimulationBranch = {
  label: 'Ringan',
  severityLabel: 'CAP Ringan',
  headline: 'Rawat jalan dengan monitoring ketat',
  finalAnamnesaText: 'demam, batuk berdahak, dan nyeri dada ringan saat batuk',
  caseMetadata: ['Laki-laki, 29 tahun', 'Keluhan 2 hari', 'Severity ringan'],
  directedHistory: [
    'Demam 38.1 C dengan batuk produktif putih kekuningan, tanpa sesak saat istirahat.',
    'Masih mampu makan minum, tidak ada mual berat, dan tidak ada riwayat rawat inap paru sebelumnya.',
    'Tidak ada penurunan kesadaran, hemoptisis, atau nyeri dada berat.',
  ],
  historyNow: 'Keluhan dominan batuk berdahak dan demam, aktivitas harian masih cukup baik.',
  pastHistory: 'Tanpa komorbid mayor, tanpa riwayat alergi obat bermakna, non-perokok aktif.',
  positiveFlags:
    'Ronki lokal ringan dan infiltrat minimal, tetapi hemodinamik stabil dan oksigenasi baik.',
  negativeFlags: 'Tidak ada hipoksemia, hipotensi, takipnea berat, atau tanda sepsis.',
  allergies: [
    { label: 'Alergi obat', value: 'Tidak ada riwayat bermakna' },
    { label: 'Alergi makanan', value: 'Tidak ada' },
    { label: 'Obat rutin', value: 'Tidak ada' },
  ],
  anamnesaTags: [
    { text: 'Demam', type: 'SYMPTOM' },
    { text: 'Batuk Berdahak', type: 'SYMPTOM' },
    { text: 'Nyeri Dada Ringan', type: 'OBSERVATION' },
  ],
  vitals: [
    { label: 'GCS', value: '15', unit: 'E4V5M6' },
    { label: 'Tekanan Darah', value: '118/76', unit: 'mmHg' },
    { label: 'Nadi', value: '94', unit: 'bpm' },
    { label: 'Napas', value: '20', unit: 'x/m' },
    { label: 'Suhu', value: '38.1', unit: 'C', critical: true },
    { label: 'SpO2', value: '96', unit: '%' },
    { label: 'CRT', value: '< 2', unit: 'detik' },
  ],
  labRecommendations: BASE_LAB_RECOMMENDATIONS,
  labResults: [
    {
      name: 'Leukosit',
      value: '11.800/uL',
      interpretation: 'Peningkatan ringan sesuai infeksi awal',
    },
    { name: 'CRP', value: '24 mg/L', interpretation: 'Inflamasi ringan-sedang' },
    {
      name: 'Foto Toraks',
      value: 'Infiltrat minimal lobus bawah kanan',
      interpretation: 'Sesuai CAP ringan',
    },
  ],
  trajectoryPoints: [
    { label: 'Masuk', value: 'SpO2 96% / T 38.1 C' },
    { label: '1 Jam', value: 'SpO2 97% / T 37.8 C' },
    { label: 'Pulang', value: 'SpO2 97% / T 37.5 C' },
  ],
  trajectoryOxygenPolyline: '50,82 180,74 320,70 450,66',
  trajectoryTemperaturePolyline: '50,60 180,72 320,86 450,96',
  trajectoryFinalPoint: { x: 450, y: 66 },
  trajectoryMedications: [
    { name: 'Antibiotik oral', dosage: 'sesuai protokol rawat jalan' },
    { name: 'Antipiretik', dosage: 'sesuai kebutuhan' },
    { name: 'Hidrasi oral', dosage: 'adekuat' },
  ],
  physicalExamRows: [
    {
      organ: 'Kepala & Leher',
      result: 'Faring hiperemis ringan, mukosa lembap, tidak ada deviasi trakea',
    },
    {
      organ: 'Dada (Cor & Pulmo)',
      result: 'Ronki halus basal kanan, tanpa retraksi, ekspansi baik',
    },
    { organ: 'Perut (Abdomen)', result: 'Supel, tanpa nyeri tekan' },
    { organ: 'Ekstremitas', result: 'Akral hangat, perfusi baik, tanpa edema' },
  ],
  anomalyTags: [
    { text: 'Suhu 38.1 C', type: 'FEBRILE', tone: 'warning' },
    { text: 'Infiltrat minimal', type: 'IMAGING', tone: 'default' },
    { text: 'SpO2 96%', type: 'STABLE OXYGENATION', tone: 'default' },
  ],
  clinicalReasoning: [
    {
      title: 'Pneumonia komunitas ringan',
      type: 'DIAGNOSIS KERJA',
      summary:
        'Gejala respiratorik akut dengan infiltrat minimal dan tanpa red flag berat mendukung cabang ringan.',
      tone: 'primary',
    },
    {
      title: 'Bronkitis akut bakterial',
      type: 'DIAGNOSIS BANDING',
      summary: 'Masih mungkin, tetapi bukti radiologi membuat CAP lebih kuat.',
      tone: 'muted',
    },
  ],
  medications: [
    {
      name: 'Azitromisin oral',
      regimen: 'sesuai protokol fasilitas untuk CAP ringan',
      note: 'Cocok bila pasien stabil, toleransi oral baik, dan tidak ada kontraindikasi.',
      tone: 'primary',
    },
    {
      name: 'Parasetamol',
      regimen: 'sesuai kebutuhan demam/nyeri',
      note: 'Untuk kontrol simptomatik di rumah.',
      tone: 'supportive',
    },
  ],
  therapies: [
    {
      title: 'Edukasi rawat jalan',
      detail:
        'Instruksikan kontrol 24-48 jam atau lebih cepat bila sesak, demam persisten, atau intake menurun.',
      tone: 'supportive',
    },
    {
      title: 'Hidrasi dan istirahat',
      detail: 'Fokus pada asupan cairan, istirahat, dan kepatuhan antibiotik oral.',
      tone: 'supportive',
    },
  ],
  routeTitle: 'Cabang ringan terpilih',
  routeDetail:
    'Pasien memenuhi jalur rawat jalan terstruktur karena oksigenasi stabil dan bukti penyakit masih terbatas.',
  routeReason: 'Severity rendah + hasil penunjang ringan + tanpa red flag mayor.',
  trajectoryInsight:
    'Respons cepat terhadap terapi suportif dan tidak ada kebutuhan oksigen membuat observasi singkat di IGD cukup sebelum pulang terencana.',
}

const SEVERE_BRANCH: SimulationBranch = {
  label: 'Berat',
  severityLabel: 'CAP Berat',
  headline: 'Rawat inap intensif dengan bundle sepsis/respirasi',
  finalAnamnesaText:
    'demam tinggi, batuk produktif pekat, sesak berat saat istirahat, dan lemah umum progresif',
  caseMetadata: ['Perempuan, 68 tahun', 'Keluhan 4 hari', 'Severity berat'],
  directedHistory: [
    'Demam tinggi menetap, napas cepat, dan keluarga melihat pasien tampak mengantuk sejak pagi.',
    'Sesak muncul saat istirahat, intake sangat menurun, dan ada riwayat hipertensi serta diabetes.',
    'Batuk berdahak pekat tanpa hemoptisis, tetapi terdapat nyeri pleuritik dan kelemahan menyeluruh.',
  ],
  historyNow: 'Distres napas meningkat cepat, aktivitas sangat terbatas, dan intake oral buruk.',
  pastHistory: 'Hipertensi dan diabetes melitus tipe 2, dengan riwayat ruam setelah amoksisilin.',
  positiveFlags:
    'Hipoksemia berat, takipnea, takikardia, hipotensi relatif, dan infiltrat multilobar.',
  negativeFlags:
    'Belum ada henti napas atau penurunan GCS berat, tetapi risiko dekompensasi tinggi.',
  allergies: [
    { label: 'Alergi obat', value: 'Amoksisilin (ruam menyeluruh)', alert: true },
    { label: 'Komorbid', value: 'Hipertensi + DM tipe 2' },
    { label: 'Obat rutin', value: 'Amlodipin, metformin' },
  ],
  anamnesaTags: [
    { text: 'Sesak Saat Istirahat', type: 'RED FLAG' },
    { text: 'Demam Tinggi Persisten', type: 'SYMPTOM' },
    { text: 'Lemah Umum', type: 'SYSTEMIC' },
    { text: 'Produktif Pekat', type: 'SYMPTOM' },
  ],
  vitals: [
    { label: 'GCS', value: '14', unit: 'E4V4M6', critical: true },
    { label: 'Tekanan Darah', value: '98/64', unit: 'mmHg', critical: true },
    { label: 'Nadi', value: '124', unit: 'bpm', critical: true },
    { label: 'Napas', value: '32', unit: 'x/m', critical: true },
    { label: 'Suhu', value: '39.2', unit: 'C', critical: true },
    { label: 'SpO2', value: '86', unit: '%', critical: true },
    { label: 'CRT', value: '> 2', unit: 'detik', critical: true },
  ],
  labRecommendations: BASE_LAB_RECOMMENDATIONS,
  labResults: [
    { name: 'Leukosit', value: '19.400/uL', interpretation: 'Leukositosis berat', alert: true },
    { name: 'CRP', value: '168 mg/L', interpretation: 'Inflamasi berat', alert: true },
    {
      name: 'Foto Toraks',
      value: 'Infiltrat multilobar bilateral',
      interpretation: 'Sesuai CAP berat',
      alert: true,
    },
  ],
  trajectoryPoints: [
    { label: 'Masuk', value: 'SpO2 86% / T 39.2 C' },
    { label: '30 Menit O2', value: 'SpO2 91% / T 38.9 C' },
    { label: '2 Jam', value: 'SpO2 93% / T 38.4 C' },
  ],
  trajectoryOxygenPolyline: '50,128 180,110 320,90 450,78',
  trajectoryTemperaturePolyline: '50,28 180,40 320,54 450,68',
  trajectoryFinalPoint: { x: 450, y: 78 },
  trajectoryMedications: [
    { name: 'Oksigen high flow/NRM', dosage: 'sesuai target saturasi' },
    { name: 'Antibiotik IV', dosage: 'segera setelah kultur/protokol' },
    { name: 'Cairan resusitasi', dosage: 'sesuai evaluasi hemodinamik' },
  ],
  physicalExamRows: [
    {
      organ: 'Kepala & Leher',
      result: 'Mukosa kering, pasien tampak toksik, bicara terputus-putus',
      alert: true,
    },
    {
      organ: 'Dada (Cor & Pulmo)',
      result: 'Ronki kasar bilateral, retraksi ringan, suara napas menurun difus',
      alert: true,
    },
    { organ: 'Perut (Abdomen)', result: 'Supel, bising usus menurun ringan' },
    {
      organ: 'Ekstremitas',
      result: 'Akral lebih dingin, CRT memanjang, perfusi menurun',
      alert: true,
    },
  ],
  anomalyTags: [
    { text: 'SpO2 86%', type: 'SEVERE HYPOXEMIA', tone: 'critical' },
    { text: 'RR 32 x/menit', type: 'RESPIRATORY DISTRESS', tone: 'critical' },
    { text: 'BP 98/64', type: 'HEMODYNAMIC RISK', tone: 'critical' },
    { text: 'Multilobar infiltrate', type: 'IMAGING', tone: 'warning' },
  ],
  clinicalReasoning: [
    {
      title: 'Pneumonia komunitas berat',
      type: 'DIAGNOSIS KERJA',
      summary:
        'Kombinasi hipoksemia berat, takipnea, toksik sistemik, dan infiltrat multilobar mendorong cabang berat.',
      tone: 'primary',
    },
    {
      title: 'Sepsis akibat fokus paru',
      type: 'KOMPLIKASI',
      summary:
        'Perlu disingkirkan aktif dan ditatalaksana paralel karena perfusi mulai turun dan inflamasi sangat tinggi.',
      tone: 'warning',
    },
  ],
  medications: [
    {
      name: 'Antibiotik IV spektrum luas non-amoksisilin',
      regimen: 'sesuai protokol CAP berat dan status alergi',
      note: 'Mulai cepat setelah verifikasi alergi dan pertimbangan kultur bila feasible tanpa menunda terapi.',
      tone: 'urgent',
    },
    {
      name: 'Antipiretik IV/PO',
      regimen: 'sesuai protokol',
      note: 'Untuk kontrol demam sambil stabilisasi pernapasan dan hidrasi.',
      tone: 'supportive',
    },
  ],
  therapies: [
    {
      title: 'Bundle stabilisasi respirasi',
      detail:
        'Targetkan saturasi aman, evaluasi kebutuhan eskalasi oksigen, dan monitor serial kerja napas.',
      tone: 'urgent',
    },
    {
      title: 'Observasi intensif / rawat inap',
      detail:
        'Perlu disposition ke perawatan intensif atau monitored bed sesuai respons awal dan hemodinamika.',
      tone: 'primary',
    },
  ],
  routeTitle: 'Cabang berat terpilih',
  routeDetail:
    'Kasus masuk ke jalur rawat inap intensif karena hipoksemia berat, takipnea, dan beban inflamasi tinggi.',
  routeReason: 'Severity tinggi + hasil penunjang berat + red flag multipel.',
  trajectoryInsight:
    'Walau ada perbaikan parsial setelah oksigen awal, profil klinis tetap menunjukkan kebutuhan monitoring intensif dan intervensi agresif sejak fase awal.',
}

const SIMULATION_BRANCHES: Record<SeverityKey, SimulationBranch> = {
  ringan: MILD_BRANCH,
  sedang: MODERATE_BRANCH,
  berat: SEVERE_BRANCH,
}

function createInitialSimulationState(): SimulationState {
  return {
    isRunning: false,
    isComplete: false,
    status: STATUS_TEXT.idle,
    headerTone: 'muted',
    anamnesaText: '',
    anamnesaTagCount: 0,
    historyPhase: 'idle',
    showVitalsAnomaly: false,
    vitalsTagCount: 0,
    labOpen: false,
    selectedLabCount: 0,
    showLabResults: false,
    labResultCount: 0,
    trajectoryOpen: false,
    showTrajectoryInsight: false,
    showDiagnosis: false,
    diagnosisCount: 0,
    showManagement: false,
    managementCount: 0,
    vitalsRevealCount: 0,
    examRevealCount: 0,
    historyRevealCount: 0,
    showAnamnesaIdle: false,
    showPanel02: false,
    showPanel03: false,
    showPanel04: false,
  }
}

const HOMEPAGE_SIMULATION_PACE = 0.85

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    // Keep the same clinical sequence, with a measured homepage rhythm.
    window.setTimeout(resolve, Math.max(0, Math.round(milliseconds * HOMEPAGE_SIMULATION_PACE)))
  })
}

function getReasoningTone(tone: ReasoningTone): string {
  if (tone === 'primary') return 'primary'
  if (tone === 'warning') return 'warning'
  return 'muted'
}

function getPlanTone(tone: PlanTone): string {
  if (tone === 'urgent') return 'urgent'
  if (tone === 'primary') return 'primary'
  return 'supportive'
}

function getAnomalyTone(tone: AnomalyTone): string {
  if (tone === 'critical') return 'critical'
  if (tone === 'warning') return 'warning'
  return 'default'
}

function withRevealDelay(delayMs: number): CSSProperties {
  return { '--fi-cdss-reveal-delay': `${delayMs}ms` } as CSSProperties
}

export default function SentraSimSection() {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityKey>('sedang')
  const activeBranch = SIMULATION_BRANCHES[selectedSeverity]
  const [simulation, setSimulation] = useState<SimulationState>(() =>
    createInitialSimulationState(),
  )
  const isMountedRef = useRef(true)
  const isRunningRef = useRef(false)
  const complaintRef = useRef<HTMLElement>(null)
  const historyRef = useRef<HTMLElement>(null)
  const evidenceRef = useRef<HTMLElement>(null)
  const examRef = useRef<HTMLElement>(null)
  const desktopAssessmentRef = useRef<HTMLElement>(null)
  const mobileAssessmentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const patchSimulation = (patch: Partial<SimulationState>): void => {
    if (!isMountedRef.current) return

    setSimulation((previous) => ({ ...previous, ...patch }))
  }

  const focusSimulationStep = (target: SimulationFocusTarget): void => {
    if (typeof window === 'undefined') return

    const isMobileLayout = window.matchMedia('(max-width: 1180px)').matches
    const focusTargets = {
      complaint: complaintRef.current,
      history: historyRef.current,
      evidence: evidenceRef.current,
      exam: examRef.current,
      assessment: isMobileLayout ? mobileAssessmentRef.current : desktopAssessmentRef.current,
    }
    const node = focusTargets[target]

    if (!node) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.requestAnimationFrame(() => {
      node.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    })
  }

  const resetSimulation = (nextSeverity: SeverityKey = selectedSeverity): void => {
    if (isRunningRef.current) return

    setSelectedSeverity(nextSeverity)
    setSimulation(createInitialSimulationState())
  }

  const handleSelectSeverity = (nextSeverity: SeverityKey): void => {
    if (isRunningRef.current || nextSeverity === selectedSeverity) return
    resetSimulation(nextSeverity)
  }

  const runSimulation = async (): Promise<void> => {
    if (isRunningRef.current) {
      return
    }

    isRunningRef.current = true
    setSimulation(createInitialSimulationState())
    patchSimulation({ isRunning: true })
    focusSimulationStep('complaint')

    try {
      patchSimulation({
        status: STATUS_TEXT.synthesizing,
        headerTone: 'accent',
        anamnesaText: '',
      })

      let currentText = ''
      for (const word of activeBranch.finalAnamnesaText.split(' ')) {
        currentText = currentText ? `${currentText} ${word}` : word
        patchSimulation({ anamnesaText: currentText })
        await delay(150)
      }

      await delay(400)

      patchSimulation({ showAnamnesaIdle: true })
      await delay(800)

      for (let count = 1; count <= activeBranch.anamnesaTags.length; count += 1) {
        patchSimulation({ anamnesaTagCount: count })
        await delay(300)
      }

      await delay(400)
      patchSimulation({ showPanel02: true })
      await delay(150)
      patchSimulation({
        status: STATUS_TEXT.emr,
        historyPhase: 'loading',
      })
      focusSimulationStep('history')
      await delay(1500)

      patchSimulation({
        historyPhase: 'ready',
        status: STATUS_TEXT.synced,
      })

      for (let count = 1; count <= 4; count += 1) {
        await delay(280)
        patchSimulation({ historyRevealCount: count })
      }

      await delay(200)

      patchSimulation({ showPanel03: true })
      await delay(200)
      patchSimulation({ showVitalsAnomaly: true })
      focusSimulationStep('evidence')

      for (let count = 1; count <= activeBranch.vitals.length; count += 1) {
        patchSimulation({ vitalsRevealCount: count })
        await delay(140)
      }

      await delay(200)

      for (let count = 1; count <= activeBranch.anomalyTags.length; count += 1) {
        patchSimulation({ vitalsTagCount: count })
        await delay(200)
      }

      await delay(360)
      patchSimulation({ showPanel04: true })
      await delay(200)
      focusSimulationStep('exam')

      for (let count = 1; count <= activeBranch.physicalExamRows.length; count += 1) {
        patchSimulation({ examRevealCount: count })
        await delay(180)
      }

      await delay(200)

      patchSimulation({
        status: STATUS_TEXT.lab,
        labOpen: true,
      })
      await delay(700)

      for (let count = 1; count <= activeBranch.labRecommendations.length; count += 1) {
        patchSimulation({ selectedLabCount: count })
        await delay(360)
      }

      await delay(420)

      patchSimulation({
        status: STATUS_TEXT.evidence,
        showLabResults: true,
      })
      await delay(420)

      for (let count = 1; count <= activeBranch.labResults.length; count += 1) {
        patchSimulation({ labResultCount: count })
        await delay(320)
      }

      await delay(420)

      patchSimulation({
        status: STATUS_TEXT.trajectory,
        trajectoryOpen: true,
      })
      focusSimulationStep('evidence')
      await delay(800)

      patchSimulation({ showTrajectoryInsight: true })
      await delay(700)

      patchSimulation({
        status: STATUS_TEXT.diagnosis,
        showDiagnosis: true,
      })
      focusSimulationStep('assessment')
      await delay(420)

      for (let count = 1; count <= activeBranch.clinicalReasoning.length; count += 1) {
        patchSimulation({ diagnosisCount: count })
        await delay(320)
      }

      await delay(500)

      patchSimulation({
        status: STATUS_TEXT.management,
        showManagement: true,
      })
      focusSimulationStep('assessment')
      await delay(320)

      for (
        let count = 1;
        count <= activeBranch.medications.length + activeBranch.therapies.length;
        count += 1
      ) {
        patchSimulation({ managementCount: count })
        await delay(240)
      }

      await delay(800)

      patchSimulation({
        status: STATUS_TEXT.complete,
        isComplete: true,
      })
    } finally {
      isRunningRef.current = false
      patchSimulation({ isRunning: false })
    }
  }

  const visibleMedicationCount = Math.min(
    simulation.managementCount,
    activeBranch.medications.length,
  )
  const visibleTherapyCount = Math.max(
    simulation.managementCount - activeBranch.medications.length,
    0,
  )

  const renderAssessmentSection = (
    placement: 'desktop' | 'mobile',
    assessmentRef?: Ref<HTMLDivElement>,
  ): JSX.Element | null => {
    if (!simulation.showDiagnosis && !simulation.showManagement) {
      return null
    }

    return (
      <div
        ref={assessmentRef}
        className={`fi-cdss-assessment fi-cdss-assessment-${placement}`}
        style={sentraSimGeorgiaFontStyle}
      >
        {simulation.showDiagnosis ? (
          <div className="fi-cdss-rail-panel" style={sentraSimGeorgiaFontStyle}>
            <TextScramble
              as="div"
              className="fi-cdss-rail-head is-accent"
              duration={0.65}
              key={`${placement}-assessment-title-${selectedSeverity}`}
              speed={0.022}
              style={sentraSimGeorgiaFontStyle}
            >
              05. Asesmen Klinis & Tatalaksana Awal
            </TextScramble>
            <div
              className="fi-cdss-route-card fi-cdss-reveal-card"
              data-severity={selectedSeverity}
              data-visible={simulation.showDiagnosis ? 'true' : 'false'}
              style={{ ...withRevealDelay(40), ...sentraSimGeorgiaFontStyle }}
            >
              <small>{activeBranch.routeTitle}</small>
              <strong>{activeBranch.routeDetail}</strong>
              <div aria-hidden="true" className="fi-cdss-route-divider" />
              <p>{activeBranch.routeReason}</p>
            </div>
            <div className="fi-cdss-subhead" style={sentraSimGeorgiaFontStyle}>
              Clinical reasoning output
            </div>
            <div className="fi-cdss-reasoning-list">
              {activeBranch.clinicalReasoning.map((item, index) => (
                <div
                  className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                  data-tone={getReasoningTone(item.tone)}
                  data-visible={index < simulation.diagnosisCount ? 'true' : 'false'}
                  key={item.title}
                  style={{ ...withRevealDelay(90 + index * 70), ...sentraSimGeorgiaFontStyle }}
                >
                  <small>{item.type}</small>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {simulation.showManagement ? (
          <div className="fi-cdss-rail-panel" style={sentraSimGeorgiaFontStyle}>
            <div className="fi-cdss-rail-head" style={sentraSimGeorgiaFontStyle}>
              Obat & Terapi
            </div>
            <div className="fi-cdss-subhead" style={sentraSimGeorgiaFontStyle}>
              Medication and disposition
            </div>
            <div className="fi-cdss-reasoning-list">
              {activeBranch.medications.map((item, index) => (
                <div
                  className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                  data-tone={getPlanTone(item.tone)}
                  data-visible={index < visibleMedicationCount ? 'true' : 'false'}
                  key={item.name}
                  style={{ ...withRevealDelay(50 + index * 55), ...sentraSimGeorgiaFontStyle }}
                >
                  <small>Obat</small>
                  <strong>{item.name}</strong>
                  <p>{item.regimen}</p>
                  <p>{item.note}</p>
                </div>
              ))}
              {activeBranch.therapies.map((step, index) => (
                <div
                  className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                  data-tone={getPlanTone(step.tone)}
                  data-visible={index < visibleTherapyCount ? 'true' : 'false'}
                  key={step.title}
                  style={{ ...withRevealDelay(170 + index * 55), ...sentraSimGeorgiaFontStyle }}
                >
                  <small>Terapi</small>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <section
        aria-labelledby="cdss-sim-title"
        className="fi-section fi-cdss-sim fi-cdss-sim-source fi-cdss-sim-hero-dark"
        id="sentra-sim"
        data-theme="light"
        style={sentraSimThemeStyle}
      >
        <div className="fi-cdss-main" style={sentraSimGeorgiaFontStyle}>
          <header
            className="fi-cdss-hero fi-cdss-hero-numbered"
            id="cdss-sim-overview"
            style={sentraSimGeorgiaFontStyle}
          >
            <SectionNumberMark number="03" />
            <div className="fi-cdss-titleblock">
              <span className="fi-kicker">Simulasi Langsung</span>
              <h2 className="fi-section-title" id="cdss-sim-title">
                Lihat Bagaimana Sentra Memproses Cabang Severity Nyata
              </h2>
              <p className="fi-section-lead">
                Pilih skenario klinis untuk melihat bagaimana Sentra memproses keluhan, data vital,
                pemeriksaan penunjang, pertimbangan diagnosis, disposisi, obat, dan rencana terapi
                berdasarkan tingkat keparahan pasien.
              </p>
              <div className="fi-cdss-severity" aria-label="Severity selection">
                {(Object.entries(SIMULATION_BRANCHES) as [SeverityKey, SimulationBranch][]).map(
                  ([key, branch]) => (
                    <button
                      aria-pressed={key === selectedSeverity}
                      className="fi-cdss-chip"
                      data-active={key === selectedSeverity}
                      data-severity={key}
                      disabled={simulation.isRunning}
                      key={key}
                      onClick={() => handleSelectSeverity(key)}
                      type="button"
                    >
                      <span>{branch.label}</span>
                    </button>
                  ),
                )}
              </div>
              <div className="fi-cdss-preview" style={sentraSimGeorgiaFontStyle}>
                <div className="fi-cdss-meta" style={sentraSimGeorgiaFontStyle}>
                  {activeBranch.caseMetadata.map((entry) => (
                    <span className="fi-cdss-meta-item" key={entry}>
                      {entry}
                    </span>
                  ))}
                </div>
                <TextScramble
                  as="p"
                  className="fi-cdss-headline"
                  duration={1.2}
                  speed={0.018}
                  characterSet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,/-:"
                  style={sentraSimGeorgiaFontStyle}
                >
                  {activeBranch.headline}
                </TextScramble>
                <div className="fi-cdss-actions" style={sentraSimGeorgiaFontStyle}>
                  <button
                    className="fi-cdss-button fi-cdss-button-primary"
                    disabled={simulation.isRunning}
                    onClick={runSimulation}
                    type="button"
                    style={sentraSimGeorgiaFontStyle}
                  >
                    {simulation.isComplete
                      ? 'Ulangi Simulasi'
                      : simulation.isRunning
                        ? 'Memproses Kasus...'
                        : `Mulai Cabang ${activeBranch.label}`}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <TextScramble
            as="div"
            className="fi-cdss-status"
            data-tone={simulation.headerTone}
            duration={0.9}
            speed={0.02}
            characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /:.-_"
            key={simulation.status}
            style={sentraSimGeorgiaFontStyle}
          >
            {simulation.status}
          </TextScramble>

          <div className="fi-cdss-body" style={sentraSimGeorgiaFontStyle}>
            <div className="fi-cdss-column" style={sentraSimGeorgiaFontStyle}>
              <article
                ref={complaintRef}
                className="fi-cdss-panel fi-cdss-panel-complaint"
                id="cdss-sim-complaint"
                style={sentraSimGeorgiaFontStyle}
              >
                <div className="fi-cdss-panel-head">
                  <span>01. Keluhan Utama & Anamnesis Terarah</span>
                  <strong>Keluhan Utama & Anamnesis Terarah</strong>
                </div>
                {simulation.anamnesaText ? (
                  <p className="fi-cdss-complaint">
                    Pasien datang dengan keluhan <span>{simulation.anamnesaText}</span> dengan pola
                    yang mengarah ke{' '}
                    <strong className="fi-cdss-inline-emphasis">
                      {activeBranch.severityLabel.toLowerCase()}
                    </strong>
                    .
                  </p>
                ) : (
                  <p className="fi-cdss-complaint fi-cdss-empty">
                    Keluhan belum diproses. Tekan tombol simulasi untuk melihat sistem mengetik
                    gejala dan mengisi asesmen bertahap.
                  </p>
                )}
                {simulation.anamnesaTagCount > 0 ? (
                  <div className="fi-cdss-directed-grid">
                    {activeBranch.directedHistory.map((item) => (
                      <div className="fi-cdss-note-card" key={item}>
                        {item}
                      </div>
                    ))}
                  </div>
                ) : simulation.showAnamnesaIdle ? (
                  <div className="fi-cdss-anamnesis-idle">
                    <p className="fi-cdss-anamnesis-idle-intro">
                      Anamnesis diarahkan terlebih dahulu untuk menangkap keluhan inti, sinyal
                      risiko, dan cabang severity sebelum sistem bergerak ke riwayat detail.
                    </p>
                    <div className="fi-cdss-directed-grid fi-cdss-directed-grid-idle">
                      {ANAMNESA_IDLE_STEPS.map((step) => (
                        <div
                          className="fi-cdss-note-card fi-cdss-idle-card fi-cdss-anamnesis-card"
                          key={step.title}
                        >
                          <small>{step.label}</small>
                          <strong>{step.title}</strong>
                          <p>{step.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>

              {simulation.showPanel02 ? (
                <article
                  ref={historyRef}
                  className="fi-cdss-panel fi-cdss-panel-history"
                  id="cdss-sim-history"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-panel-head">
                    <span>02. Riwayat Penyakit, Alergi, dan Red Flag</span>
                    <strong>Riwayat Penyakit, Alergi, dan Red Flag</strong>
                  </div>
                  {simulation.historyPhase === 'loading' ? (
                    <p className="fi-cdss-loading">
                      [SYSTEM: RETRIEVING EMR, ALLERGY, AND PREVIOUS VISITS...]
                    </p>
                  ) : null}
                  {simulation.historyPhase === 'ready' ? (
                    <div className="fi-cdss-history-grid">
                      <div className="fi-cdss-history-main">
                        <div
                          className="fi-cdss-fade-card"
                          data-visible={simulation.historyRevealCount >= 1 ? 'true' : 'false'}
                        >
                          <small>Riwayat Penyakit Sekarang</small>
                          <p>
                            <TextScramble
                              as="span"
                              duration={0.9}
                              key={`hist-now-${selectedSeverity}`}
                              speed={0.042}
                              trigger={simulation.historyRevealCount >= 1}
                            >
                              {activeBranch.historyNow}
                            </TextScramble>
                          </p>
                        </div>
                        <div
                          className="fi-cdss-fade-card"
                          data-visible={simulation.historyRevealCount >= 2 ? 'true' : 'false'}
                        >
                          <small>Riwayat Penyakit Dahulu</small>
                          <p>
                            <TextScramble
                              as="span"
                              duration={0.9}
                              key={`hist-past-${selectedSeverity}`}
                              speed={0.042}
                              trigger={simulation.historyRevealCount >= 2}
                            >
                              {activeBranch.pastHistory}
                            </TextScramble>
                          </p>
                        </div>
                        <div
                          className="fi-cdss-flag-grid fi-cdss-reveal-card"
                          data-visible={simulation.historyRevealCount >= 3 ? 'true' : 'false'}
                        >
                          <div className="fi-cdss-flag-card" data-tone="warning">
                            <small>Red Flag Positif</small>
                            <p>{activeBranch.positiveFlags}</p>
                          </div>
                          <div className="fi-cdss-flag-card">
                            <small>Red Flag Negatif</small>
                            <p>{activeBranch.negativeFlags}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="fi-cdss-side-table fi-cdss-reveal-card"
                        data-visible={simulation.historyRevealCount >= 4 ? 'true' : 'false'}
                      >
                        <small>Alergi & Obat Rutin</small>
                        {activeBranch.allergies.map((row) => (
                          <div className="fi-cdss-table-row" key={row.label}>
                            <span>{row.label}</span>
                            <strong data-alert={row.alert ? 'true' : 'false'}>{row.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="fi-cdss-history-grid fi-cdss-idle-grid">
                      <div className="fi-cdss-history-main">
                        <div className="fi-cdss-note-card fi-cdss-idle-card">
                          <small>Riwayat Penyakit Sekarang</small>
                          <p>
                            Kronologi gejala, progres keluhan, dan konteks paparan akan dirakit
                            setelah anamnesis utama terbaca.
                          </p>
                        </div>
                        <div className="fi-cdss-note-card fi-cdss-idle-card">
                          <small>Riwayat Penyakit Dahulu</small>
                          <p>
                            Komorbid lama, rawat inap sebelumnya, dan faktor risiko baseline akan
                            muncul setelah EMR mulai dipanggil.
                          </p>
                        </div>
                        <div className="fi-cdss-flag-grid">
                          <div className="fi-cdss-flag-card fi-cdss-idle-card" data-tone="warning">
                            <small>Red Flag Positif</small>
                            <p>
                              Tanda bahaya prioritas akan dipetakan begitu pola sesak, demam,
                              saturasi, dan alergi mulai terbaca bersama.
                            </p>
                          </div>
                          <div className="fi-cdss-flag-card fi-cdss-idle-card">
                            <small>Red Flag Negatif</small>
                            <p>
                              Temuan yang belum terdeteksi akan tetap dicatat sebagai penyangga
                              keputusan sebelum eskalasi klinis.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="fi-cdss-side-table fi-cdss-idle-table">
                        <small>Alergi & Obat Rutin</small>
                        <div className="fi-cdss-table-row">
                          <span>Alergi obat</span>
                          <strong>menunggu</strong>
                        </div>
                        <div className="fi-cdss-table-row">
                          <span>Komorbid</span>
                          <strong>menunggu</strong>
                        </div>
                        <div className="fi-cdss-table-row">
                          <span>Obat rutin</span>
                          <strong>menunggu</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ) : null}

              {simulation.showPanel03 ? (
                <article
                  ref={evidenceRef}
                  className="fi-cdss-panel fi-cdss-panel-evidence"
                  id="cdss-sim-evidence"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-panel-head">
                    <span>03. Tanda Vital, Lab, dan Bukti Objektif</span>
                    <strong>Tanda Vital, Lab, dan Bukti Objektif</strong>
                  </div>
                  <div className="fi-cdss-vitals-grid">
                    {activeBranch.vitals.map((item, index) => {
                      const isRevealed = index < simulation.vitalsRevealCount
                      return (
                        <div
                          className="fi-cdss-vital-card fi-cdss-fade-card"
                          data-idle={!simulation.showVitalsAnomaly ? 'true' : 'false'}
                          data-visible={
                            simulation.showVitalsAnomaly
                              ? isRevealed
                                ? 'true'
                                : 'false'
                              : undefined
                          }
                          key={item.label}
                        >
                          <small>{item.label}</small>
                          <strong data-critical={isRevealed && item.critical ? 'true' : 'false'}>
                            {isRevealed ? (
                              <TextScramble
                                as="span"
                                duration={0.5}
                                key={`vital-${item.label}-${selectedSeverity}`}
                                speed={0.04}
                                trigger={isRevealed}
                              >
                                {item.value}
                              </TextScramble>
                            ) : (
                              '–'
                            )}
                          </strong>
                          <span>{isRevealed ? item.unit : 'triage feed'}</span>
                        </div>
                      )
                    })}
                  </div>

                  {simulation.showVitalsAnomaly ? null : (
                    <p className="fi-cdss-evidence-idle-note">
                      Bukti objektif akan aktif setelah triase awal membaca keluhan, respirasi,
                      temperatur, dan saturasi secara bersamaan.
                    </p>
                  )}

                  <div className="fi-cdss-lab-toggle">
                    <button
                      aria-controls="fi-cdss-lab-panel"
                      aria-expanded={simulation.labOpen}
                      className="fi-cdss-inline-button"
                      disabled={simulation.isRunning}
                      onClick={() => patchSimulation({ labOpen: !simulation.labOpen })}
                      type="button"
                    >
                      {simulation.labOpen
                        ? 'Pemeriksaan terpilih karena dicurigai pneumonia'
                        : 'Buka pemeriksaan penunjang'}
                    </button>
                  </div>

                  {simulation.labOpen ? (
                    <div
                      className="fi-cdss-lab-panel"
                      id="fi-cdss-lab-panel"
                      style={sentraSimTransparentSurfaceStyle}
                    >
                      <div className="fi-cdss-lab-list">
                        {activeBranch.labRecommendations.map((item, index) => {
                          const isSelected = index < simulation.selectedLabCount

                          return (
                            <div className="fi-cdss-lab-row" key={item.name}>
                              <div>
                                <span className="fi-cdss-check">[{isSelected ? 'x' : ' '}]</span>
                                <strong>{item.name}</strong>
                              </div>
                              {isSelected ? <small>{item.status}</small> : null}
                            </div>
                          )
                        })}
                      </div>

                      {simulation.showLabResults ? (
                        <div className="fi-cdss-lab-results">
                          {activeBranch.labResults
                            .slice(0, simulation.labResultCount)
                            .map((item) => (
                              <div
                                className="fi-cdss-result-card"
                                data-alert={item.alert ? 'true' : 'false'}
                                key={item.name}
                              >
                                <small>{item.name}</small>
                                <strong>{item.value}</strong>
                                <p>{item.interpretation}</p>
                              </div>
                            ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {simulation.trajectoryOpen ? (
                    <div className="fi-cdss-trajectory">
                      <div
                        className="fi-cdss-trajectory-head"
                        style={sentraSimTransparentSurfaceStyle}
                      >
                        <span style={sentraSimTransparentSurfaceStyle}>
                          Trajektori Respons Awal
                        </span>
                        <button
                          className="fi-cdss-inline-button"
                          disabled={simulation.isRunning}
                          onClick={() => patchSimulation({ trajectoryOpen: false })}
                          type="button"
                        >
                          [X] CLOSE
                        </button>
                      </div>
                      <p className="fi-cdss-trajectory-intro">
                        Oksigenasi dan temperatur dibaca berdampingan untuk melihat apakah
                        intervensi awal benar-benar menggeser kondisi pasien ke arah yang lebih
                        aman.
                      </p>
                      <div className="fi-cdss-trajectory-grid">
                        <div className="fi-cdss-trajectory-chart">
                          <div className="fi-cdss-trajectory-legend" aria-hidden="true">
                            <span className="is-primary">Oksigenasi</span>
                            <span className="is-secondary">Temperatur</span>
                          </div>
                          <svg
                            aria-label="Patient response trajectory chart"
                            preserveAspectRatio="none"
                            viewBox="0 0 500 160"
                          >
                            <line x1="0" x2="500" y1="30" y2="30" />
                            <line x1="0" x2="500" y1="80" y2="80" />
                            <line x1="0" x2="500" y1="130" y2="130" />
                            <polyline
                              fill="none"
                              points={activeBranch.trajectoryOxygenPolyline}
                              strokeWidth="2"
                            />
                            <polyline
                              className="is-secondary"
                              fill="none"
                              points={activeBranch.trajectoryTemperaturePolyline}
                              strokeWidth="2"
                            />
                            <circle
                              cx={activeBranch.trajectoryFinalPoint.x}
                              cy={activeBranch.trajectoryFinalPoint.y}
                              r="4"
                            />
                          </svg>
                        </div>
                        <div className="fi-cdss-trajectory-list">
                          {activeBranch.trajectoryPoints.map((point) => (
                            <div className="fi-cdss-table-row" key={point.label}>
                              <span>{point.label}</span>
                              <strong>{point.value}</strong>
                            </div>
                          ))}
                          <div className="fi-cdss-trajectory-medications">
                            {activeBranch.trajectoryMedications.map((medication) => (
                              <div className="fi-cdss-trajectory-pill" key={medication.name}>
                                <span>{medication.name}</span>
                                <strong>{medication.dosage}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              ) : null}

              {simulation.showPanel04 ? (
                <article
                  ref={examRef}
                  className="fi-cdss-panel fi-cdss-panel-exam"
                  id="cdss-sim-exam"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-panel-head">
                    <span>04. Pemeriksaan Fisik Head-to-Toe</span>
                    <strong>Pemeriksaan Fisik Head-to-Toe</strong>
                  </div>
                  {simulation.showVitalsAnomaly ? (
                    <div className="fi-cdss-exam-list">
                      {activeBranch.physicalExamRows.map((row, index) => {
                        const isRevealed = index < simulation.examRevealCount
                        return (
                          <div
                            className="fi-cdss-exam-row fi-cdss-fade-card"
                            data-visible={isRevealed ? 'true' : 'false'}
                            key={row.organ}
                          >
                            <span>{row.organ}</span>
                            <strong data-alert={row.alert ? 'true' : 'false'}>
                              {isRevealed ? (
                                <TextScramble
                                  as="span"
                                  duration={0.6}
                                  key={`exam-${row.organ}-${selectedSeverity}`}
                                  speed={0.04}
                                  trigger={isRevealed}
                                >
                                  {row.result}
                                </TextScramble>
                              ) : null}
                            </strong>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="fi-cdss-exam-list fi-cdss-idle-grid">
                      <div className="fi-cdss-exam-row fi-cdss-idle-row">
                        <span>Kepala & Leher</span>
                        <strong>Menunggu observasi awal dan keluhan utama.</strong>
                      </div>
                      <div className="fi-cdss-exam-row fi-cdss-idle-row">
                        <span>Dada (Cor & Pulmo)</span>
                        <strong>
                          Pemeriksaan fisik akan muncul setelah tanda vital mulai terisi.
                        </strong>
                      </div>
                      <div className="fi-cdss-exam-row fi-cdss-idle-row">
                        <span>Ekstremitas</span>
                        <strong>
                          Context perfusi, edema, dan status perifer masih menunggu input.
                        </strong>
                      </div>
                    </div>
                  )}
                </article>
              ) : null}

              {renderAssessmentSection('mobile', mobileAssessmentRef)}

              <input
                aria-label="Composer asesmen pratinjau"
                className="fi-cdss-composer"
                placeholder="Ketik asesmen tambahan atau ketik '/' untuk perintah..."
                readOnly
                style={sentraSimComposerStyle}
                type="text"
              />
            </div>

            <aside
              ref={desktopAssessmentRef}
              className="fi-cdss-rail"
              id="cdss-sim-assessment"
              style={sentraSimGeorgiaFontStyle}
            >
              <div className="fi-cdss-rail-summary">
                <span>Observation rail / passive until simulation runs</span>
              </div>
              <div className="fi-cdss-rail-panel" style={sentraSimGeorgiaFontStyle}>
                <div className="fi-cdss-rail-head" style={sentraSimGeorgiaFontStyle}>
                  Artificial Intelligence Entity: Anamnesa
                </div>
                <div className="fi-cdss-tag-list" style={sentraSimGeorgiaFontStyle}>
                  {simulation.anamnesaTagCount > 0 ? (
                    activeBranch.anamnesaTags.slice(0, simulation.anamnesaTagCount).map((tag) => (
                      <div
                        className="fi-cdss-tag-row"
                        key={tag.text}
                        style={sentraSimGeorgiaFontStyle}
                      >
                        <div>
                          <span className="fi-cdss-tag-dot" />
                          <strong>{tag.text}</strong>
                        </div>
                        <small>{tag.type}</small>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="fi-cdss-rail-mini-list">
                        <div className="fi-cdss-rail-mini-row">
                          <span>Input</span>
                          <strong>keluhan inti</strong>
                        </div>
                        <div className="fi-cdss-rail-mini-row">
                          <span>Output</span>
                          <strong>entity gejala</strong>
                        </div>
                        <div className="fi-cdss-rail-mini-row">
                          <span>Status</span>
                          <strong>idle</strong>
                        </div>
                      </div>
                      <p className="fi-cdss-empty">
                        Menunggu keluhan utama agar mesin dapat mulai mengekstrak gejala, durasi,
                        dan konteks awal pasien.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {simulation.showVitalsAnomaly ? (
                <div className="fi-cdss-rail-panel" style={sentraSimGeorgiaFontStyle}>
                  <div className="fi-cdss-rail-head is-alert" style={sentraSimGeorgiaFontStyle}>
                    Triage Alert & Context
                  </div>
                  <div className="fi-cdss-tag-list" style={sentraSimGeorgiaFontStyle}>
                    {activeBranch.anomalyTags.slice(0, simulation.vitalsTagCount).map((tag) => (
                      <div
                        className="fi-cdss-tag-row"
                        data-tone={getAnomalyTone(tag.tone)}
                        key={tag.text}
                        style={sentraSimGeorgiaFontStyle}
                      >
                        <div>
                          <span className="fi-cdss-tag-dot" />
                          <strong>{tag.text}</strong>
                        </div>
                        <small>{tag.type}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="fi-cdss-rail-panel fi-cdss-rail-panel-idle"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-rail-head is-alert" style={sentraSimGeorgiaFontStyle}>
                    Triage Alert & Context
                  </div>
                  <div className="fi-cdss-rail-mini-list">
                    <div className="fi-cdss-rail-mini-row">
                      <span>Trigger</span>
                      <strong>vital + alergi</strong>
                    </div>
                    <div className="fi-cdss-rail-mini-row">
                      <span>Focus</span>
                      <strong>red flag klinis</strong>
                    </div>
                  </div>
                  <p className="fi-cdss-empty">
                    Alert akan muncul setelah sistem membaca tanda vital, alergi, dan red flag
                    utama.
                  </p>
                </div>
              )}

              {simulation.showDiagnosis ? (
                <div
                  className="fi-cdss-rail-panel fi-cdss-rail-assessment"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <TextScramble
                    as="div"
                    className="fi-cdss-rail-head is-accent"
                    duration={0.65}
                    key={`assessment-title-${selectedSeverity}`}
                    speed={0.022}
                    style={sentraSimGeorgiaFontStyle}
                  >
                    05. Asesmen Klinis & Tatalaksana Awal
                  </TextScramble>
                  <div
                    className="fi-cdss-route-card fi-cdss-reveal-card"
                    data-severity={selectedSeverity}
                    data-visible={simulation.showDiagnosis ? 'true' : 'false'}
                    style={{ ...withRevealDelay(40), ...sentraSimGeorgiaFontStyle }}
                  >
                    <small>{activeBranch.routeTitle}</small>
                    <strong>{activeBranch.routeDetail}</strong>
                    <div aria-hidden="true" className="fi-cdss-route-divider" />
                    <p>{activeBranch.routeReason}</p>
                  </div>
                  <div className="fi-cdss-subhead" style={sentraSimGeorgiaFontStyle}>
                    Clinical reasoning output
                  </div>
                  <div className="fi-cdss-reasoning-list">
                    {activeBranch.clinicalReasoning.map((item, index) => (
                      <div
                        className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                        data-tone={getReasoningTone(item.tone)}
                        data-visible={index < simulation.diagnosisCount ? 'true' : 'false'}
                        key={item.title}
                        style={{
                          ...withRevealDelay(90 + index * 70),
                          ...sentraSimGeorgiaFontStyle,
                        }}
                      >
                        <small>{item.type}</small>
                        <strong>{item.title}</strong>
                        <p>{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {simulation.showManagement ? (
                <div
                  className="fi-cdss-rail-panel fi-cdss-rail-assessment"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-rail-head" style={sentraSimGeorgiaFontStyle}>
                    Obat & Terapi
                  </div>
                  <div className="fi-cdss-subhead" style={sentraSimGeorgiaFontStyle}>
                    Medication and disposition
                  </div>
                  <div className="fi-cdss-reasoning-list">
                    {activeBranch.medications.map((item, index) => (
                      <div
                        className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                        data-tone={getPlanTone(item.tone)}
                        data-visible={index < visibleMedicationCount ? 'true' : 'false'}
                        key={item.name}
                        style={{
                          ...withRevealDelay(50 + index * 55),
                          ...sentraSimGeorgiaFontStyle,
                        }}
                      >
                        <small>Obat</small>
                        <strong>{item.name}</strong>
                        <p>{item.regimen}</p>
                        <p>{item.note}</p>
                      </div>
                    ))}
                    {activeBranch.therapies.map((step, index) => (
                      <div
                        className="fi-cdss-reasoning-card fi-cdss-reveal-card"
                        data-tone={getPlanTone(step.tone)}
                        data-visible={index < visibleTherapyCount ? 'true' : 'false'}
                        key={step.title}
                        style={{
                          ...withRevealDelay(170 + index * 55),
                          ...sentraSimGeorgiaFontStyle,
                        }}
                      >
                        <small>Terapi</small>
                        <strong>{step.title}</strong>
                        <p>{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {simulation.showTrajectoryInsight ? (
                <div className="fi-cdss-rail-panel" style={sentraSimGeorgiaFontStyle}>
                  <div className="fi-cdss-rail-head is-accent" style={sentraSimGeorgiaFontStyle}>
                    AI Trajectory Insight
                  </div>
                  <TextScramble
                    as="p"
                    className="fi-cdss-insight"
                    duration={0.85}
                    key={`trajectory-insight-${selectedSeverity}`}
                    speed={0.022}
                    style={{ ...sentraSimTransparentSurfaceStyle, ...sentraSimGeorgiaFontStyle }}
                  >
                    {activeBranch.trajectoryInsight}
                  </TextScramble>
                </div>
              ) : (
                <div
                  className="fi-cdss-rail-panel fi-cdss-rail-panel-idle"
                  style={sentraSimGeorgiaFontStyle}
                >
                  <div className="fi-cdss-rail-head is-accent" style={sentraSimGeorgiaFontStyle}>
                    AI Trajectory Insight
                  </div>
                  <div className="fi-cdss-rail-mini-list">
                    <div className="fi-cdss-rail-mini-row">
                      <span>Awaiting</span>
                      <strong>bukti objektif</strong>
                    </div>
                    <div className="fi-cdss-rail-mini-row">
                      <span>Readout</span>
                      <strong>respons awal</strong>
                    </div>
                  </div>
                  <p className="fi-cdss-empty">
                    Insight trajektori akan aktif setelah bukti objektif dan respons awal pasien
                    mulai terbaca.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
