// Designed and constructed by Avvcenna+.
/**
 * symptom-signals — RED test suite for the deterministic Indonesian
 * symptom-signals NLP module.
 *
 * Phase 1 of the SYMPHONY canonicalization migration (Gap #8 in the
 * 2026-04-20 coverage audit). Pure TS, zero runtime deps. Negation-aware
 * matcher with a 3-token left window.
 */

import { describe, expect, it } from 'vitest'

import {
  detectSymphonySymptomSignals,
  type SymphonySymptomSignalInput,
  type SymphonySymptomSignalResult,
} from '../index'

describe('SYMPHONY symptom signals', () => {
  it('returns empty signal set for empty input', () => {
    const input: SymphonySymptomSignalInput = {
      chiefComplaint: '',
    }
    const result: SymphonySymptomSignalResult = detectSymphonySymptomSignals(input)
    expect(result.signals).toEqual([])
    expect(result.negatedSignals).toEqual([])
  })

  it('detects fever from positive Indonesian terms', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'demam tinggi sejak kemarin' })
    expect(result.signals).toContain('fever')
    expect(result.negatedSignals).not.toContain('fever')
  })

  it('strips fever when negated with "tidak"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'tidak demam, cuma lemas' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('strips fever when negated with "tanpa"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'batuk tanpa demam' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('detects fever from panas and meriang synonyms', () => {
    const resultPanas = detectSymphonySymptomSignals({ chiefComplaint: 'panas badan sejak 2 hari' })
    const resultMeriang = detectSymphonySymptomSignals({
      chiefComplaint: 'meriang sepanjang malam',
    })
    expect(resultPanas.signals).toContain('fever')
    expect(resultMeriang.signals).toContain('fever')
  })

  it('detects dyspnea from sesak and sulit napas', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sesak napas saat aktivitas' }).signals
    ).toContain('dyspnea')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sulit napas sejak pagi' }).signals
    ).toContain('dyspnea')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'pasien susah napas' }).signals
    ).toContain('dyspnea')
  })

  it('strips dyspnea when negated', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'batuk tanpa sesak' })
    expect(result.signals).not.toContain('dyspnea')
    expect(result.negatedSignals).toContain('dyspnea')
  })

  it('detects chest_pain from multi-token variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'nyeri dada menjalar ke lengan kiri' })
        .signals
    ).toContain('chest_pain')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sakit dada sejak 1 jam' }).signals
    ).toContain('chest_pain')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'dada sakit saat tarik napas' }).signals
    ).toContain('chest_pain')
  })

  it('strips chest_pain when negated', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'tidak nyeri dada sama sekali' })
    expect(result.signals).not.toContain('chest_pain')
    expect(result.negatedSignals).toContain('chest_pain')
  })

  it('detects headache from sakit kepala and thunderclap variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sakit kepala hebat mendadak' }).signals
    ).toContain('headache')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'nyeri kepala sejak kemarin' }).signals
    ).toContain('headache')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'thunderclap pagi ini' }).signals
    ).toContain('headache')
  })

  it('detects vomit from muntah variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'muntah 5 kali sejak pagi' }).signals
    ).toContain('vomit')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'mual muntah terus-menerus' }).signals
    ).toContain('vomit')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'muntah darah segar' }).signals
    ).toContain('vomit')
  })

  it('detects seizure from kejang variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'kejang 10 menit' }).signals
    ).toContain('seizure')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'kejang demam berulang' }).signals
    ).toContain('seizure')
  })

  it('detects altered_consciousness from penurunan kesadaran and delirium', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'penurunan kesadaran sejak 1 jam' }).signals
    ).toContain('altered_consciousness')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'pasien bingung dan disorientasi' }).signals
    ).toContain('altered_consciousness')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'delirium akut' }).signals
    ).toContain('altered_consciousness')
  })

  it('detects altered_consciousness from "tidak sadar" without negation stripping', () => {
    const result = detectSymphonySymptomSignals({
      chiefComplaint: 'pasien tidak sadar sejak tadi pagi',
    })
    expect(result.signals).toContain('altered_consciousness')
    expect(result.negatedSignals).not.toContain('altered_consciousness')
  })

  it('detects bleeding from multiple Indonesian variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'perdarahan hebat dari hidung' }).signals
    ).toContain('bleeding')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'gusi berdarah' }).signals
    ).toContain('bleeding')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'mimisan' }).signals).toContain(
      'bleeding'
    )
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'BAB hitam sejak 3 hari' }).signals
    ).toContain('bleeding')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'melena berulang' }).signals
    ).toContain('bleeding')
  })

  it('detects pallor from pucat and anemis', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'wajah pucat, konjungtiva pucat' }).signals
    ).toContain('pallor')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'tampak anemis' }).signals
    ).toContain('pallor')
  })

  it('detects weakness from lemas, lemah, letih', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'badan lemas seharian' }).signals
    ).toContain('weakness')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'lemah tidak bertenaga' }).signals
    ).toContain('weakness')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'letih terus menerus' }).signals).toContain(
      'weakness'
    )
  })

  it('detects dizziness from pusing berputar and vertigo', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'pusing berputar saat bangun' }).signals
    ).toContain('dizziness')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'vertigo hebat' }).signals).toContain(
      'dizziness'
    )
  })

  it('allows pusing to co-signal both headache and dizziness (no mutex)', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'pusing sejak pagi' })
    expect(result.signals).toContain('headache')
    expect(result.signals).toContain('dizziness')
  })

  it('detects syncope from pingsan and mau pingsan', () => {
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'pingsan 2 kali hari ini' }).signals).toContain(
      'syncope'
    )
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'merasa mau pingsan saat berdiri' }).signals
    ).toContain('syncope')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'sinkop berulang' }).signals).toContain(
      'syncope'
    )
  })

  it('detects diaphoresis from keringat dingin variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'keringat dingin disertai nyeri dada' })
        .signals
    ).toContain('diaphoresis')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'berkeringat dingin tiba-tiba' }).signals
    ).toContain('diaphoresis')
  })

  it('detects allergen_exposure from common exposure phrases', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'setelah makan seafood langsung gatal' })
        .signals
    ).toContain('allergen_exposure')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'setelah minum obat amoksilin' }).signals
    ).toContain('allergen_exposure')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'paparan alergen di tempat kerja' }).signals
    ).toContain('allergen_exposure')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'tersengat tawon pagi tadi' }).signals
    ).toContain('allergen_exposure')
  })

  it('detects rash_or_angioedema from ruam, urtikaria, angioedema', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'ruam kemerahan di seluruh tubuh' }).signals
    ).toContain('rash_or_angioedema')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'urtikaria akut' }).signals
    ).toContain('rash_or_angioedema')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'bengkak muka dan bibir' }).signals
    ).toContain('rash_or_angioedema')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'angioedema mendadak' }).signals
    ).toContain('rash_or_angioedema')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'gatal seluruh tubuh' }).signals).toContain(
      'rash_or_angioedema'
    )
  })

  it('detects abdominal_pain from nyeri perut variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'nyeri perut kanan atas' }).signals
    ).toContain('abdominal_pain')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'sakit perut kram' }).signals
    ).toContain('abdominal_pain')
    expect(detectSymphonySymptomSignals({ chiefComplaint: 'kolik bilier' }).signals).toContain(
      'abdominal_pain'
    )
  })

  it('detects kussmaul_breathing from multi-token and case-insensitive variants', () => {
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'Kussmaul breathing pada DKA' }).signals
    ).toContain('kussmaul_breathing')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'napas dalam dan cepat' }).signals
    ).toContain('kussmaul_breathing')
    expect(
      detectSymphonySymptomSignals({ chiefComplaint: 'napas cepat dalam' }).signals
    ).toContain('kussmaul_breathing')
  })
})
