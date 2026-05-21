// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyActionProtocolId,
  SymphonyAlert,
  SymphonyAlertSeverity,
  SymphonySafetyGate,
} from '../contracts'
import { attachSymphonyActionProtocol } from '../engine/action-protocols'

export type AssistPatternParityId = `CP-${string}`

export type AssistPatternParityGate =
  | 'GATE_SEPSIS_EARLY'
  | 'GATE_SEPTIC_SHOCK_HIGH'
  | 'GATE_SHOCK_INDEX'
  | 'GATE_RESP_FAILURE'
  | 'GATE_PE_SUSPECT'
  | 'GATE_ACS'
  | 'GATE_STROKE'
  | 'GATE_ANAPHYLAXIS'
  | 'GATE_DKA_HHS'
  | 'GATE_RESP_ASTHMA_COPD'
  | 'GATE_ANEMIA_BLEED_CHRONIC'

export type AssistPatternParityTier = 'A' | 'B' | 'C'

export type AssistPatternCriterionOp =
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'
  | 'eq'
  | 'neq'
  | 'true'
  | 'false'
  | 'between'
  | 'in'

export interface AssistPatternParityCriterion {
  field: string
  op: AssistPatternCriterionOp
  value: number | string | boolean | readonly [number, number]
  label?: string
}

export interface AssistPatternParityCriteria {
  required: readonly AssistPatternParityCriterion[]
  scored: readonly AssistPatternParityCriterion[]
  minScore?: number
}

export interface AssistPatternParityDefinition {
  id: AssistPatternParityId
  gate: AssistPatternParityGate
  severity: Extract<SymphonyAlertSeverity, 'critical' | 'high' | 'warning'>
  tier: AssistPatternParityTier
  title: string
  reasoning: string
  criteria: AssistPatternParityCriteria
  recommendations: readonly string[]
  actionProtocolId?: SymphonyActionProtocolId
  requiresVitals?: readonly string[]
  source: string
  differentials?: readonly string[]
  supersededBy?: readonly string[]
  confidenceWeight?: number
  sourceFile: 'apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts'
}

export function mapAssistPatternParityGateToSymphonySafetyGate(
  gate: AssistPatternParityGate
): SymphonySafetyGate {
  switch (gate) {
    case 'GATE_SEPSIS_EARLY':
    case 'GATE_SEPTIC_SHOCK_HIGH':
      return 'GATE_5_SEPSIS'
    case 'GATE_SHOCK_INDEX':
      return 'GATE_4_OCCULT_SHOCK'
    case 'GATE_RESP_FAILURE':
    case 'GATE_RESP_ASTHMA_COPD':
      return 'GATE_6_RESPIRATORY'
    case 'GATE_PE_SUSPECT':
      return 'GATE_9_PE'
    case 'GATE_ANAPHYLAXIS':
      return 'GATE_10_ANAPHYLAXIS'
    case 'GATE_DKA_HHS':
      return 'GATE_3_GLUCOSE'
    case 'GATE_ACS':
      return 'GATE_11_ACS'
    case 'GATE_STROKE':
      return 'GATE_12_STROKE'
    case 'GATE_ANEMIA_BLEED_CHRONIC':
      return 'GATE_13_ANEMIA_BLEED'
  }
}

export interface AdaptAssistPatternToSymphonyAlertOptions {
  triggeredAt?: string
  acknowledged?: boolean
}

export interface AssistPatternParityFixtureCase {
  patternId: AssistPatternParityId
  expectedAlertId: string
  expectedSeverity: SymphonyAlert['severity']
  expectedGate: AssistPatternParityGate
  expectedTitle: string
}

export interface AssistPatternParityFixtureResult {
  patternId: AssistPatternParityId
  passed: boolean
  mismatches: string[]
  alert: SymphonyAlert
}

export const ASSIST_PATTERN_PARITY_DEFINITIONS = [
  {
    id: 'CP-001',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "A",
    title: "Sepsis suspected — qSOFA {rr}/{sbp}",
    reasoning: "qSOFA >=2: RR >=22, SBP <=100, atau perubahan mental. Sejalan dengan kriteria qSOFA (JAMA 2016).",
    criteria: {
      required: [],
      scored: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.sbp",
          op: "lte",
          value: 100,
          label: "SBP <= 100"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        }
      ],
      minScore: 2
    },
    recommendations: [
      "Ulang vital sign dalam 15-30 menit",
      "Cari fokus infeksi",
      "Pertimbangkan cairan bila tidak kontraindikasi",
      "Lapor dokter segera"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "rr",
      "sbp"
    ],
    source: "qSOFA (Singer M, et al. JAMA 2016;315:801-810)",
    differentials: [
      "Nyeri, cemas, dehidrasi, perdarahan"
    ],
    confidenceWeight: 0.85,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-002',
    gate: "GATE_SEPSIS_EARLY",
    severity: "critical",
    tier: "B",
    title: "Sepsis suspected + tanda infeksi — qSOFA {rr}/{sbp}",
    reasoning: "qSOFA >=2 DENGAN dugaan infeksi aktif. Risiko mortalitas tinggi.",
    criteria: {
      required: [
        {
          field: "symptoms.suspectedInfection",
          op: "true",
          value: true,
          label: "Dugaan infeksi"
        }
      ],
      scored: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.sbp",
          op: "lte",
          value: 100,
          label: "SBP <= 100"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        }
      ],
      minScore: 2
    },
    recommendations: [
      "Ulang vital sign dalam 15-30 menit",
      "Antibiotik awal sesuai protokol bila infeksi jelas",
      "Pertimbangkan cairan IV",
      "Rujuk cepat ke RS jika instabilitas atau fasilitas terbatas"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "rr",
      "sbp"
    ],
    source: "qSOFA (JAMA 2016), Surviving Sepsis Campaign 2021",
    differentials: [
      "Sepsis berat",
      "Septic shock awal"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-003',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Infeksi sistemik / sepsis awal — Demam + HR >90 + RR >=20",
    reasoning: "Demam >=38 + HR >90 + RR >=20 mengarah ke infeksi sistemik / sepsis awal.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Temp >= 38.0"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 20,
          label: "RR >= 20"
        }
      ],
      scored: []
    },
    recommendations: [
      "Cari fokus infeksi (paru, UTI, kulit, abdomen)",
      "O2 bila sesak; cairan bila dehidrasi",
      "Lapor dokter",
      "Bila SBP <=100 atau kesadaran turun: curiga sepsis berat, rujuk"
    ],
    requiresVitals: [
      "temp",
      "hr",
      "rr"
    ],
    source: "MSD Manuals, qSOFA criteria",
    differentials: [
      "Infeksi lokal",
      "Demam non-infeksi"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-004',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Sepsis afebrile pada lansia — RR & HR meningkat tanpa demam",
    reasoning: "Lansia sering afebrile saat sepsis. RR dan HR naik tanpa demam tetap curiga infeksi berat.",
    criteria: {
      required: [
        {
          field: "patient.physiology.isOlderAdult",
          op: "true",
          value: true,
          label: "Lansia >=65 tahun"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.temp",
          op: "lt",
          value: 38,
          label: "Temp < 38 (tidak demam)"
        }
      ],
      scored: []
    },
    recommendations: [
      "Percaya vital sign, jangan tunggu demam",
      "Segera lapor dokter",
      "Evaluasi infeksi (paru, UTI, kulit)",
      "Pertimbangkan rujuk bila ada tanda instabilitas"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "hr",
      "rr",
      "temp"
    ],
    source: "AAFP Sepsis in Elderly, qSOFA",
    differentials: [
      "Dehidrasi",
      "Anemia",
      "Heart failure"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-005',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "A",
    title: "Hipotermia + vital abnormal — curiga sepsis berat / syok",
    reasoning: "Suhu <35C dengan vital sign abnormal mengarah ke sepsis berat, paparan dingin, hipotiroid berat, atau syok.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "lt",
          value: 35,
          label: "Temp < 35.0 (hipotermia)"
        }
      ],
      scored: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.sbp",
          op: "lte",
          value: 100,
          label: "SBP <= 100"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "O2 diberikan",
      "Hangatkan perlahan",
      "Pantau BP/HR/RR",
      "Lapor dokter; rujuk emergensi"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "temp"
    ],
    source: "AAFP, Surviving Sepsis Campaign",
    differentials: [
      "Paparan dingin",
      "Hipotiroid berat",
      "Syok"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-006',
    gate: "GATE_SEPTIC_SHOCK_HIGH",
    severity: "critical",
    tier: "A",
    title: "Septic shock suspected — SBP {sbp}, MAP {map}",
    reasoning: "Sepsis criteria terpenuhi + SBP <90 atau MAP <65. Definisi syok: hipotensi persisten + disfungsi perfusi. Mortalitas tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22 (qSOFA)"
        }
      ],
      scored: [
        {
          field: "vitals.sbp",
          op: "lt",
          value: 90,
          label: "SBP < 90"
        },
        {
          field: "derived.map",
          op: "lt",
          value: 65,
          label: "MAP < 65"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Aktifkan emergency flow PMK 47/2018: ABCDE",
      "O2 segera",
      "Cairan IV bolus",
      "Rujuk segera ke IGD RS (hubungi PSC/ambulans)"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "sbp",
      "rr"
    ],
    source: "Surviving Sepsis Campaign 2021, EMCrit",
    supersededBy: [
      "hypotension-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-007',
    gate: "GATE_SEPTIC_SHOCK_HIGH",
    severity: "critical",
    tier: "B",
    title: "Sepsis berat — bingung + RR tinggi + HR tinggi",
    reasoning: "Kombinasi perubahan mental + RR tinggi + HR tinggi mengarah ke sepsis berat, syok, atau hipoksia otak.",
    criteria: {
      required: [
        {
          field: "symptoms.alteredMentalStatus",
          op: "true",
          value: true,
          label: "Perubahan mental"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        }
      ],
      scored: []
    },
    recommendations: [
      "Perlakukan sebagai sepsis berat",
      "O2, cairan bila indikasi",
      "Pantau ketat",
      "Rujuk segera"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "rr",
      "hr"
    ],
    source: "MSD Manuals, Surviving Sepsis Campaign",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-008',
    gate: "GATE_SHOCK_INDEX",
    severity: "warning",
    tier: "A",
    title: "Hemodynamic risk — Shock Index {shockIndex}",
    reasoning: "Shock Index (HR/SBP) = {shockIndex} >= 0.9. Terkait syok hipovolemia, perdarahan, sepsis.",
    criteria: {
      required: [
        {
          field: "derived.shockIndex",
          op: "gte",
          value: 0.9,
          label: "SI >= 0.9"
        },
        {
          field: "derived.shockIndex",
          op: "lt",
          value: 1,
          label: "SI < 1.0"
        }
      ],
      scored: []
    },
    recommendations: [
      "Cari sumber: trauma, perdarahan GI, dehidrasi, diare berat, demam tinggi",
      "Ulang vital sign",
      "Pertimbangkan cairan"
    ],
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "PLOS ONE Shock Index Studies",
    confidenceWeight: 0.95,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-009',
    gate: "GATE_SHOCK_INDEX",
    severity: "high",
    tier: "A",
    title: "Hemodynamic instability — Shock Index {shockIndex}",
    reasoning: "Shock Index >= 1.0. Risiko mortalitas meningkat signifikan.",
    criteria: {
      required: [
        {
          field: "derived.shockIndex",
          op: "gte",
          value: 1,
          label: "SI >= 1.0"
        },
        {
          field: "derived.shockIndex",
          op: "lt",
          value: 1.2,
          label: "SI < 1.2"
        }
      ],
      scored: []
    },
    recommendations: [
      "Treat sebagai syok: baringkan, angkat kaki bila aman",
      "O2, hentikan perdarahan bila ada",
      "Pasang infus, mulai cairan",
      "Rujuk bila memburuk"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "PLOS ONE, AAFP Shock Management",
    confidenceWeight: 0.95,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-010',
    gate: "GATE_SHOCK_INDEX",
    severity: "critical",
    tier: "A",
    title: "Syok hemodinamik — Shock Index {shockIndex}",
    reasoning: "Shock Index >= 1.2. Risiko mortalitas sangat tinggi. Segera intervensi.",
    criteria: {
      required: [
        {
          field: "derived.shockIndex",
          op: "gte",
          value: 1.2,
          label: "SI >= 1.2"
        }
      ],
      scored: []
    },
    recommendations: [
      "ABCDE segera",
      "O2, cairan IV bolus",
      "Rujuk emergensi ke IGD RS",
      "Hubungi PSC/ambulans"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "PLOS ONE, EMCrit",
    confidenceWeight: 0.95,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-011',
    gate: "GATE_SHOCK_INDEX",
    severity: "critical",
    tier: "A",
    title: "Syok — HR {hr} + SBP {sbp}",
    reasoning: "HR >=120 + SBP 90-100 mengarah ke syok hipovolemik (perdarahan, dehidrasi), sepsis berat, atau syok kardiogenik.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gte",
          value: 120,
          label: "HR >= 120"
        },
        {
          field: "vitals.sbp",
          op: "between",
          value: [
            60,
            100
          ],
          label: "SBP 60-100"
        }
      ],
      scored: []
    },
    recommendations: [
      "Anggap syok: baringkan, angkat kaki (bila aman)",
      "O2; hentikan perdarahan bila ada",
      "Pasang infus, mulai cairan sesuai SOP",
      "Panggil dokter; rujuk emergensi"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "Medscape Emergency, MSF Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-012',
    gate: "GATE_RESP_FAILURE",
    severity: "critical",
    tier: "A",
    title: "Gagal napas akut — RR {rr}, SpO2 {spo2}%",
    reasoning: "RR >=30 + SpO2 <90% tanpa O2 suplementasi. Risiko gagal napas tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 30,
          label: "RR >= 30"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 90,
          label: "SpO2 < 90%"
        },
        {
          field: "patient.supplementalO2",
          op: "false",
          value: false,
          label: "Tanpa O2 suplementasi"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2 segera: masker 6-10 L/menit",
      "Posisi duduk (semi-fowler)",
      "Bronkodilator bila asma/COPD",
      "Rujuk emergensi ke IGD RS"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr",
      "spo2"
    ],
    source: "WHO Emergency Triage, Neteera Clinical",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-013',
    gate: "GATE_RESP_FAILURE",
    severity: "high",
    tier: "A",
    title: "Distress respirasi — RR {rr}, SpO2 {spo2}%",
    reasoning: "RR >=25 + SpO2 <94%. Distress respirasi: pneumonia, asma/COPD, edema paru, PE, ARDS.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 25,
          label: "RR >= 25"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        }
      ],
      scored: []
    },
    recommendations: [
      "Posisi duduk; O2 6-10 L/menit",
      "Nebulizer bronkodilator bila asma/COPD sesuai SOP",
      "Pantau RR/SpO2",
      "Panggil dokter; siapkan rujuk emergensi"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr",
      "spo2"
    ],
    source: "WHO Emergency Triage, Nurse Clinical Patterns",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-014',
    gate: "GATE_RESP_FAILURE",
    severity: "critical",
    tier: "B",
    title: "Gagal napas berat — sulit bicara + otot bantu napas",
    reasoning: "Sulit berbicara dan/atau penggunaan otot bantu napas menandakan gagal napas berat.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 25,
          label: "RR >= 25"
        }
      ],
      scored: [
        {
          field: "symptoms.difficultySpeaking",
          op: "true",
          value: true,
          label: "Sulit bicara"
        },
        {
          field: "symptoms.accessoryMuscles",
          op: "true",
          value: true,
          label: "Otot bantu napas"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 92,
          label: "SpO2 < 92%"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "O2 segera",
      "Posisi duduk tegak",
      "Jangan biarkan pasien berbaring datar",
      "Rujuk emergensi ke IGD RS"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr"
    ],
    source: "Neteera, WHO Triage",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-015',
    gate: "GATE_RESP_FAILURE",
    severity: "critical",
    tier: "A",
    title: "Deteriorasi berat — RR naik + SpO2 turun + kesadaran menurun",
    reasoning: "Tiga indikator jelek bersamaan: RR naik, SpO2 turun, kesadaran menurun. Risiko henti jantung tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 24,
          label: "RR >= 24"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        }
      ],
      scored: []
    },
    recommendations: [
      "Gawat darurat tertinggi: jaga jalan napas",
      "O2 tinggi",
      "Pantau nadi dan BP",
      "Siapkan RJP bila perlu",
      "Panggil dokter; rujuk emergensi secepat mungkin"
    ],
    actionProtocolId: "PROTO_CARDIAC_ARREST",
    requiresVitals: [
      "rr",
      "spo2"
    ],
    source: "RPM Leadership Council, Early Warning Score",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-016',
    gate: "GATE_PE_SUSPECT",
    severity: "high",
    tier: "B",
    title: "PE suspected — sesak mendadak + SpO2 {spo2}%",
    reasoning: "Onset tiba-tiba sesak napas + RR >20 + HR >90 + SpO2 <94 + faktor risiko tromboemboli meningkatkan probabilitas PE.",
    criteria: {
      required: [
        {
          field: "symptoms.suddenDyspnea",
          op: "true",
          value: true,
          label: "Sesak mendadak"
        },
        {
          field: "vitals.rr",
          op: "gt",
          value: 20,
          label: "RR > 20"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2; posisi semi-fowler",
      "Pantau vital sign",
      "Jangan pulangkan",
      "Rujuk segera ke RS dengan fasilitas penunjang"
    ],
    requiresVitals: [
      "rr",
      "hr",
      "spo2"
    ],
    source: "DrOracle PE Guidelines, Wells Criteria",
    differentials: [
      "Pneumonia",
      "Pneumothorax",
      "ACS"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-017',
    gate: "GATE_PE_SUSPECT",
    severity: "critical",
    tier: "B",
    title: "PE high probability — sesak mendadak + faktor risiko",
    reasoning: "Sesak mendadak + faktor risiko tromboemboli (imobilisasi, pasca operasi, kanker, DVT/PE, kehamilan).",
    criteria: {
      required: [
        {
          field: "symptoms.suddenDyspnea",
          op: "true",
          value: true,
          label: "Sesak mendadak"
        },
        {
          field: "symptoms.thromboembolismRisk",
          op: "true",
          value: true,
          label: "Faktor risiko PE"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        }
      ],
      scored: [
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 90,
          label: "SBP < 90 (instabil)"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Treat sebagai EMERGENCY bila hipotensi/SpO2 sangat turun",
      "Aktifkan GATE_RESP_FAILURE dan GATE_SHOCK",
      "Rujuk emergensi"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "hr"
    ],
    source: "DrOracle PE, Wells Criteria",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-018',
    gate: "GATE_ACS",
    severity: "critical",
    tier: "B",
    title: "ACS / MI suspected — nyeri dada tipikal + vital abnormal",
    reasoning: "Nyeri dada tipikal >=20 menit + setidaknya satu: HR abnormal, SBP <90 atau >=180, RR meningkat, diaphoresis.",
    criteria: {
      required: [
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada tipikal"
        }
      ],
      scored: [
        {
          field: "symptoms.chestPainDuration20min",
          op: "true",
          value: true,
          label: "Durasi >= 20 menit"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100 (takikardia)"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 90,
          label: "SBP < 90 (hipotensi)"
        },
        {
          field: "symptoms.diaphoresis",
          op: "true",
          value: true,
          label: "Keringat dingin"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak napas"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Pasien TIDAK BOLEH berjalan/berdiri",
      "O2 bila saturasi rendah",
      "Aspirin sesuai protokol PPK bila tidak kontraindikasi",
      "Rujuk segera ke RS dengan fasilitas cath lab"
    ],
    actionProtocolId: "PROTO_ACS",
    requiresVitals: [],
    source: "AHA/ACC Guidelines 2021, Nurse Clinical Patterns",
    differentials: [
      "GERD",
      "Muskuloskeletal",
      "PE",
      "Aortic dissection"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-019',
    gate: "GATE_ACS",
    severity: "high",
    tier: "B",
    title: "Hipertensi berat + nyeri dada — curiga ACS/Stroke",
    reasoning: "HR tinggi + SBP >=160 + nyeri dada atau defisit neurologis. Curiga ACS atau stroke.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.sbp",
          op: "gte",
          value: 160,
          label: "SBP >= 160"
        },
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada"
        }
      ],
      scored: []
    },
    recommendations: [
      "Jangan biarkan pasien berdiri/jalan",
      "O2 bila SpO2 rendah",
      "Lapor dokter",
      "Rujuk segera sebagai ACS/Stroke"
    ],
    actionProtocolId: "PROTO_ACS",
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "DrOracle, AHA/ACC",
    supersededBy: [
      "hypertensive-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-020',
    gate: "GATE_ACS",
    severity: "warning",
    tier: "B",
    title: "ACS atipikal — nyeri dada + vital sign normal",
    reasoning: "Vital sign normal tapi nyeri dada atipikal pada pasien dengan faktor risiko (DM, hipertensi, riwayat jantung). Beberapa MI datang dengan vital awal normal.",
    criteria: {
      required: [
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tetap treat sebagai potensial ACS",
      "Istirahat, O2 bila perlu",
      "EKG/rujuk jika bisa",
      "Jangan dismiss hanya karena vital sign normal",
      "Konsultasi dokter"
    ],
    requiresVitals: [],
    source: "Geeky Medics ED Presentations",
    differentials: [
      "GERD",
      "Muskuloskeletal",
      "Anxiety"
    ],
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-021',
    gate: "GATE_STROKE",
    severity: "critical",
    tier: "B",
    title: "Stroke suspected — defisit neurologis fokal mendadak",
    reasoning: "Onset tiba-tiba: kelemahan wajah/anggota gerak satu sisi, gangguan bicara, atau gangguan penglihatan mendadak.",
    criteria: {
      required: [
        {
          field: "symptoms.focalNeuroDeficit",
          op: "true",
          value: true,
          label: "Defisit neurologis fokal"
        },
        {
          field: "symptoms.suddenOnset",
          op: "true",
          value: true,
          label: "Onset mendadak"
        }
      ],
      scored: []
    },
    recommendations: [
      "Catat waktu onset gejala (last known well)",
      "Jaga jalan napas; posisi kepala ~30 derajat bila kesadaran turun",
      "O2 bila hipoksia",
      "JANGAN turunkan BP agresif di FKTP",
      "Rujuk SEGERA (time critical — door-to-needle)",
      "BP tinggi BUKAN alasan menahan rujukan"
    ],
    actionProtocolId: "PROTO_STROKE",
    requiresVitals: [],
    source: "AHA/ASA Stroke Guidelines, DrOracle",
    differentials: [
      "TIA",
      "Hipoglikemia",
      "Todd paralysis",
      "Migraine with aura"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-022',
    gate: "GATE_STROKE",
    severity: "critical",
    tier: "B",
    title: "Stroke + hipertensi — SBP {sbp}",
    reasoning: "Defisit neurologis fokal + SBP >160. Sering menyertai stroke, BUKAN alasan tunda rujukan.",
    criteria: {
      required: [
        {
          field: "symptoms.focalNeuroDeficit",
          op: "true",
          value: true,
          label: "Defisit neurologis"
        },
        {
          field: "vitals.sbp",
          op: "gt",
          value: 160,
          label: "SBP > 160"
        }
      ],
      scored: []
    },
    recommendations: [
      "JANGAN turunkan BP agresif",
      "Catat onset waktu gejala",
      "Rujuk SEGERA — time critical"
    ],
    actionProtocolId: "PROTO_STROKE",
    requiresVitals: [
      "sbp"
    ],
    source: "AHA/ASA, PERDOSSI",
    supersededBy: [
      "hypertensive-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-023',
    gate: "GATE_STROKE",
    severity: "critical",
    tier: "B",
    title: "Perdarahan subaraknoid — nyeri kepala thunderclap + BP tinggi",
    reasoning: "Nyeri kepala hebat mendadak (thunderclap) + muntah +/- penurunan kesadaran + BP tinggi mengarah ke SAH atau stroke hemoragik.",
    criteria: {
      required: [
        {
          field: "vitals.sbp",
          op: "gt",
          value: 140,
          label: "SBP > 140"
        },
        {
          field: "symptoms.nausea",
          op: "true",
          value: true,
          label: "Mual/muntah"
        },
        {
          field: "symptoms.suddenOnset",
          op: "true",
          value: true,
          label: "Onset mendadak"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2; jaga jalan napas",
      "Jangan turunkan BP agresif",
      "Rujuk emergensi (CT scan/neurologi)"
    ],
    actionProtocolId: "PROTO_STROKE",
    requiresVitals: [
      "sbp"
    ],
    source: "Geeky Medics, AHA/ASA",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-024',
    gate: "GATE_ANAPHYLAXIS",
    severity: "critical",
    tier: "B",
    title: "Anafilaksis — EMERGENCY",
    reasoning: "Paparan alergen + gejala kulit/mukosa + kompromi respirasi atau kardiovaskular. Sesuai definisi klinis anafilaksis.",
    criteria: {
      required: [
        {
          field: "symptoms.allergenExposure",
          op: "true",
          value: true,
          label: "Paparan alergen"
        },
        {
          field: "symptoms.skinMucosalSymptoms",
          op: "true",
          value: true,
          label: "Gejala kulit/mukosa"
        }
      ],
      scored: [
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak napas"
        },
        {
          field: "symptoms.wheezing",
          op: "true",
          value: true,
          label: "Wheezing/stridor"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 90,
          label: "SBP < 90"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 120,
          label: "HR > 120"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Adrenalin IM SEGERA (0,3-0,5 mg IM dewasa)",
      "O2",
      "Posisi Trendelenburg jika hipotensi",
      "Pasang infus, cairan",
      "Rujuk emergensi ke RS"
    ],
    actionProtocolId: "PROTO_ANAPHYLAXIS",
    requiresVitals: [],
    source: "WHO Anaphylaxis Guidelines, EAACI 2021, EMCrit",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-025',
    gate: "GATE_ANAPHYLAXIS",
    severity: "warning",
    tier: "B",
    title: "Reaksi alergi — pantau eskalasi ke anafilaksis",
    reasoning: "Paparan alergen + gejala kulit/mukosa TANPA kompromi respirasi/kardiovaskular saat ini. Bisa eskalasi.",
    criteria: {
      required: [
        {
          field: "symptoms.allergenExposure",
          op: "true",
          value: true,
          label: "Paparan alergen"
        },
        {
          field: "symptoms.skinMucosalSymptoms",
          op: "true",
          value: true,
          label: "Gejala kulit/mukosa"
        }
      ],
      scored: []
    },
    recommendations: [
      "Pantau ketat — bisa eskalasi ke anafilaksis",
      "Siapkan adrenalin IM",
      "Ulang vital sign tiap 5-10 menit",
      "Konsultasi dokter"
    ],
    requiresVitals: [],
    source: "WHO, EAACI 2021",
    confidenceWeight: 0.65,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-026',
    gate: "GATE_DKA_HHS",
    severity: "critical",
    tier: "B",
    title: "DKA/HHS suspected — glucose {glucose}, RR {rr}",
    reasoning: "Glucose tinggi + RR tinggi (pola Kussmaul) + gejala GI (mual, muntah, nyeri perut). Cocok dengan DKA/HHS.",
    criteria: {
      required: [
        {
          field: "vitals.glucose",
          op: "gte",
          value: 250,
          label: "Glucose >= 250"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22 (napas cepat)"
        }
      ],
      scored: [
        {
          field: "symptoms.kussmaulBreathing",
          op: "true",
          value: true,
          label: "Napas Kussmaul"
        },
        {
          field: "symptoms.giSymptoms",
          op: "true",
          value: true,
          label: "Mual/muntah/nyeri perut"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Cek gula darah segera",
      "O2 bila sesak",
      "Pasang infus, mulai cairan sesuai SOP",
      "JANGAN berikan insulin mandiri di FKTP",
      "Rujuk emergensi ke RS (jangan tunda)"
    ],
    actionProtocolId: "PROTO_DKA_HHS",
    requiresVitals: [
      "glucose",
      "rr"
    ],
    source: "PERKENI 2024, ADA 2026, AAFP",
    supersededBy: [
      "hyperglycemia-crisis-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-027',
    gate: "GATE_DKA_HHS",
    severity: "critical",
    tier: "A",
    title: "HHS suspected — glucose {glucose} (sangat tinggi)",
    reasoning: "Glucose >=600 mg/dL mengarah ke HHS. Mortalitas tinggi tanpa penanganan.",
    criteria: {
      required: [
        {
          field: "vitals.glucose",
          op: "gte",
          value: 600,
          label: "Glucose >= 600 (HHS threshold)"
        }
      ],
      scored: []
    },
    recommendations: [
      "Cairan IV segera (NaCl 0,9%)",
      "JANGAN berikan insulin di FKTP",
      "Rujuk emergensi ke RS ICU"
    ],
    actionProtocolId: "PROTO_DKA_HHS",
    requiresVitals: [
      "glucose"
    ],
    source: "PERKENI 2024, ADA 2026",
    supersededBy: [
      "hyperglycemia-crisis-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-028',
    gate: "GATE_DKA_HHS",
    severity: "high",
    tier: "B",
    title: "Early DKA — glucose {glucose} + gejala metabolik",
    reasoning: "Glucose 200-250 + gejala metabolik (poliuria, polidipsia, mual, lemas). DKA bisa terjadi pada glucose tidak terlalu tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.glucose",
          op: "gte",
          value: 200,
          label: "Glucose >= 200"
        }
      ],
      scored: [
        {
          field: "symptoms.kussmaulBreathing",
          op: "true",
          value: true,
          label: "Napas Kussmaul"
        },
        {
          field: "symptoms.giSymptoms",
          op: "true",
          value: true,
          label: "Mual/muntah"
        },
        {
          field: "symptoms.polyuria",
          op: "true",
          value: true,
          label: "Poliuria"
        },
        {
          field: "symptoms.weakness",
          op: "true",
          value: true,
          label: "Lemas"
        }
      ],
      minScore: 2
    },
    recommendations: [
      "Cek gula darah ulang",
      "Cairan oral/IV",
      "Dokter review",
      "Pertimbangkan rujuk bila gejala memburuk"
    ],
    requiresVitals: [
      "glucose"
    ],
    source: "PERKENI 2024, ADA 2026",
    supersededBy: [
      "hyperglycemia-crisis-alert",
      "diabetes-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-029',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "high",
    tier: "B",
    title: "Eksaserbasi asma/COPD — RR {rr}, SpO2 {spo2}%",
    reasoning: "Sesak memburuk + wheezing + RR >=24 + SpO2 <94. Eksaserbasi asma/COPD sedang-berat.",
    criteria: {
      required: [
        {
          field: "symptoms.wheezing",
          op: "true",
          value: true,
          label: "Wheezing"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak napas"
        }
      ],
      scored: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 24,
          label: "RR >= 24"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Posisi duduk; O2",
      "Nebulizer bronkodilator",
      "Pantau RR/SpO2",
      "Bila tidak membaik atau SpO2 <92: treat sebagai gagal napas, rujuk emergensi"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [],
    source: "Neteera Clinical, GINA Guidelines",
    differentials: [
      "Pneumonia",
      "Heart failure",
      "PE"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-030',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "critical",
    tier: "B",
    title: "Status asthmaticus — sulit bicara / silent chest",
    reasoning: "Sulit bicara (hanya beberapa kata per napas) atau penurunan wheeze (silent chest) = eksaserbasi berat / near-fatal.",
    criteria: {
      required: [
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak"
        }
      ],
      scored: [
        {
          field: "symptoms.difficultySpeaking",
          op: "true",
          value: true,
          label: "Sulit bicara"
        },
        {
          field: "symptoms.accessoryMuscles",
          op: "true",
          value: true,
          label: "Otot bantu napas"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 92,
          label: "SpO2 < 92%"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Treat sebagai GAGAL NAPAS",
      "O2 segera; nebulizer",
      "Rujuk emergensi ke IGD RS"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [],
    source: "GINA Severe Exacerbation, Neteera",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-031',
    gate: "GATE_ANEMIA_BLEED_CHRONIC",
    severity: "warning",
    tier: "B",
    title: "Anemia sedang-berat / perdarahan kronis",
    reasoning: "HR meningkat saat aktivitas ringan + pucat + RR agak naik + BP normal/rendah. Mengarah ke anemia sedang-berat.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        }
      ],
      scored: [
        {
          field: "symptoms.pallor",
          op: "true",
          value: true,
          label: "Pucat"
        },
        {
          field: "symptoms.fatigue",
          op: "true",
          value: true,
          label: "Lelah/capek"
        },
        {
          field: "symptoms.bleedingHistory",
          op: "true",
          value: true,
          label: "Riwayat perdarahan"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Tidak selalu emergensi",
      "Atur rujukan cepat untuk pemeriksaan lab",
      "Bila sangat lemah, sesak, atau tanda syok: rujuk emergensi"
    ],
    requiresVitals: [
      "hr"
    ],
    source: "PLOS ONE, AAFP Anemia",
    differentials: [
      "Dehidrasi",
      "Tiroid",
      "Heart failure"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-032',
    gate: "GATE_ANEMIA_BLEED_CHRONIC",
    severity: "high",
    tier: "B",
    title: "Anemia berat + tanda syok — HR {hr}, SBP {sbp}",
    reasoning: "Tanda anemia/perdarahan + hipotensi. Mengarah ke perdarahan akut atau anemia berat dekompensasi.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 110,
          label: "HR > 110"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        }
      ],
      scored: [
        {
          field: "symptoms.pallor",
          op: "true",
          value: true,
          label: "Pucat"
        },
        {
          field: "symptoms.fatigue",
          op: "true",
          value: true,
          label: "Lemas"
        },
        {
          field: "symptoms.bleedingHistory",
          op: "true",
          value: true,
          label: "Riwayat perdarahan"
        },
        {
          field: "symptoms.syncope",
          op: "true",
          value: true,
          label: "Pingsan"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Treat sebagai syok: baringkan, angkat kaki",
      "O2, pasang infus, cairan",
      "Rujuk emergensi"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "AAFP, MSF Shock Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-033',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "RR meningkat ringan — RR {rr}, SpO2 {spo2}% (normal)",
    reasoning: "RR >=22-24 + SpO2 normal (>=94). Bisa nyeri, cemas, demam; bisa juga awal infeksi/sepsis/asidosis.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.rr",
          op: "lt",
          value: 25,
          label: "RR < 25 (ringan)"
        },
        {
          field: "vitals.spo2",
          op: "gte",
          value: 94,
          label: "SpO2 >= 94% (normal)"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tenangkan pasien; cari fokus infeksi/nyeri",
      "Ulang RR setelah tenang",
      "Bila RR tetap tinggi + dugaan infeksi: lapor dokter, jangan langsung pulang"
    ],
    requiresVitals: [
      "rr",
      "spo2"
    ],
    source: "MSD Manuals",
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-034',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Takikardia ringan — HR {hr}, penyebab belum jelas",
    reasoning: "HR 90-110 + BP normal. Bisa nyeri, cemas, dehidrasi, infeksi lokal, awal sepsis, atau anemia.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "between",
          value: [
            90,
            110
          ],
          label: "HR 90-110"
        },
        {
          field: "vitals.sbp",
          op: "gte",
          value: 100,
          label: "SBP >= 100 (normal)"
        }
      ],
      scored: []
    },
    recommendations: [
      "Obati nyeri, cairan oral",
      "Pantau ulang HR",
      "Bila tetap tinggi tanpa penyebab jelas atau disertai RR naik: lapor dokter"
    ],
    requiresVitals: [
      "hr",
      "sbp"
    ],
    source: "MSD Manuals",
    confidenceWeight: 0.5,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-035',
    gate: "GATE_SHOCK_INDEX",
    severity: "high",
    tier: "A",
    title: "Bradikardia signifikan — HR {hr}",
    reasoning: "HR <50 (non-atlet). Curiga blok jantung, efek obat, gangguan konduksi, TIK meningkat.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "lt",
          value: 50,
          label: "HR < 50"
        }
      ],
      scored: [
        {
          field: "symptoms.dizziness",
          op: "true",
          value: true,
          label: "Pusing"
        },
        {
          field: "symptoms.weakness",
          op: "true",
          value: true,
          label: "Lemas"
        },
        {
          field: "symptoms.syncope",
          op: "true",
          value: true,
          label: "Sinkop"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        }
      ],
      minScore: 0
    },
    recommendations: [
      "Pantau BP, kesadaran",
      "Cek riwayat obat (beta-blocker, CCB, digoxin)",
      "O2 bila perlu",
      "Bila sinkop/lemas berat: treat sebagai gawat darurat, rujuk segera"
    ],
    requiresVitals: [
      "hr"
    ],
    source: "ClinicalGate Bradycardia",
    differentials: [
      "Efek obat",
      "Blok AV",
      "Hipotiroid",
      "Athlete heart"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-036',
    gate: "GATE_SEPSIS_EARLY",
    severity: "critical",
    tier: "A",
    title: "Kode MERAH — AVPU != A mendadak",
    reasoning: "Penurunan kesadaran mendadak. Curiga hipoglikemia, hipoksia, syok, stroke, trauma kepala, sepsis berat, intoksikasi.",
    criteria: {
      required: [
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        }
      ],
      scored: []
    },
    recommendations: [
      "KODE MERAH: cek gula darah dan vital sign SEGERA",
      "Jaga jalan napas, posisi miring bila risiko muntah",
      "O2",
      "Panggil dokter; rujuk emergensi"
    ],
    requiresVitals: [],
    source: "DrOracle, WHO Emergency Triage",
    supersededBy: [
      "avpu-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-037',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Borderline vitals — jangan tertipu angka \"masih normal\"",
    reasoning: "Vital sign hampir normal (SBP 95-100, HR 100-105, SpO2 92-94) tapi pasien sangat lemah. Studi tunjukkan risiko rawat inap 2x lipat dalam 7 hari.",
    criteria: {
      required: [
        {
          field: "vitals.sbp",
          op: "between",
          value: [
            90,
            100
          ],
          label: "SBP 90-100 (borderline)"
        },
        {
          field: "vitals.hr",
          op: "between",
          value: [
            100,
            110
          ],
          label: "HR 100-110 (borderline)"
        }
      ],
      scored: [
        {
          field: "vitals.spo2",
          op: "between",
          value: [
            90,
            94
          ],
          label: "SpO2 90-94%"
        },
        {
          field: "symptoms.weakness",
          op: "true",
          value: true,
          label: "Sangat lemah"
        },
        {
          field: "patient.physiology.isOlderAdult",
          op: "true",
          value: true,
          label: "Lansia"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Jangan tertipu angka masih normal",
      "Dokumentasikan; ulang vital sign",
      "Lapor dokter",
      "Pertimbangkan observasi lebih lama atau rujuk bila komorbid berat/lansia"
    ],
    requiresVitals: [
      "sbp",
      "hr"
    ],
    source: "PMC NCBI Borderline Vitals Study",
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-038',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Deteriorasi progresif — tren vital memburuk",
    reasoning: "Fluktuasi vital sign besar dalam hitungan jam. Tren > titik tunggal. Warning dinamis.",
    criteria: {
      required: [],
      scored: [
        {
          field: "vitals.rr",
          op: "gte",
          value: 24,
          label: "RR >= 24"
        },
        {
          field: "vitals.hr",
          op: "gte",
          value: 110,
          label: "HR >= 110"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        }
      ],
      minScore: 3
    },
    recommendations: [
      "Tingkatkan frekuensi monitoring",
      "Panggil dokter",
      "Pertimbangkan rujuk meski tiap angka belum ekstrem",
      "Tren lebih penting dari titik tunggal"
    ],
    requiresVitals: [
      "rr",
      "hr",
      "sbp"
    ],
    source: "PLOS ONE, Early Warning Score Systems",
    confidenceWeight: 0.7,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-039',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "warning",
    tier: "A",
    title: "Pneumonia ringan/moderat — RR {rr}, SpO2 {spo2}%",
    reasoning: "Demam + batuk + RR 20-24 + SpO2 normal + HR sedikit naik. Tidak emergensi tapi butuh monitoring.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Temp >= 38"
        },
        {
          field: "vitals.rr",
          op: "between",
          value: [
            20,
            24
          ],
          label: "RR 20-24"
        },
        {
          field: "vitals.spo2",
          op: "gte",
          value: 94,
          label: "SpO2 >= 94%"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tidak emergensi",
      "Terapi antibiotik sesuai pedoman",
      "Edukasi red flag: sesak makin berat, saturasi turun, demam tak membaik",
      "Kontrol ulang"
    ],
    requiresVitals: [
      "temp",
      "rr",
      "spo2"
    ],
    source: "FKTP Pneumonia Guidelines",
    confidenceWeight: 0.55,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-040',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Infeksi ringan — demam tanpa red flag vital",
    reasoning: "Demam >=38 + RR normal + HR normal + keluhan lokal. Tidak emergensi.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Temp >= 38"
        },
        {
          field: "vitals.rr",
          op: "lt",
          value: 22,
          label: "RR < 22 (normal)"
        },
        {
          field: "vitals.hr",
          op: "lt",
          value: 100,
          label: "HR < 100 (normal)"
        },
        {
          field: "vitals.sbp",
          op: "gte",
          value: 100,
          label: "SBP >= 100"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tidak emergensi",
      "Tatalaksana sesuai pedoman FKTP",
      "Edukasi red flag: sesak, demam tak turun, lemas berat → segera kembali"
    ],
    requiresVitals: [
      "temp",
      "rr",
      "hr",
      "sbp"
    ],
    source: "FKTP Infection Guidelines",
    confidenceWeight: 0.5,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-041',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "A",
    title: "Infeksi sedang — RR {rr}, HR {hr}, demam",
    reasoning: "Demam >=38 + RR 20-24 + HR >90 tanpa hipotensi. Kemungkinan sepsis awal terutama bila komorbid.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Temp >= 38"
        },
        {
          field: "vitals.rr",
          op: "between",
          value: [
            20,
            24
          ],
          label: "RR 20-24"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.sbp",
          op: "gte",
          value: 100,
          label: "SBP >= 100 (tidak hipotensi)"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2 bila sesak; cairan oral/IV",
      "Lapor dokter",
      "Follow-up lebih ketat",
      "Rujuk bila akses RS terbatas dan pasien berisiko tinggi"
    ],
    requiresVitals: [
      "temp",
      "rr",
      "hr",
      "sbp"
    ],
    source: "AAFP Sepsis, MSD Manuals",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-042',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "B",
    title: "Kejang demam — demam tinggi + kejang",
    reasoning: "Demam tinggi + kejang tanpa riwayat epilepsi. ABC stabil, kontrol suhu, rujuk bila lama/berulang.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38.5,
          label: "Temp >= 38.5 (demam tinggi)"
        },
        {
          field: "symptoms.seizure",
          op: "true",
          value: true,
          label: "Kejang"
        }
      ],
      scored: []
    },
    recommendations: [
      "ABC stabil; posisi miring",
      "O2; kontrol suhu",
      "Bila kejang lama atau berulang: rujuk emergensi",
      "Edukasi orang tua"
    ],
    requiresVitals: [
      "temp"
    ],
    source: "IDAI Febrile Seizure Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-043',
    gate: "GATE_RESP_FAILURE",
    severity: "high",
    tier: "A",
    title: "Depresi napas akibat obat — RR {rr}, SpO2 {spo2}%",
    reasoning: "RR rendah (<12) + SpO2 turun + kesadaran menurun. Curiga depresi napas akibat obat sedatif/opioid.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "lt",
          value: 12,
          label: "RR < 12 (bradypnea)"
        }
      ],
      scored: [
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "Kesadaran menurun"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Jaga jalan napas; O2; posisi miring",
      "Panggil dokter",
      "Rujuk emergensi",
      "Pertimbangkan antidotum di RS"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr"
    ],
    source: "American Addiction Centers, WHO",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-044',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "B",
    title: "Frailty + vital naik pelan — high risk",
    reasoning: "Pasien sangat lemah, RR dan HR naik pelan, BP cenderung turun, terutama lansia/komorbid. Jangan pulang cepat.",
    criteria: {
      required: [
        {
          field: "symptoms.weakness",
          op: "true",
          value: true,
          label: "Sangat lemah"
        },
        {
          field: "patient.physiology.isOlderAdult",
          op: "true",
          value: true,
          label: "Lansia"
        }
      ],
      scored: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 20,
          label: "RR >= 20"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 110,
          label: "SBP < 110"
        }
      ],
      minScore: 2
    },
    recommendations: [
      "Anggap high-risk; jangan pulang cepat",
      "Lapor dokter; evaluasi menyeluruh",
      "Rujuk bila sulit stabil di FKTP"
    ],
    requiresVitals: [],
    source: "PMC NCBI Frailty Studies",
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-045',
    gate: "GATE_SEPSIS_EARLY",
    severity: "critical",
    tier: "A",
    title: "Meningitis/ensefalitis suspected",
    reasoning: "Demam + tanda meningeal. Hindari pungsi lumbal di FKTP; rujuk emergensi.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Demam >= 38"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2; pantau vital sign",
      "Hindari pungsi lumbal di FKTP",
      "Rujuk emergensi ke RS"
    ],
    requiresVitals: [
      "temp",
      "hr"
    ],
    source: "WHO Meningitis Guidelines",
    confidenceWeight: 0.65,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-046',
    gate: "GATE_SEPTIC_SHOCK_HIGH",
    severity: "critical",
    tier: "A",
    title: "Sepsis meningokokus — demam + petekie + toksik",
    reasoning: "Demam + ruam petekie/purpura + HR dan RR naik + BP turun. Sepsis berat.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Demam"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        }
      ],
      scored: []
    },
    recommendations: [
      "Perlakukan sebagai sepsis berat",
      "O2, cairan, pantau ketat",
      "Rujuk emergensi"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "temp",
      "hr",
      "sbp"
    ],
    source: "WHO Sepsis, MSD Manuals",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-047',
    gate: "GATE_SHOCK_INDEX",
    severity: "critical",
    tier: "B",
    title: "Dengue berat / syok dengue — HR {hr}, SBP {sbp}",
    reasoning: "Demam + HR naik + RR naik + tanda perdarahan + tanda syok. Curiga dengue berat.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Demam"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "symptoms.bleedingHistory",
          op: "true",
          value: true,
          label: "Tanda perdarahan"
        }
      ],
      scored: [
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Pantau ketat HR, BP, CRT",
      "Cairan sesuai pedoman dengue",
      "Rujuk emergensi ke RS"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [
      "temp",
      "hr"
    ],
    source: "WHO Dengue Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-048',
    gate: "GATE_STROKE",
    severity: "critical",
    tier: "B",
    title: "Cedera kepala berat — peningkatan TIK",
    reasoning: "Trauma kepala + muntah berulang + penurunan kesadaran +/- bradikardia + hipertensi. Cushing triad.",
    criteria: {
      required: [
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        },
        {
          field: "symptoms.nausea",
          op: "true",
          value: true,
          label: "Muntah"
        }
      ],
      scored: [
        {
          field: "vitals.hr",
          op: "lt",
          value: 60,
          label: "HR < 60 (bradikardia)"
        },
        {
          field: "vitals.sbp",
          op: "gt",
          value: 160,
          label: "SBP > 160 (hipertensi)"
        }
      ],
      minScore: 0
    },
    recommendations: [
      "ABC stabil; O2",
      "Imobilisasi leher",
      "Pantau BP/HR/RR",
      "Jangan berikan obat penenang sembarangan",
      "Rujuk emergensi (neurotrauma)"
    ],
    requiresVitals: [],
    source: "Eprints UKH Gadar",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-049',
    gate: "GATE_PE_SUSPECT",
    severity: "warning",
    tier: "B",
    title: "Nyeri dada pleuritik — curiga pneumonia/PE",
    reasoning: "Nyeri dada tajam saat tarik napas + RR naik + HR naik + SpO2 sedikit turun tanpa demam. Curiga PE kecil atau pleuritis.",
    criteria: {
      required: [
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada"
        },
        {
          field: "vitals.rr",
          op: "gt",
          value: 20,
          label: "RR > 20"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        },
        {
          field: "vitals.temp",
          op: "lt",
          value: 38,
          label: "Tidak demam"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2 bila perlu",
      "Pantau RR/SpO2",
      "Bila faktor risiko PE kuat atau saturasi turun: rujuk",
      "Jika tidak: tatalaksana ISPA/pneumonia + follow-up ketat"
    ],
    requiresVitals: [
      "rr",
      "hr",
      "temp"
    ],
    source: "DrOracle, Nurse Clinical Patterns",
    differentials: [
      "PE",
      "Pneumonia",
      "Pleuritis",
      "Muskuloskeletal"
    ],
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-050',
    gate: "GATE_PE_SUSPECT",
    severity: "high",
    tier: "B",
    title: "PE/kardiomiopati postpartum — wanita hamil + sesak + nyeri dada",
    reasoning: "Wanita hamil/post-partum + sesak + nyeri dada + palpitasi. Curiga PE postpartum atau kardiomiopati peripartum.",
    criteria: {
      required: [
        {
          field: "history.pregnancyStatus",
          op: "eq",
          value: true,
          label: "Hamil/postpartum"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak"
        }
      ],
      scored: [
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "vitals.rr",
          op: "gt",
          value: 20,
          label: "RR > 20"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Curiga tinggi: O2, pantau vital",
      "Rujuk emergensi",
      "Jangan anggap normal pasca melahirkan"
    ],
    requiresVitals: [],
    source: "ACOG, DrOracle PE",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-051',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "C",
    title: "Sepsis pada pasien DM — risiko tinggi",
    reasoning: "qSOFA criteria + diketahui DM. Risiko sepsis dan mortalitas lebih tinggi pada DM.",
    criteria: {
      required: [
        {
          field: "history.knownDM",
          op: "true",
          value: true,
          label: "Riwayat DM"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 22,
          label: "RR >= 22"
        },
        {
          field: "vitals.hr",
          op: "gt",
          value: 90,
          label: "HR > 90"
        }
      ],
      scored: []
    },
    recommendations: [
      "Risiko sepsis lebih tinggi pada DM",
      "Cek gula darah segera",
      "Evaluasi infeksi agresif",
      "Threshold rujuk lebih rendah"
    ],
    actionProtocolId: "PROTO_SEPSIS",
    requiresVitals: [
      "rr",
      "hr"
    ],
    source: "AAFP Sepsis, PERKENI 2024",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-052',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "high",
    tier: "C",
    title: "Eksaserbasi asma — riwayat asma + sesak + RR tinggi",
    reasoning: "Riwayat asma + sesak napas memburuk + wheezing + RR >=24 dan/atau SpO2 <94.",
    criteria: {
      required: [
        {
          field: "history.knownAsthma",
          op: "true",
          value: true,
          label: "Riwayat asma"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 24,
          label: "RR >= 24"
        }
      ],
      scored: []
    },
    recommendations: [
      "Posisi duduk; O2; nebulizer bronkodilator",
      "Pantau; bila tidak membaik atau SpO2 <92 / silent chest: rujuk emergensi"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr"
    ],
    source: "GINA Guidelines, Neteera",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-053',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "high",
    tier: "C",
    title: "Eksaserbasi COPD — riwayat COPD + sesak + RR tinggi",
    reasoning: "Riwayat COPD + sesak napas memburuk + RR naik.",
    criteria: {
      required: [
        {
          field: "history.knownCOPD",
          op: "true",
          value: true,
          label: "Riwayat COPD"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sesak"
        },
        {
          field: "vitals.rr",
          op: "gte",
          value: 24,
          label: "RR >= 24"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2 hati-hati (target SpO2 88-92% pada COPD)",
      "Nebulizer bronkodilator",
      "Rujuk bila tidak membaik"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr"
    ],
    source: "GOLD Guidelines, Neteera",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-054',
    gate: "GATE_DKA_HHS",
    severity: "critical",
    tier: "C",
    title: "DKA pada pasien DM — glucose {glucose} + Kussmaul",
    reasoning: "Diketahui DM + glucose tinggi + napas Kussmaul + gejala GI. DKA confirmed context.",
    criteria: {
      required: [
        {
          field: "history.knownDM",
          op: "true",
          value: true,
          label: "Riwayat DM"
        },
        {
          field: "vitals.glucose",
          op: "gte",
          value: 250,
          label: "Glucose >= 250"
        },
        {
          field: "symptoms.kussmaulBreathing",
          op: "true",
          value: true,
          label: "Napas Kussmaul"
        }
      ],
      scored: []
    },
    recommendations: [
      "Cairan IV segera",
      "JANGAN insulin mandiri",
      "Rujuk emergensi ke RS"
    ],
    actionProtocolId: "PROTO_DKA_HHS",
    requiresVitals: [
      "glucose"
    ],
    source: "PERKENI 2024, ADA 2026",
    supersededBy: [
      "hyperglycemia-crisis-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-055',
    gate: "GATE_SHOCK_INDEX",
    severity: "high",
    tier: "B",
    title: "Emergensi abdomen — nyeri perut hebat + hemodinamik tidak stabil",
    reasoning: "HR tinggi + nyeri perut + hipotensi. Curiga peritonitis, perdarahan intraabdomen, KET pada wanita usia subur.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "symptoms.giSymptoms",
          op: "true",
          value: true,
          label: "Nyeri perut"
        }
      ],
      scored: [
        {
          field: "vitals.sbp",
          op: "lt",
          value: 100,
          label: "SBP < 100"
        },
        {
          field: "symptoms.pallor",
          op: "true",
          value: true,
          label: "Pucat"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "O2; pantau BP/HR",
      "Jangan berikan analgesik berlebihan sebelum dinilai dokter",
      "Rujuk segera ke RS bedah/OBGYN"
    ],
    requiresVitals: [
      "hr"
    ],
    source: "Geeky Medics, Surgical Emergency Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-056',
    gate: "GATE_SHOCK_INDEX",
    severity: "critical",
    tier: "B",
    title: "KET / abortus — hamil + nyeri perut + perdarahan",
    reasoning: "Wanita hamil + nyeri perut bawah + perdarahan + HR naik + BP turun. Curiga KET atau abortus.",
    criteria: {
      required: [
        {
          field: "history.pregnancyStatus",
          op: "eq",
          value: true,
          label: "Hamil"
        },
        {
          field: "symptoms.giSymptoms",
          op: "true",
          value: true,
          label: "Nyeri perut"
        },
        {
          field: "symptoms.bleedingHistory",
          op: "true",
          value: true,
          label: "Perdarahan"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2; pasang infus; pantau tanda vital",
      "Segera rujuk ke RS rujukan maternitas",
      "High suspicion walau fasilitas mini"
    ],
    actionProtocolId: "PROTO_SHOCK",
    requiresVitals: [],
    source: "ACOG, Maternal Emergency Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-057',
    gate: "GATE_RESP_FAILURE",
    severity: "critical",
    tier: "B",
    title: "Pneumonia berat anak — RR tinggi + retraksi + SpO2 turun",
    reasoning: "Anak: RR tinggi sesuai cutoff usia + retraksi dada + SpO2 turun. Anak sangat cepat memburuk.",
    criteria: {
      required: [
        {
          field: "patient.age",
          op: "lt",
          value: 12,
          label: "Anak < 12 tahun"
        },
        {
          field: "vitals.spo2",
          op: "lt",
          value: 94,
          label: "SpO2 < 94%"
        },
        {
          field: "symptoms.accessoryMuscles",
          op: "true",
          value: true,
          label: "Retraksi dada"
        }
      ],
      scored: []
    },
    recommendations: [
      "O2; posisi nyaman",
      "Pantau",
      "Rujuk emergensi (anak sangat cepat memburuk)"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "spo2"
    ],
    source: "WHO IMCI, IDAI",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-058',
    gate: "GATE_RESP_ASTHMA_COPD",
    severity: "high",
    tier: "B",
    title: "Eksaserbasi asma anak",
    reasoning: "Anak: RR tinggi + wheezing + kesulitan bicara/menangis.",
    criteria: {
      required: [
        {
          field: "patient.age",
          op: "lt",
          value: 18,
          label: "Anak/remaja"
        },
        {
          field: "symptoms.wheezing",
          op: "true",
          value: true,
          label: "Wheezing"
        },
        {
          field: "symptoms.difficultySpeaking",
          op: "true",
          value: true,
          label: "Sulit bicara/menangis"
        }
      ],
      scored: []
    },
    recommendations: [
      "Nebulizer; O2",
      "Pantau RR/SpO2",
      "Bila tidak membaik: rujuk"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [],
    source: "GINA Pediatric, IDAI",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-059',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "C",
    title: "Neutropenic sepsis — kanker + demam ringan",
    reasoning: "Pasien kanker/kemoterapi + demam sedikit (37,8-38,3). Bisa memburuk sangat cepat meski awal ringan.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 37.8,
          label: "Temp >= 37.8"
        },
        {
          field: "symptoms.fatigue",
          op: "true",
          value: true,
          label: "Lemas"
        }
      ],
      scored: []
    },
    recommendations: [
      "Jangan remehkan demam ringan pada pasien kanker",
      "Dokter harus review",
      "Kemungkinan besar perlu rujuk ke RS",
      "Edukasi: demam apapun = tanda bahaya"
    ],
    requiresVitals: [
      "temp"
    ],
    source: "NICE Neutropenic Sepsis Guidelines",
    confidenceWeight: 0.55,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-060',
    gate: "GATE_STROKE",
    severity: "high",
    tier: "B",
    title: "Cauda equina syndrome — emergensi neurologis",
    reasoning: "Nyeri punggung bawah + retensi BAK/inkontinensia + kelemahan tungkai. Time-critical.",
    criteria: {
      required: [
        {
          field: "symptoms.weakness",
          op: "true",
          value: true,
          label: "Kelemahan tungkai"
        },
        {
          field: "symptoms.suddenOnset",
          op: "true",
          value: true,
          label: "Onset akut"
        }
      ],
      scored: []
    },
    recommendations: [
      "Bukan emergensi ABC, tapi emergensi neurologis/time-critical",
      "Rujuk cepat untuk evaluasi bedah saraf"
    ],
    requiresVitals: [],
    source: "Geeky Medics, Spine Surgery Guidelines",
    confidenceWeight: 0.5,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-061',
    gate: "GATE_DKA_HHS",
    severity: "critical",
    tier: "A",
    title: "Hipoglikemia berat — glucose {glucose} + kesadaran menurun",
    reasoning: "Gula darah rendah + perubahan kesadaran. Life-threatening.",
    criteria: {
      required: [
        {
          field: "vitals.glucose",
          op: "lt",
          value: 70,
          label: "Glucose < 70"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "AVPU != A"
        }
      ],
      scored: []
    },
    recommendations: [
      "Cek gula darah",
      "Bila bisa minum: glukosa oral cepat serap",
      "Bila tidak bisa minum: glukosa IV sesuai PPK",
      "O2; observasi; rujuk bila tidak membaik"
    ],
    actionProtocolId: "PROTO_HYPOGLYCEMIA",
    requiresVitals: [
      "glucose"
    ],
    source: "PERKENI 2024, ADA 15-15 Rule",
    supersededBy: [
      "hypoglycemia-alert"
    ],
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-062',
    gate: "GATE_SHOCK_INDEX",
    severity: "warning",
    tier: "A",
    title: "Hipertiroid / thyroid storm — HR {hr}",
    reasoning: "HR >120 + RR naik + tremor + berkeringat + BB turun + tidak demam + BP bisa tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 120,
          label: "HR > 120"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tidak selalu emergensi",
      "Bila HR sangat tinggi, lemas, atau gangguan mental: konsultasi dokter, pertimbangkan rujuk",
      "Untuk kasus stabil: rujukan cepat ke spesialis"
    ],
    requiresVitals: [
      "hr"
    ],
    source: "Thyroid Storm Clinical Patterns",
    confidenceWeight: 0.5,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-063',
    gate: "GATE_ACS",
    severity: "warning",
    tier: "B",
    title: "Aritmia intermiten — palpitasi + near-syncope",
    reasoning: "Vital sign normal/sedikit abnormal + palpitasi berat + rasa mau pingsan + riwayat jantung. Risiko sinkop/sudden death.",
    criteria: {
      required: [
        {
          field: "symptoms.dizziness",
          op: "true",
          value: true,
          label: "Pusing / mau pingsan"
        }
      ],
      scored: [
        {
          field: "vitals.hr",
          op: "gt",
          value: 100,
          label: "HR > 100"
        },
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada"
        },
        {
          field: "symptoms.syncope",
          op: "true",
          value: true,
          label: "Riwayat pingsan"
        }
      ],
      minScore: 1
    },
    recommendations: [
      "Jangan diabaikan",
      "EKG bila tersedia",
      "Rujuk ke RS untuk evaluasi",
      "Edukasi: segera datang bila pingsan/nyeri dada/sesak"
    ],
    requiresVitals: [],
    source: "PMC NCBI Arrhythmia, Geeky Medics",
    confidenceWeight: 0.55,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-064',
    gate: "GATE_SEPSIS_EARLY",
    severity: "high",
    tier: "B",
    title: "Delirium akut — lansia + bingung + vital hampir normal",
    reasoning: "Vital sign normal/nyaris normal tapi sangat bingung/disorientasi. Tanda gangguan akut otak. Mortalitas tinggi.",
    criteria: {
      required: [
        {
          field: "patient.physiology.isOlderAdult",
          op: "true",
          value: true,
          label: "Lansia"
        },
        {
          field: "symptoms.alteredMentalStatus",
          op: "true",
          value: true,
          label: "Bingung/disorientasi"
        }
      ],
      scored: []
    },
    recommendations: [
      "Anggap kondisi serius meski vital normal",
      "Cari pemicu: infeksi, obat, hipoglikemia",
      "Lapor dokter",
      "Pertimbangkan rujuk untuk evaluasi menyeluruh"
    ],
    requiresVitals: [],
    source: "Cleveland Clinic Delirium, PMC NCBI",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-065',
    gate: "GATE_ACS",
    severity: "high",
    tier: "B",
    title: "Red flag kardiak pada remaja — pingsan saat olahraga",
    reasoning: "Remaja + nyeri dada + palpitasi + pingsan saat olahraga. Curiga HCM, channelopathy. Vital sign bisa normal saat diperiksa.",
    criteria: {
      required: [
        {
          field: "patient.age",
          op: "between",
          value: [
            10,
            25
          ],
          label: "Remaja/dewasa muda"
        },
        {
          field: "symptoms.syncope",
          op: "true",
          value: true,
          label: "Pingsan"
        }
      ],
      scored: []
    },
    recommendations: [
      "RED FLAG BESAR",
      "Rujuk ke kardiolog/RS dengan EKG/USG jantung",
      "Jangan izinkan aktivitas berat sebelum dinyatakan aman"
    ],
    requiresVitals: [],
    source: "AHA Sudden Cardiac Death in Young Athletes",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-066',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "C",
    title: "Infeksi jaringan dalam pada DM — risiko gangren",
    reasoning: "DM + luka infeksi + demam ringan + vital hampir normal. Risiko gangren, osteomielitis, sepsis.",
    criteria: {
      required: [
        {
          field: "history.knownDM",
          op: "true",
          value: true,
          label: "Riwayat DM"
        },
        {
          field: "symptoms.suspectedInfection",
          op: "true",
          value: true,
          label: "Tanda infeksi"
        }
      ],
      scored: []
    },
    recommendations: [
      "Jangan anggap infeksi kulit biasa",
      "Dokter harus review",
      "Pertimbangkan rujuk untuk debridement/rawat inap",
      "Kontrol gula ketat"
    ],
    requiresVitals: [],
    source: "PERKENI Diabetic Foot, ADA",
    confidenceWeight: 0.6,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-067',
    gate: "GATE_ACS",
    severity: "critical",
    tier: "B",
    title: "Diseksi aorta — nyeri punggung/dada hebat mendadak",
    reasoning: "Nyeri punggung/dada hebat mendadak + SBP tinggi. Sering miss di primer, sangat mematikan.",
    criteria: {
      required: [
        {
          field: "symptoms.chestPain",
          op: "true",
          value: true,
          label: "Nyeri dada/punggung hebat"
        },
        {
          field: "symptoms.suddenOnset",
          op: "true",
          value: true,
          label: "Onset mendadak"
        },
        {
          field: "vitals.sbp",
          op: "gt",
          value: 140,
          label: "SBP > 140"
        }
      ],
      scored: []
    },
    recommendations: [
      "Waspadai pada pasien hipertensi",
      "Jangan berikan manipulasi berat",
      "O2, pain control secukupnya",
      "Rujuk emergensi ke RS dengan fasilitas imaging"
    ],
    actionProtocolId: "PROTO_ACS",
    requiresVitals: [
      "sbp"
    ],
    source: "Geeky Medics ED, AHA Aortic Dissection",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-068',
    gate: "GATE_RESP_FAILURE",
    severity: "high",
    tier: "A",
    title: "Overdosis obat — RR borderline + mengantuk berat",
    reasoning: "RR borderline (10-12) + SpO2 borderline (92-94) + mengantuk berat. Vital bisa masih borderline sebelum drop.",
    criteria: {
      required: [
        {
          field: "vitals.rr",
          op: "between",
          value: [
            8,
            12
          ],
          label: "RR 8-12 (rendah)"
        },
        {
          field: "patient.avpuManual",
          op: "neq",
          value: "A",
          label: "Kesadaran turun"
        }
      ],
      scored: []
    },
    recommendations: [
      "Pantau ketat RR/SpO2; jangan biarkan sendirian",
      "Jaga jalan napas (posisi miring)",
      "O2",
      "Lapor dokter; rujuk emergensi sebelum RR turun lebih jauh"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "rr"
    ],
    source: "American Addiction Centers",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-069',
    gate: "GATE_RESP_FAILURE",
    severity: "critical",
    tier: "B",
    title: "Epiglotitis / obstruksi laring — sulit napas + suara serak",
    reasoning: "Demam + nyeri tenggorok + air liur menetes + suara serak + RR naik + sulit napas. Airway risk tinggi.",
    criteria: {
      required: [
        {
          field: "vitals.temp",
          op: "gte",
          value: 38,
          label: "Demam"
        },
        {
          field: "symptoms.dyspnea",
          op: "true",
          value: true,
          label: "Sulit napas"
        },
        {
          field: "vitals.rr",
          op: "gt",
          value: 20,
          label: "RR > 20"
        }
      ],
      scored: []
    },
    recommendations: [
      "JANGAN memaksa membuka mulut/menekan lidah",
      "O2; jangan membuat pasien menangis",
      "Rujuk emergensi segera (airway risk tinggi)"
    ],
    actionProtocolId: "PROTO_RESP_FAILURE",
    requiresVitals: [
      "temp",
      "rr"
    ],
    source: "ENT Emergency Guidelines",
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  },
  {
    id: 'CP-070',
    gate: "GATE_SEPSIS_EARLY",
    severity: "warning",
    tier: "C",
    title: "Kekhawatiran klinis — pasien tampak lebih sakit dari angka",
    reasoning: "Vital sign hampir normal tapi ada gut feeling perawat/dokter bahwa pasien tampak lebih sakit. Literatur EWS mendukung intuisi klinisi sebagai red flag tambahan.",
    criteria: {
      required: [
        {
          field: "symptoms.clinicalConcern",
          op: "true",
          value: true,
          label: "Concern klinis aktif"
        }
      ],
      scored: []
    },
    recommendations: [
      "Tingkatkan level pemantauan",
      "Anjurkan review dokter",
      "Observasi lebih lama meski skor vital rendah"
    ],
    requiresVitals: [],
    source: "PLOS ONE EWS, RPM Leadership Council",
    confidenceWeight: 0.7,
    sourceFile: "apps/healthcare/sentra-assist/lib/emergency-detector/clinical-patterns.ts"
  }
] as const satisfies readonly AssistPatternParityDefinition[]

const ASSIST_PATTERN_PARITY_BY_ID = new Map<AssistPatternParityId, AssistPatternParityDefinition>(
  ASSIST_PATTERN_PARITY_DEFINITIONS.map(pattern => [pattern.id, pattern])
)

export const ASSIST_PATTERN_PARITY_FIXTURE_CASES = ASSIST_PATTERN_PARITY_DEFINITIONS.map(
  pattern => ({
    patternId: pattern.id,
    expectedAlertId: assistPatternAlertId(pattern.id),
    expectedSeverity: pattern.severity,
    expectedGate: pattern.gate,
    expectedTitle: pattern.title,
  })
) satisfies readonly AssistPatternParityFixtureCase[]

export function getAssistPatternParityDefinition(
  id: AssistPatternParityId
): AssistPatternParityDefinition | undefined {
  return ASSIST_PATTERN_PARITY_BY_ID.get(id)
}

export function assistPatternAlertId(id: AssistPatternParityId): string {
  return `assist-${id.toLowerCase()}`
}

export function adaptAssistPatternToSymphonyAlert(
  pattern: AssistPatternParityDefinition,
  options: AdaptAssistPatternToSymphonyAlertOptions = {}
): SymphonyAlert {
  const triggeredAt = options.triggeredAt ?? new Date().toISOString()
  const protocol = pattern.actionProtocolId ?? 'no_protocol'
  const score = pattern.criteria.minScore === undefined ? 'all_required' : String(pattern.criteria.minScore)

  return attachSymphonyActionProtocol({
    id: assistPatternAlertId(pattern.id),
    severity: pattern.severity,
    title: pattern.title,
    reasoning: [
      `Assist pattern ${pattern.id} mapped from ${pattern.sourceFile}.`,
      `Clinical gate ${pattern.gate}; tier ${pattern.tier}; protocol ${protocol}.`,
      `Criteria: required=${pattern.criteria.required.length}, scored=${pattern.criteria.scored.length}, minScore=${score}.`,
      pattern.reasoning,
      `Source: ${pattern.source}.`,
    ],
    source: 'pattern',
    gate: mapAssistPatternParityGateToSymphonySafetyGate(pattern.gate),
    actionProtocolId: pattern.actionProtocolId,
    acknowledged: options.acknowledged ?? false,
    triggeredAt,
  })
}

export function runAssistPatternParityFixture(
  fixture: AssistPatternParityFixtureCase,
  options: AdaptAssistPatternToSymphonyAlertOptions = {}
): AssistPatternParityFixtureResult {
  const pattern = getAssistPatternParityDefinition(fixture.patternId)

  if (!pattern) {
    return {
      patternId: fixture.patternId,
      passed: false,
      mismatches: [`missing Assist pattern parity definition ${fixture.patternId}`],
      alert: {
        id: fixture.expectedAlertId,
        severity: fixture.expectedSeverity,
        title: fixture.expectedTitle,
        reasoning: [`Missing Assist pattern parity definition ${fixture.patternId}.`],
        source: 'pattern',
        acknowledged: false,
        triggeredAt: options.triggeredAt ?? new Date().toISOString(),
      },
    }
  }

  const alert = adaptAssistPatternToSymphonyAlert(pattern, options)
  const mismatches: string[] = []

  if (alert.id !== fixture.expectedAlertId) {
    mismatches.push(`alert id expected ${fixture.expectedAlertId}, received ${alert.id}`)
  }
  if (alert.severity !== fixture.expectedSeverity) {
    mismatches.push(`severity expected ${fixture.expectedSeverity}, received ${alert.severity}`)
  }
  if (alert.title !== fixture.expectedTitle) {
    mismatches.push(`title expected ${fixture.expectedTitle}, received ${alert.title}`)
  }
  if (!alert.reasoning.some(reason => reason.includes(fixture.expectedGate))) {
    mismatches.push(`missing gate ${fixture.expectedGate} in alert reasoning`)
  }

  return {
    patternId: fixture.patternId,
    passed: mismatches.length === 0,
    mismatches,
    alert,
  }
}

export function runAssistPatternParityFixtures(
  options: AdaptAssistPatternToSymphonyAlertOptions = {},
  fixtures: readonly AssistPatternParityFixtureCase[] = ASSIST_PATTERN_PARITY_FIXTURE_CASES
): AssistPatternParityFixtureResult[] {
  return fixtures.map(fixture => runAssistPatternParityFixture(fixture, options))
}
