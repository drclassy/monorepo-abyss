import { describe, it, expect } from 'vitest'

describe('medical knowledge mapping', () => {
  it('maps discovery engine results into hits + citations', async () => {
    const fakeResults = [
      {
        document: {
          name: 'documents/1',
          derivedStructData: {
            title: 'Aspirin',
            link: 'https://example.test/aspirin',
            snippets: [{ snippet: '<b>Aspirin</b> adalah obat anti-platelet.<br>Gunakan sesuai indikasi.' }],
          },
        },
      },
      {
        document: {
          name: 'documents/2',
          derivedStructData: {
            title: 'Ibuprofen',
            link: 'https://example.test/ibuprofen',
            extractive_answers: [{ content: '<b>Ibuprofen</b> adalah NSAID.<br>Perhatikan GI risk.' }],
          },
        },
      },
    ]

    let mod: any = null
    try {
      mod = await import('./medical-knowledge-map')
    } catch {
      mod = null
    }

    expect(mod?.mapMedicalKnowledgeResults, 'mapMedicalKnowledgeResults export missing').toBeTypeOf('function')

    const out = mod.mapMedicalKnowledgeResults(fakeResults, { query: 'aspirin', maxHits: 5 })

    expect(out.status).toBe('SUCCESS')
    expect(out.query).toBe('aspirin')
    expect(out.hits).toHaveLength(2)
    expect(out.hits[0].title).toBe('Aspirin')
    expect(out.hits[0].uri).toBe('https://example.test/aspirin')
    expect(out.hits[0].snippet).toContain('Aspirin adalah obat')
    expect(out.answer).toContain('Aspirin adalah obat')
    expect(out.citations).toHaveLength(2)
  })
})
