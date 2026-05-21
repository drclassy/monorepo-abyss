import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it, vi } from 'vitest'

import { buildEuropePmcSearchUrl } from '../connectors.js'
import { LiteratureHarvester } from '../harvester.js'
import type { FetchLike } from '../types.js'
import { dedupeRecords, slugify } from '../utils.js'

function createMockFetch(): FetchLike {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('europepmc/webservices/rest/search')) {
      return new Response(
        JSON.stringify({
          resultList: {
            result: [
              {
                id: 'PMC12345',
                source: 'PMC',
                title: 'Open access trial',
                abstractText: 'Clinical abstract',
                pmcid: 'PMC12345',
                doi: '10.1000/example',
                pubYear: '2024',
                authorString: 'Doe J; Roe R',
                isOpenAccess: 'Y',
                score: '12.5',
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (url.includes('PMC12345/fullTextXML')) {
      return new Response('<article>full text</article>', {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    if (url.includes('eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')) {
      return new Response(JSON.stringify({ esearchresult: { idlist: [] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.includes('api.crossref.org/works')) {
      return new Response(JSON.stringify({ message: { items: [] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as FetchLike
}

describe('literature harvester', () => {
  it('builds the Europe PMC open-access query URL', () => {
    const url = buildEuropePmcSearchUrl('heart failure', { limit: 3 })

    expect(url).toContain('query=heart+failure+OPEN_ACCESS%3AY')
    expect(url).toContain('pageSize=3')
    expect(url).toContain('format=json')
  })

  it('dedupes records by DOI/title', () => {
    const records = dedupeRecords([
      {
        source: 'europe-pmc',
        sourceId: '1',
        title: 'Same title',
        openAccess: true,
      },
      {
        source: 'pubmed',
        sourceId: '2',
        title: 'same title',
        openAccess: true,
      },
    ])

    expect(records).toHaveLength(1)
  })

  it('harvests open-access records into a manifest and full-text file', async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), 'literature-harvester-'))
    const fetchImpl = createMockFetch()
    const harvester = new LiteratureHarvester({
      outputDir,
      fetchImpl,
      sources: ['europe-pmc'],
      limit: 5,
    })

    const result = await harvester.harvest('heart failure')

    expect(result.counts.searched).toBe(1)
    expect(result.counts.downloaded).toBe(1)
    expect(result.records[0]?.status).toBe('downloaded')
    expect(result.records[0]?.contentPath).toBeDefined()

    const manifest = JSON.parse(await readFile(result.manifestPath, 'utf8')) as {
      query: string
      counts: { downloaded: number }
    }
    expect(manifest.query).toBe('heart failure')
    expect(manifest.counts.downloaded).toBe(1)

    expect(slugify('Open access trial')).toBe('open-access-trial')
    expect(fetchImpl).toHaveBeenCalled()
  })

  it('anchors the default output directory to library/medical/literature-harvests', async () => {
    const fetchImpl = createMockFetch()
    const harvester = new LiteratureHarvester({
      fetchImpl,
      sources: ['europe-pmc'],
      limit: 1,
    })

    const result = await harvester.harvest('repo anchor check')
    const testDir = path.dirname(fileURLToPath(import.meta.url))
    const expectedRoot = path.resolve(testDir, '../../../../library/medical/literature-harvests')

    expect(result.outputDir.startsWith(expectedRoot)).toBe(true)
    await rm(result.outputDir, { recursive: true, force: true })
  })
})
