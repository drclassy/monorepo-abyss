import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'

import { afterEach, describe, expect, it } from 'vitest'

import { startLiteratureWorker } from '../server.js'

let worker: Awaited<ReturnType<typeof startLiteratureWorker>> | undefined
let reachableTestHost: string | undefined

function collectReachableHostCandidates(): string[] {
  const candidates = ['127.0.0.1']
  const seen = new Set(candidates)

  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) {
        continue
      }

      if (!seen.has(address.address)) {
        seen.add(address.address)
        candidates.push(address.address)
      }
    }
  }

  return candidates
}

async function canSelfFetch(host: string): Promise<boolean> {
  const server = createServer((_req, res) => {
    res.statusCode = 200
    res.end('ok')
  })

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, host, resolve)
    })

    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : 0
    const response = await fetch(`http://${host}:${port}`)
    return response.ok
  } catch {
    return false
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  }
}

async function resolveReachableTestHost(): Promise<string> {
  if (reachableTestHost) {
    return reachableTestHost
  }

  for (const host of collectReachableHostCandidates()) {
    if (await canSelfFetch(host)) {
      reachableTestHost = host
      return host
    }
  }

  throw new Error('No reachable local host found for literature worker tests.')
}

async function startTestWorker(
  config: Parameters<typeof startLiteratureWorker>[0] = {}
): Promise<Awaited<ReturnType<typeof startLiteratureWorker>>> {
  return startLiteratureWorker({
    ...config,
    host: config.host ?? (await resolveReachableTestHost()),
  })
}

afterEach(async () => {
  if (worker) {
    await worker.close()
    worker = undefined
  }
})

describe('literature worker', () => {
  it('serves health and harvest requests', async () => {
    worker = await startTestWorker({
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

    const health = await fetch(`${worker.url}/health`).then(
      (res) => res.json() as Promise<{ status: string }>
    )
    expect(health.status).toBe('ok')

    const harvestResponse = await fetch(`${worker.url}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'heart failure', limit: 1 }),
    })

    expect(harvestResponse.status).toBe(200)
    const payload = (await harvestResponse.json()) as {
      query: string
      counts: { searched: number }
    }
    expect(payload.query).toBe('heart failure')
    expect(payload.counts.searched).toBe(1)
  })

  it('rejects invalid harvest requests', async () => {
    worker = await startTestWorker({ port: 0 })

    const response = await fetch(`${worker.url}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
  })

  it('returns an operational error status for upstream harvest failures', async () => {
    worker = await startTestWorker({
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
