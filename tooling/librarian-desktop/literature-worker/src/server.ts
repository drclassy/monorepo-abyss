import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { LiteratureHarvester } from '@the-abyss/literature-harvester'

import type {
  HarvestJobRequest,
  LiteratureWorkerConfig,
  LiteratureWorkerErrorResponse,
  LiteratureWorkerHandle,
  LiteratureWorkerHealth,
} from './types.js'

function jsonResponse(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload, null, 2))
}

class RequestValidationError extends Error {}

function resolveErrorStatus(error: unknown): number {
  if (error instanceof RequestValidationError || error instanceof SyntaxError) {
    return 400
  }

  if (error instanceof Error) {
    if (/\b(search|summary|download) failed\b/i.test(error.message)) {
      return 502
    }
  }

  return 500
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) return undefined

  const raw = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(raw) as unknown
}

function validateHarvestJob(body: unknown): HarvestJobRequest {
  if (!body || typeof body !== 'object') {
    throw new RequestValidationError('Request body must be a JSON object.')
  }

  const input = body as Record<string, unknown>
  const query = input.query
  if (typeof query !== 'string' || !query.trim()) {
    throw new RequestValidationError('Field "query" is required.')
  }

  return {
    query: query.trim(),
    limit: typeof input.limit === 'number' ? input.limit : undefined,
    openAccessOnly: typeof input.openAccessOnly === 'boolean' ? input.openAccessOnly : undefined,
    yearFrom: typeof input.yearFrom === 'number' ? input.yearFrom : undefined,
    yearTo: typeof input.yearTo === 'number' ? input.yearTo : undefined,
    email: typeof input.email === 'string' ? input.email : undefined,
  }
}

export async function startLiteratureWorker(config: LiteratureWorkerConfig = {}): Promise<LiteratureWorkerHandle> {
  const host = config.host ?? '127.0.0.1'
  const port = config.port ?? Number(process.env.LITERATURE_WORKER_PORT ?? 8787)
  const harvester = new LiteratureHarvester(config.harvesterConfig)

  const server = createServer(async (req, res) => {
    try {
      if (!req.url) {
        jsonResponse(res, 400, { error: 'Missing request URL.' } satisfies LiteratureWorkerErrorResponse)
        return
      }

      const url = new URL(req.url, `http://${host}:${port}`)

      if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/ready')) {
        const payload: LiteratureWorkerHealth = { status: 'ok', service: 'literature-worker' }
        jsonResponse(res, 200, payload)
        return
      }

      if (req.method === 'POST' && url.pathname === '/harvest') {
        const body = await readJsonBody(req)
        const job = validateHarvestJob(body)
        const result = await harvester.harvest(job.query, {
          limit: job.limit,
          openAccessOnly: job.openAccessOnly,
          yearFrom: job.yearFrom,
          yearTo: job.yearTo,
          email: job.email,
        })

        jsonResponse(res, 200, result)
        return
      }

      jsonResponse(res, 404, { error: 'Not found.' } satisfies LiteratureWorkerErrorResponse)
    } catch (error) {
      jsonResponse(res, resolveErrorStatus(error), {
        error: error instanceof Error ? error.message : String(error),
      } satisfies LiteratureWorkerErrorResponse)
    }
  })

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening)
      reject(error)
    }

    const onListening = () => {
      server.off('error', onError)
      resolve()
    }

    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, host)
  })

  const address = server.address()
  const actualPort = typeof address === 'object' && address ? address.port : port

  return {
    host,
    port: actualPort,
    url: `http://${host}:${actualPort}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    },
  }
}

