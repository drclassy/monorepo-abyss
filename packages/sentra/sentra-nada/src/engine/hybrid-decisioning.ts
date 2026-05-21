// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyDecisionCategory,
  SymphonyDiagnosisSuggestion,
  SymphonyPatientContext,
  SymphonyVitalsInput,
} from '../contracts'

export interface SymphonyHybridValidationFlag {
  type: string
  message: string
}

export interface SymphonyHybridDiagnosisCandidate {
  icd10Code: string
  diagnosisName: string
  confidence: number
  keywordScore?: number
  semanticScore?: number
  ragVerified?: boolean
  keyReasons?: string[]
  missingInformation?: string[]
  redFlags?: string[]
  recommendedActions?: string[]
  validationFlags?: SymphonyHybridValidationFlag[]
  searchText?: string
}

export interface SymphonyHybridDecisionInput {
  candidates: SymphonyHybridDiagnosisCandidate[]
  patientContext?: SymphonyPatientContext
  latestVitals?: SymphonyVitalsInput
  chiefComplaint?: string
  additionalComplaint?: string
  medicalHistory?: string[]
  allergies?: string[]
}

export interface SymphonyHybridDecisionCounts {
  recommended: number
  review: number
  mustNotMiss: number
  deferred: number
}

export interface SymphonyHybridDecisionResult {
  suggestions: SymphonyDiagnosisSuggestion[]
  nextBestQuestions: string[]
  requiresMoreData: boolean
  counts: SymphonyHybridDecisionCounts
  auditHints: string[]
}

interface ScoredCandidate {
  candidate: SymphonyHybridDiagnosisCandidate
  deterministicScore: number
  decisionCategory: SymphonyDecisionCategory
  dangerSignal: boolean
  impossibleContext: boolean
  noGrounding: boolean
}

const GENERIC_RED_FLAG_TOKENS = new Set([
  'nyeri',
  'sakit',
  'demam',
  'berat',
  'akut',
  'kronik',
  'gangguan',
  'disertai',
  'dengan',
  'tanda',
  'curiga',
  'pasien',
  'perlu',
  'riwayat',
])

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function hasValidationFlag(candidate: SymphonyHybridDiagnosisCandidate, type: string): boolean {
  return candidate.validationFlags?.some((flag) => flag.type === type) ?? false
}

function contextText(input: SymphonyHybridDecisionInput): string {
  return normalizeText(
    [
      input.chiefComplaint ?? '',
      input.additionalComplaint ?? '',
      ...(input.medicalHistory ?? []),
      ...(input.allergies ?? []),
    ].join(' ')
  )
}

function candidateText(candidate: SymphonyHybridDiagnosisCandidate): string {
  return normalizeText(
    [
      candidate.diagnosisName,
      candidate.searchText ?? '',
      ...(candidate.keyReasons ?? []),
      ...(candidate.redFlags ?? []),
      ...(candidate.recommendedActions ?? []),
    ].join(' ')
  )
}

function textHasMeaningfulOverlap(source: string, target: string): boolean {
  const tokens = normalizeText(source)
    .split(' ')
    .filter((token) => token.length >= 4 && !GENERIC_RED_FLAG_TOKENS.has(token))

  if (tokens.length === 0) return false

  const overlapCount = tokens.filter((token) => target.includes(token)).length
  return overlapCount >= Math.min(2, tokens.length)
}

function textHasAnyMeaningfulOverlap(source: string, target: string): boolean {
  const tokens = normalizeText(source)
    .split(' ')
    .filter((token) => token.length >= 4 && !GENERIC_RED_FLAG_TOKENS.has(token))

  return tokens.some((token) => target.includes(token))
}

function explainsChiefComplaint(
  input: SymphonyHybridDecisionInput,
  candidate: SymphonyHybridDiagnosisCandidate
): boolean {
  const complaint = normalizeText(
    [input.chiefComplaint ?? '', input.additionalComplaint ?? ''].join(' ')
  )
  if (!complaint) return false
  return textHasAnyMeaningfulOverlap(complaint, candidateText(candidate))
}

function redFlagMatchesContext(
  input: SymphonyHybridDecisionInput,
  candidate: SymphonyHybridDiagnosisCandidate
): boolean {
  const redFlags = candidate.redFlags ?? []
  if (redFlags.length === 0) return false

  const currentContextText = contextText(input)
  if (!currentContextText) return false

  return redFlags.some((flag) => {
    const normalizedFlag = normalizeText(flag)
    if (!normalizedFlag) return false
    if (currentContextText.includes(normalizedFlag)) return true
    return textHasMeaningfulOverlap(normalizedFlag, currentContextText)
  })
}

function isDangerSignal(
  input: SymphonyHybridDecisionInput,
  candidate: SymphonyHybridDiagnosisCandidate
): boolean {
  if ((candidate.redFlags?.length ?? 0) > 0) return true
  if (
    (candidate.recommendedActions ?? []).some((action) =>
      /rujuk|segera|emergensi|igd|stabilisasi/i.test(action)
    )
  ) {
    return true
  }
  return redFlagMatchesContext(input, candidate)
}

function buildDecisionReason(scored: ScoredCandidate): string {
  if (scored.impossibleContext) {
    return 'Konteks pasien tidak sesuai; jangan jadikan diagnosis kerja tanpa verifikasi ulang.'
  }

  if (scored.noGrounding) {
    return 'Kode atau nama diagnosis belum terverifikasi sehingga hanya boleh menjadi bahan telaah.'
  }

  switch (scored.decisionCategory) {
    case 'recommended':
      return scored.candidate.ragVerified
        ? 'Konsisten dengan KB lokal, konteks pasien, dan ranking hybrid.'
        : 'Masih paling relevan, tetapi tetap perlu kehati-hatian klinis.'
    case 'review':
      return (
        scored.candidate.validationFlags?.[0]?.message ??
        'Masih mungkin relevan, tetapi data klinis belum cukup kuat.'
      )
    case 'must_not_miss':
      return 'Bukan diagnosis kerja utama, tetapi berisiko bila terlewat dan harus dipertimbangkan.'
    case 'deferred':
      return 'Belum cukup kuat untuk dipakai sebagai diagnosis kerja.'
  }
}

function scoreCandidate(
  input: SymphonyHybridDecisionInput,
  candidate: SymphonyHybridDiagnosisCandidate
): ScoredCandidate {
  let score =
    clamp01(candidate.confidence) * 0.36 +
    clamp01(candidate.keywordScore ?? 0) * 0.36 +
    clamp01(candidate.semanticScore ?? 0) * 0.22

  if (candidate.ragVerified) score += 0.12
  if (explainsChiefComplaint(input, candidate)) score += 0.08
  if ((candidate.keyReasons?.length ?? 0) >= 2) score += 0.03
  if ((candidate.missingInformation?.length ?? 0) >= 2) score -= 0.08
  if (hasValidationFlag(candidate, 'name_mismatch')) score -= 0.18
  if (hasValidationFlag(candidate, 'age_implausible')) score -= 0.2
  if (hasValidationFlag(candidate, 'sex_implausible')) score -= 0.25
  if (hasValidationFlag(candidate, 'pregnancy_implausible')) score -= 0.3
  if (hasValidationFlag(candidate, 'allergy_conflict')) score -= 0.15
  if (
    hasValidationFlag(candidate, 'icd_not_found') ||
    hasValidationFlag(candidate, 'missing_icd')
  ) {
    score -= 0.45
  }

  const deterministicScore = Math.round(clamp01(score) * 1000) / 1000
  const dangerSignal = isDangerSignal(input, candidate)
  const impossibleContext =
    hasValidationFlag(candidate, 'sex_implausible') ||
    hasValidationFlag(candidate, 'pregnancy_implausible')
  const noGrounding =
    hasValidationFlag(candidate, 'icd_not_found') || hasValidationFlag(candidate, 'missing_icd')

  let decisionCategory: SymphonyDecisionCategory = 'deferred'
  if (dangerSignal && !impossibleContext && deterministicScore >= 0.34) {
    decisionCategory = 'must_not_miss'
  }
  if (
    !dangerSignal &&
    !impossibleContext &&
    !noGrounding &&
    candidate.ragVerified &&
    deterministicScore >= 0.58
  ) {
    decisionCategory = 'recommended'
  } else if (!dangerSignal && deterministicScore >= 0.28) {
    decisionCategory = 'review'
  } else if (dangerSignal && !impossibleContext) {
    decisionCategory = 'must_not_miss'
  }

  return {
    candidate,
    deterministicScore,
    decisionCategory,
    dangerSignal,
    impossibleContext,
    noGrounding,
  }
}

function orderScoredCandidates(scored: ScoredCandidate[]): ScoredCandidate[] {
  const byScore = (left: ScoredCandidate, right: ScoredCandidate) =>
    right.deterministicScore - left.deterministicScore

  return [
    ...scored.filter((item) => item.decisionCategory === 'recommended').sort(byScore),
    ...scored.filter((item) => item.decisionCategory === 'review').sort(byScore),
    ...scored.filter((item) => item.decisionCategory === 'must_not_miss').sort(byScore),
    ...scored.filter((item) => item.decisionCategory === 'deferred').sort(byScore),
  ].slice(0, 5)
}

function buildNextBestQuestions(
  input: SymphonyHybridDecisionInput,
  ordered: ScoredCandidate[],
  counts: SymphonyHybridDecisionCounts
): string[] {
  const questions = new Set<string>()

  for (const item of ordered) {
    for (const info of item.candidate.missingInformation ?? []) {
      if (info.trim()) questions.add(info.trim())
      if (questions.size >= 5) return [...questions]
    }
  }

  if (!input.additionalComplaint?.trim()) {
    questions.add('Apa gejala penyerta utama, durasi, dan progresivitas keluhan?')
  }

  if (
    !input.latestVitals?.temperatureC &&
    !input.latestVitals?.heartRate &&
    !input.latestVitals?.systolicBp
  ) {
    questions.add('Mohon lengkapi tanda vital utama untuk memperkuat differential diagnosis.')
  }

  const patient = input.patientContext
  if (
    patient?.sexAtBirth === 'female' &&
    patient.ageYears !== undefined &&
    patient.ageYears >= 12 &&
    patient.ageYears <= 55 &&
    patient.pregnancyStatus === 'unknown'
  ) {
    questions.add(
      'Pastikan status kehamilan dan tanggal haid terakhir bila keluhan mendukung konteks obstetri.'
    )
  }

  if (counts.recommended === 0) {
    questions.add(
      'Konfirmasi diagnosis kerja dengan pemeriksaan fisik dan data penunjang yang relevan.'
    )
  }

  return [...questions].slice(0, 5)
}

function toSuggestion(scored: ScoredCandidate, rank: number): SymphonyDiagnosisSuggestion {
  const candidate = scored.candidate

  return {
    id: `symphony-diagnosis-${candidate.icd10Code.toLowerCase().replaceAll('.', '-')}-${rank}`,
    icd10Code: candidate.icd10Code,
    diagnosisName: candidate.diagnosisName,
    confidence: scored.deterministicScore,
    decisionCategory: scored.decisionCategory,
    reasoning: [
      buildDecisionReason(scored),
      ...(candidate.keyReasons ?? []).slice(0, 4),
      ...(candidate.recommendedActions ?? []).slice(0, 2),
    ],
    evidenceRefs: [
      'rank_source:hybrid',
      `deterministic_score:${scored.deterministicScore}`,
      `rag_verified:${candidate.ragVerified === true}`,
      `danger_signal:${scored.dangerSignal}`,
      ...(candidate.validationFlags ?? []).map((flag) => `validation_flag:${flag.type}`),
    ],
    mustNotMiss: scored.decisionCategory === 'must_not_miss',
  }
}

export function applySymphonyHybridDecisioning(
  input: SymphonyHybridDecisionInput
): SymphonyHybridDecisionResult {
  const scored = input.candidates
    .filter((candidate) => candidate.icd10Code.trim() && candidate.diagnosisName.trim())
    .map((candidate) => scoreCandidate(input, candidate))
  const ordered = orderScoredCandidates(scored)

  const counts = {
    recommended: scored.filter((item) => item.decisionCategory === 'recommended').length,
    review: scored.filter((item) => item.decisionCategory === 'review').length,
    mustNotMiss: scored.filter((item) => item.decisionCategory === 'must_not_miss').length,
    deferred: scored.filter((item) => item.decisionCategory === 'deferred').length,
  }
  const nextBestQuestions = buildNextBestQuestions(input, ordered, counts)
  const requiresMoreData =
    counts.recommended === 0 ||
    nextBestQuestions.length > 0 ||
    scored.every((item) => (item.candidate.missingInformation?.length ?? 0) > 0)

  return {
    suggestions: ordered.map((item, index) => toSuggestion(item, index + 1)),
    nextBestQuestions,
    requiresMoreData,
    counts,
    auditHints: [
      `diagnosis_candidate_count:${input.candidates.length}`,
      `diagnosis_recommended_count:${counts.recommended}`,
      `diagnosis_review_count:${counts.review}`,
      `diagnosis_must_not_miss_count:${counts.mustNotMiss}`,
      `diagnosis_deferred_count:${counts.deferred}`,
      `diagnosis_requires_more_data:${requiresMoreData}`,
    ],
  }
}
