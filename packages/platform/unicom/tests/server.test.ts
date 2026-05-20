import http from 'node:http'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createUnicomHttpServer } from '../src/server.js'

const PORT = 59850
let server: http.Server

beforeAll(() => {
  server = createUnicomHttpServer(PORT)
})
afterAll(() => {
  server.close()
})

async function get(path: string) {
  return new Promise<{ status: number; body: string }>((resolve) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let body = ''
      res.on('data', (c: Buffer) => {
        body += c.toString()
      })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
    })
  })
}

async function post(path: string, body: string) {
  return new Promise<{ status: number; body: string }>((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let rb = ''
        res.on('data', (c: Buffer) => {
          rb += c.toString()
        })
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: rb }))
      }
    )
    req.write(body)
    req.end()
  })
}

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const { status, body } = await get('/health')
    expect(status).toBe(200)
    expect(JSON.parse(body).status).toBe('ok')
  })
})

describe('GET /agents', () => {
  it('returns 200 with empty array initially', async () => {
    const { status, body } = await get('/agents')
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual([])
  })
})

describe('GET /stats', () => {
  it('returns sseEnabled and recentFeed array', async () => {
    const { status, body } = await get('/stats')
    expect(status).toBe(200)
    const parsed = JSON.parse(body) as { sseEnabled: boolean; recentFeed: unknown[] }
    expect(parsed.sseEnabled).toBe(true)
    expect(Array.isArray(parsed.recentFeed)).toBe(true)
  })
})

describe('POST /send', () => {
  it('returns 200 and a routed UNICOMMessage', async () => {
    const payload = JSON.stringify({ from: 'test', to: 'broadcast', content: 'hello' })
    const { status, body } = await post('/send', payload)
    expect(status).toBe(200)
    expect(JSON.parse(body).from).toBe('test')
  })

  it('records message in /stats recentFeed without content', async () => {
    const payload = JSON.stringify({ from: 'a', to: 'b', content: 'secret-body' })
    await post('/send', payload)
    const { body } = await get('/stats')
    const stats = JSON.parse(body) as {
      recentFeed: Array<{ from: string; to: string; content?: string }>
    }
    expect(stats.recentFeed[0]?.from).toBe('a')
    expect(stats.recentFeed[0]?.to).toBe('b')
    expect(stats.recentFeed[0]).not.toHaveProperty('content')
  })

  it('returns 400 for malformed JSON', async () => {
    const { status } = await post('/send', 'not-json')
    expect(status).toBe(400)
  })
})
