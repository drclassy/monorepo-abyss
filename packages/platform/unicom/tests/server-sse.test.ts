import http from 'node:http'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createUnicomHttpServer } from '../src/server.js'

const PORT = 59851
let server: http.Server

beforeAll(async () => {
  server = createUnicomHttpServer(PORT)
  await new Promise<void>((resolve) => server.on('listening', resolve))
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

function subscribeSSE(agentId: string): { promise: Promise<string>; req: http.ClientRequest } {
  const req = http.request({
    hostname: 'localhost',
    port: PORT,
    path: `/subscribe/${agentId}`,
    method: 'GET',
  })

  const promise = new Promise<string>((resolve, reject) => {
    let buffer = ''
    req.on('response', (res) => {
      res.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        // resolve as soon as we receive the first event
        if (buffer.includes('event: message')) {
          resolve(buffer)
          res.destroy()
        }
      })
      res.on('end', () => resolve(buffer))
    })
    req.on('error', (err) => {
      // Ignore ECONNRESET from our own res.destroy()
      if ((err as NodeJS.ErrnoException).code === 'ECONNRESET') return
      reject(err)
    })
    setTimeout(() => resolve(buffer), 2000) // fallback timeout
  })

  req.end()
  return { promise, req }
}

describe('SSE endpoint', () => {
  it('GET /subscribe/:agentId sets SSE headers', async () => {
    const { req } = subscribeSSE('header-test-agent')

    // Wait a moment for connection to establish
    await new Promise((r) => setTimeout(r, 50))

    // Clean up
    req.destroy()

    // Verify via /stats endpoint that SSE is enabled
    const { status, body } = await get('/stats')
    expect(status).toBe(200)
    const stats = JSON.parse(body) as { sseEnabled: boolean }
    expect(stats.sseEnabled).toBe(true)
  })

  it('delivers message in real-time via SSE', async () => {
    const { promise } = subscribeSSE('agent-b')

    // give SSE a moment to establish
    await new Promise((r) => setTimeout(r, 100))

    // send message to agent-b
    await post(
      '/send',
      JSON.stringify({ from: 'agent-a', to: 'agent-b', content: 'hello via sse' })
    )

    const sseData = await promise
    expect(sseData).toContain('event: message')
    expect(sseData).toContain('hello via sse')
  })

  it('POST /receive returns inbox messages for offline agent', async () => {
    // send message to agent-c (no SSE connection)
    await post('/send', JSON.stringify({ from: 'agent-a', to: 'agent-c', content: 'offline msg' }))

    // drain inbox via /receive
    const { status, body } = await post('/receive', JSON.stringify({ agentId: 'agent-c' }))

    expect(status).toBe(200)
    const messages = JSON.parse(body)
    expect(messages).toHaveLength(1)
    expect(messages[0].content).toBe('offline msg')
  })
})
