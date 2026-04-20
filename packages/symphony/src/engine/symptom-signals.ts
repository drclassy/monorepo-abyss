// Designed and constructed by Avvcenna+.
/**
 * symptom-signals — deterministic Indonesian symptom-signals NLP evaluator.
 *
 * Phase 1 of the SYMPHONY canonicalization migration (closes Gap #8 in the
 * 2026-04-20 coverage audit). Pure TS, zero runtime dependencies.
 *
 * Hierarchy: SYMPHONY (parent) exposes this evaluator so Dashboard + Assist
 * consumers may extract normalized symptom signals from free-text anamnesis
 * without duplicating domain logic. Negation-aware via a 3-token left window.
 */

export type SymphonySymptomSignal =
  | 'fever'
  | 'dyspnea'
  | 'chest_pain'
  | 'headache'
  | 'vomit'
  | 'seizure'
  | 'altered_consciousness'
  | 'bleeding'
  | 'pallor'
  | 'weakness'
  | 'dizziness'
  | 'syncope'
  | 'diaphoresis'
  | 'rash_or_angioedema'
  | 'allergen_exposure'
  | 'abdominal_pain'
  | 'kussmaul_breathing'
  | 'polyuria'
  | 'neurologic_focal_deficit'

export interface SymphonySymptomSignalInput {
  chiefComplaint: string
  additionalComplaint?: string
  medicalHistory?: string
}

export interface SymphonySymptomSignalResult {
  signals: SymphonySymptomSignal[]
  negatedSignals: SymphonySymptomSignal[]
}

const NEGATION_PREFIXES = ['tidak ada', 'tidak', 'tanpa', 'bukan', 'belum']
const NEGATION_WINDOW_TOKENS = 3

interface SignalMatcher {
  signal: SymphonySymptomSignal
  keywords: string[]
}

const MATCHERS: SignalMatcher[] = [
  { signal: 'fever', keywords: ['demam', 'panas badan', 'panas', 'meriang', 'menggigil'] },
  {
    signal: 'dyspnea',
    keywords: ['sesak napas', 'sulit napas', 'susah napas', 'sesak'],
  },
  {
    signal: 'chest_pain',
    keywords: ['nyeri dada pleuritik', 'nyeri dada', 'sakit dada', 'dada sakit'],
  },
  {
    signal: 'headache',
    keywords: [
      'sakit kepala hebat',
      'sakit kepala',
      'nyeri kepala',
      'kepala sakit',
      'thunderclap',
      'pusing',
    ],
  },
  {
    signal: 'vomit',
    keywords: ['muntah darah', 'mual muntah', 'muntah'],
  },
  {
    signal: 'seizure',
    keywords: ['kejang demam', 'kejang'],
  },
  {
    signal: 'altered_consciousness',
    // NOTE: `tidak sadar` starts with a negation prefix; because isNegatedAt
    // scans tokens STRICTLY LEFT OF matchIndex, the intra-keyword `tidak` is
    // not seen as negation. Keep the multi-token form to avoid a bare `sadar`
    // keyword that would flip under "tidak sadar".
    keywords: [
      'penurunan kesadaran',
      'tidak sadar',
      'mengantuk berat',
      'disorientasi',
      'delirium',
      'bingung',
    ],
  },
  {
    signal: 'bleeding',
    keywords: [
      'bab hitam',
      'perdarahan',
      'berdarah',
      'mimisan',
      'hematemesis',
      'hematochezia',
      'melena',
    ],
  },
  {
    signal: 'pallor',
    keywords: ['pucat', 'pallor', 'anemis'],
  },
  {
    signal: 'weakness',
    keywords: ['lemas', 'lemah', 'letih'],
  },
  {
    signal: 'dizziness',
    keywords: ['pusing berputar', 'vertigo', 'pusing'],
  },
  {
    signal: 'syncope',
    keywords: ['mau pingsan', 'mau jatuh', 'pingsan', 'sinkop'],
  },
  {
    signal: 'diaphoresis',
    keywords: ['berkeringat dingin', 'keringat dingin'],
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isNegatedAt(tokens: string[], matchIndex: number): boolean {
  const windowStart = Math.max(0, matchIndex - NEGATION_WINDOW_TOKENS)
  const windowTokens = tokens.slice(windowStart, matchIndex)
  const windowText = windowTokens.join(' ')
  return NEGATION_PREFIXES.some((prefix) => windowText.includes(prefix))
}

function matchSignal(
  tokens: string[],
  matcher: SignalMatcher
): { matched: boolean; negated: boolean } {
  for (const keyword of matcher.keywords) {
    const keywordTokens = keyword.split(' ')
    for (let i = 0; i <= tokens.length - keywordTokens.length; i += 1) {
      const slice = tokens.slice(i, i + keywordTokens.length).join(' ')
      if (slice === keyword) {
        return { matched: true, negated: isNegatedAt(tokens, i) }
      }
    }
  }
  return { matched: false, negated: false }
}

export function detectSymphonySymptomSignals(
  input: SymphonySymptomSignalInput
): SymphonySymptomSignalResult {
  const joined = [input.chiefComplaint, input.additionalComplaint, input.medicalHistory]
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .map(normalize)
    .join(' ')

  const tokens = joined.length > 0 ? joined.split(' ') : []

  const signals: SymphonySymptomSignal[] = []
  const negatedSignals: SymphonySymptomSignal[] = []

  for (const matcher of MATCHERS) {
    const { matched, negated } = matchSignal(tokens, matcher)
    if (!matched) continue
    if (negated) {
      if (!negatedSignals.includes(matcher.signal)) negatedSignals.push(matcher.signal)
    } else {
      if (!signals.includes(matcher.signal)) signals.push(matcher.signal)
    }
  }

  return { signals, negatedSignals }
}
