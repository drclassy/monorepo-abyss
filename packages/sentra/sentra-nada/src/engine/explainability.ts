// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
export interface SymphonyExplainabilityInput {
  topDiagnosisName: string
  supportKeys: readonly string[]
  missingKeys: readonly string[]
  weakenKeys?: readonly string[]
  nextBestQuestions?: readonly string[]
  arbitrationReasons?: readonly string[]
}

const ARBITER_REASON_NARRATIVE: Record<string, string> = {
  safety_critical_alert_present: 'Alert kritikal terdeteksi — verifikasi keselamatan pasien.',
  native_must_not_miss_visible: 'Diagnosis must-not-miss aktif — pertimbangkan workup kritis.',
  consciousness_compromised: 'Tingkat kesadaran terganggu — tinjau jalur napas dan perfusi.',
  treatment_response_worsening: 'Respons terapi memburuk — review eskalasi terapi.',
  baseline_thin_with_working_hypothesis:
    'Baseline pasien terbatas — konfirmasi konteks klinis sebelum eskalasi.',
}

function describeReasons(reasons: readonly string[]): string {
  return reasons.map((key) => ARBITER_REASON_NARRATIVE[key] ?? key).join(' ')
}

export function composeSymphonyExplainability(input: SymphonyExplainabilityInput): string[] {
  const lines: string[] = []

  lines.push(`Diagnosis utama saat ini: ${input.topDiagnosisName}.`)

  lines.push(
    `Faktor pendukung: ${input.supportKeys.length > 0 ? input.supportKeys.join(', ') : 'tidak ada'}.`
  )

  if (input.weakenKeys && input.weakenKeys.length > 0) {
    lines.push(`Faktor pelemah: ${input.weakenKeys.join(', ')}.`)
  }

  lines.push(
    `Data yang masih dibutuhkan: ${input.missingKeys.length > 0 ? input.missingKeys.join(', ') : 'tidak ada'}.`
  )

  if (input.nextBestQuestions && input.nextBestQuestions.length > 0) {
    lines.push(`Pertanyaan klinis lanjutan: ${input.nextBestQuestions.join(' ')}`)
  }

  if (input.arbitrationReasons && input.arbitrationReasons.length > 0) {
    lines.push(`Catatan arbiter: ${describeReasons(input.arbitrationReasons)}`)
  }

  return lines
}
