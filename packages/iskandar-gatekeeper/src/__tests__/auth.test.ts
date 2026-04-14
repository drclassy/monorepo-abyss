import { createHmac } from 'node:crypto'
import { describe, it, expect, afterEach } from 'vitest'
import {
  verifyJwt,
  validateApiKey,
  loadApiKeysFromEnv,
  type ApiKeyConfig,
} from '../auth'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SECRET = 'test-secret-value-for-unit-tests-only'

function makeJwt(
  payload: Record<string, unknown>,
  secret: string,
  headerOverrides?: Record<string, unknown>,
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT', ...headerOverrides }),
  ).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

const VALID_PAYLOAD = {
  sub: 'user-123',
  iss: 'iskandar-gatekeeper',
  aud: 'test',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}

// ---------------------------------------------------------------------------
// verifyJwt
// ---------------------------------------------------------------------------

describe('verifyJwt', () => {
  it('accepts a valid HS256 token', () => {
    const token = makeJwt(VALID_PAYLOAD, SECRET)
    const result = verifyJwt(token, SECRET)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.payload?.sub).toBe('user-123')
  })

  it('rejects a token with wrong number of parts', () => {
    const result = verifyJwt('invalid.token', SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_FORMAT')
  })

  it('rejects an expired token', () => {
    const expired = { ...VALID_PAYLOAD, exp: Math.floor(Date.now() / 1000) - 100 }
    const token = makeJwt(expired, SECRET)
    const result = verifyJwt(token, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('TOKEN_EXPIRED')
  })

  it('rejects a token with invalid signature', () => {
    const token = makeJwt(VALID_PAYLOAD, SECRET)
    const tampered = token.slice(0, -3) + 'XYZ'
    const result = verifyJwt(tampered, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_SIGNATURE')
  })

  it('rejects algorithm confusion — alg: none', () => {
    const token = makeJwt(VALID_PAYLOAD, SECRET, { alg: 'none' })
    const result = verifyJwt(token, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('UNSUPPORTED_ALGORITHM')
  })

  it('rejects algorithm confusion — alg: RS256', () => {
    const token = makeJwt(VALID_PAYLOAD, SECRET, { alg: 'RS256' })
    const result = verifyJwt(token, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('UNSUPPORTED_ALGORITHM')
  })

  it('rejects a token signed with a different secret', () => {
    const token = makeJwt(VALID_PAYLOAD, 'wrong-secret')
    const result = verifyJwt(token, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_SIGNATURE')
  })

  it('rejects malformed header JSON', () => {
    const badHeader = Buffer.from('not-json').toString('base64url')
    const body = Buffer.from(JSON.stringify(VALID_PAYLOAD)).toString('base64url')
    const sig = createHmac('sha256', SECRET).update(`${badHeader}.${body}`).digest('base64url')
    const result = verifyJwt(`${badHeader}.${body}.${sig}`, SECRET)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_HEADER')
  })
})

// ---------------------------------------------------------------------------
// validateApiKey
// ---------------------------------------------------------------------------

describe('validateApiKey', () => {
  const KEYS: ApiKeyConfig[] = [
    { key: 'valid-api-key-abcdefghijkl', name: 'test', permissions: ['read', 'write'] },
    {
      key: 'expired-key-abcdefghijklmn',
      name: 'expired',
      permissions: ['read'],
      expiresAt: new Date(Date.now() - 1000),
    },
  ]

  it('accepts a valid API key', () => {
    const result = validateApiKey('valid-api-key-abcdefghijkl', KEYS)
    expect(result.valid).toBe(true)
    expect(result.apiKey?.name).toBe('test')
    expect(result.apiKey?.permissions).toContain('write')
  })

  it('rejects a key shorter than 16 characters', () => {
    const result = validateApiKey('tooshort', KEYS)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_KEY_FORMAT')
  })

  it('rejects an unrecognized key', () => {
    const result = validateApiKey('unknown-api-key-not-in-list', KEYS)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('KEY_NOT_FOUND')
  })

  it('rejects an expired key', () => {
    const result = validateApiKey('expired-key-abcdefghijklmn', KEYS)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('KEY_EXPIRED')
  })

  it('rejects an empty key', () => {
    const result = validateApiKey('', KEYS)
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('INVALID_KEY_FORMAT')
  })
})

// ---------------------------------------------------------------------------
// loadApiKeysFromEnv
// ---------------------------------------------------------------------------

describe('loadApiKeysFromEnv', () => {
  afterEach(() => {
    delete process.env.ISKANDAR_API_KEY_SVCTEST
    delete process.env.ISKANDAR_API_KEY_SVCTEST_PERMISSIONS
    delete process.env.ISKANDAR_API_KEY_SVCTEST_EXPIRES
    delete process.env.ISKANDAR_API_KEY
  })

  it('parses ISKANDAR_API_KEY_<NAME> with permissions and expiry', () => {
    process.env.ISKANDAR_API_KEY_SVCTEST = 'svctest-key-value-1234'
    process.env.ISKANDAR_API_KEY_SVCTEST_PERMISSIONS = 'read,write,admin'

    const keys = loadApiKeysFromEnv()
    const entry = keys.find((k) => k.name === 'svctest')
    expect(entry).toBeDefined()
    expect(entry?.permissions).toEqual(['read', 'write', 'admin'])
  })

  it('does not treat _PERMISSIONS env vars as key entries', () => {
    process.env.ISKANDAR_API_KEY_SVCTEST = 'svctest-key-value-1234'
    process.env.ISKANDAR_API_KEY_SVCTEST_PERMISSIONS = 'read'

    const keys = loadApiKeysFromEnv()
    const names = keys.map((k) => k.name)
    expect(names).not.toContain('svctest_permissions')
  })

  it('does not treat _EXPIRES env vars as key entries', () => {
    process.env.ISKANDAR_API_KEY_SVCTEST = 'svctest-key-value-1234'
    process.env.ISKANDAR_API_KEY_SVCTEST_EXPIRES = new Date(Date.now() + 86400000).toISOString()

    const keys = loadApiKeysFromEnv()
    const names = keys.map((k) => k.name)
    expect(names).not.toContain('svctest_expires')
  })

  it('falls back to read-only for keys without _PERMISSIONS', () => {
    process.env.ISKANDAR_API_KEY_SVCTEST = 'svctest-key-value-1234'

    const keys = loadApiKeysFromEnv()
    const entry = keys.find((k) => k.name === 'svctest')
    expect(entry?.permissions).toEqual(['read'])
  })

  it('includes fallback ISKANDAR_API_KEY with read+write', () => {
    process.env.ISKANDAR_API_KEY = 'fallback-key-value-1234'

    const keys = loadApiKeysFromEnv()
    const entry = keys.find((k) => k.name === 'default')
    expect(entry).toBeDefined()
    expect(entry?.permissions).toContain('write')
  })
})
