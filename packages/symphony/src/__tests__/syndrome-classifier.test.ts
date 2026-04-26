import { describe, expect, it } from 'vitest'

import { classifySymphonySyndromes } from '../index'

describe('classifySymphonySyndromes', () => {
  it('maps respiratory infection evidence into acute respiratory syndrome', () => {
    const result = classifySymphonySyndromes([
      { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'symptom_dyspnea', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'news2_risk', value: 'medium', sourceRefs: ['news2'] },
    ])

    expect(result.map(item => item.id)).toContain('acute_respiratory_syndrome')
  })

  it('maps fever-only evidence into acute febrile syndrome', () => {
    const result = classifySymphonySyndromes([
      { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
    ])

    expect(result.map(item => item.id)).toContain('acute_febrile_syndrome')
  })

  it('maps severe pressure and chronic context into cardiometabolic syndrome', () => {
    const result = classifySymphonySyndromes([
      { key: 'htn_severity', value: 'crisis', sourceRefs: ['classifiers'] },
      { key: 'trajectory_direction', value: 'worsening', sourceRefs: ['trajectory'] },
    ])

    expect(result.map(item => item.id)).toContain('acute_cardiometabolic_syndrome')
  })

  it('produces deterministic output: same input yields identical result', () => {
    const facts = [
      { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'symptom_dyspnea', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'htn_severity', value: 'stage2', sourceRefs: ['classifiers'] },
    ]
    const first = classifySymphonySyndromes(facts)
    const second = classifySymphonySyndromes(facts)

    expect(first).toEqual(second)
  })

  it('returns empty array when no canonical syndrome triggers fire', () => {
    const result = classifySymphonySyndromes([
      { key: 'news2_risk', value: 'low', sourceRefs: ['news2'] },
      { key: 'pattern_alert_count', value: 0, sourceRefs: ['clinical-patterns'] },
    ])

    expect(result).toEqual([])
  })
})
