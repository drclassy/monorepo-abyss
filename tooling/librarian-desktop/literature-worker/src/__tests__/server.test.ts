import { afterEach, describe, expect, it } from 'vitest'

import { startLiteratureWorker } from '../server.js'

let worker: Awaited<ReturnType<typeof startLiteratureWorker>> | undefined

afterEach(async () => {
  if (worker) {
    await worker.close()
    worker = undefined
  }
})

describe('literature worker', () => {
  it('serves health and harvest requests', async () => {
    worker = await startLiteratureWorker({
      port: 0,
      harvesterConfig: {
        outputDir: 'C:/tmp/literature-worker-test',
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              resultList: {
                result: [
                  {
                    id: 'PMC1',
                    pmcid: 'PMC1',
                    title: 'Worker trial',
                    isOpenAccess: 'Y',
                    fullTextUrl: 'https://example.org/fulltext.xml',
                  },
                ],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          ),
      },
    })

    const health = await fetch(`${worker.url}/health`).then((res) => res.json() as Promise<{ status: string }>)
    expect(health.status).toBe('ok')

    const harvestResponse = await fetch(`${worker.url}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'heart failure', limit: 1 }),
    })

    expect(harvestResponse.status).toBe(200)
    const payload = await harvestResponse.json() as { query: string; counts: { searched: number } }
    expect(payload.query).toBe('heart failure')
    expect(payload.counts.searched).toBe(1)
  })

  it('rejects invalid harvest requests', async () => {
    worker = await startLiteratureWorker({ port: 0 })

    const response = await fetch(`${worker.url}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
  })

  it('returns an operational error status for upstream harvest failures', async () => {
    worker = await startLiteratureWorker({
      port: 0,
      harvesterConfig: {
        fetchImpl: async () => new Response('upstream unavailable', { status: 503 }),
      },
    })

    const response = await fetch(`${worker.url}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'sepsis' }),
    })

    expect(response.status).toBe(502)
  })
})

