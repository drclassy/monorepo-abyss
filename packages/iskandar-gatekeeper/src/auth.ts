import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

export interface JwtPayload {
  sub: string
  iss: string
  aud: string
  exp: number
  iat: number
  role?: string
  permissions?: string[]
}

export interface JwtHeader {
  alg: string
  typ: string
}

export interface ApiKeyConfig {
  key: string
  name: string
  permissions: string[]
  expiresAt?: Date
}

export interface ValidationError {
  code: string
  message: string
  field?: string
}

export interface AuthResult {
  valid: boolean
  payload?: JwtPayload
  apiKey?: ApiKeyConfig
  errors: ValidationError[]
}

/**
 * Verify JWT token.
 * Only HS256 is accepted — algorithm confusion attacks (alg:none, alg:RS256) are rejected.
 */
export function verifyJwt(token: string, secret: string): AuthResult {
  const errors: ValidationError[] = []

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      errors.push({ code: 'INVALID_FORMAT', message: 'JWT must have 3 parts' })
      return { valid: false, errors }
    }

    // Decode header first — enforce HS256 before touching the signature
    let header: JwtHeader
    try {
      header = JSON.parse(Buffer.from(parts[0], 'base64url').toString()) as JwtHeader
    } catch {
      errors.push({ code: 'INVALID_HEADER', message: 'JWT header is not valid JSON' })
      return { valid: false, errors }
    }

    if (header.alg !== 'HS256') {
      errors.push({
        code: 'UNSUPPORTED_ALGORITHM',
        message: `JWT algorithm '${header.alg}' is not supported; only HS256 is accepted`,
      })
      return { valid: false, errors }
    }

    // Decode payload
    let payload: JwtPayload
    try {
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as JwtPayload
    } catch {
      errors.push({ code: 'INVALID_PAYLOAD', message: 'JWT payload is not valid JSON' })
      return { valid: false, errors }
    }

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      errors.push({ code: 'TOKEN_EXPIRED', message: 'JWT has expired' })
      return { valid: false, errors }
    }

    // Timing-safe signature comparison — prevents length-leaking timing attacks
    const expectedSig = createSignature(parts[0], parts[1], secret)
    const actualBuf = Buffer.from(parts[2])
    const expectedBuf = Buffer.from(expectedSig)

    if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
      errors.push({ code: 'INVALID_SIGNATURE', message: 'JWT signature is invalid' })
      return { valid: false, errors }
    }

    return { valid: true, payload, errors: [] }
  } catch (error) {
    errors.push({
      code: 'VERIFICATION_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return { valid: false, errors }
  }
}

/**
 * Create HS256 JWT signature
 */
function createSignature(header: string, payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
}

/**
 * Validate API key against configured keys (timing-safe comparison)
 */
export function validateApiKey(key: string, validKeys: ApiKeyConfig[]): AuthResult {
  const errors: ValidationError[] = []

  if (!key || key.length < 16) {
    errors.push({ code: 'INVALID_KEY_FORMAT', message: 'API key must be at least 16 characters' })
    return { valid: false, errors }
  }

  const keyBuf = Buffer.from(key)
  const matchedKey = validKeys.find((k) => {
    const candidateBuf = Buffer.from(k.key)
    return candidateBuf.length === keyBuf.length && timingSafeEqual(candidateBuf, keyBuf)
  })

  if (!matchedKey) {
    errors.push({ code: 'KEY_NOT_FOUND', message: 'API key is not recognized' })
    return { valid: false, errors }
  }

  if (matchedKey.expiresAt && matchedKey.expiresAt < new Date()) {
    errors.push({ code: 'KEY_EXPIRED', message: 'API key has expired' })
    return { valid: false, errors }
  }

  return { valid: true, apiKey: matchedKey, errors: [] }
}

/**
 * Load API keys from environment variables.
 *
 * Supported patterns:
 *   ISKANDAR_API_KEY_<NAME>              — key value (required)
 *   ISKANDAR_API_KEY_<NAME>_PERMISSIONS  — comma-separated permissions (optional, default: read)
 *   ISKANDAR_API_KEY_<NAME>_EXPIRES      — ISO 8601 expiry date (optional)
 *   ISKANDAR_API_KEY                     — single fallback key (read + write)
 */
export function loadApiKeysFromEnv(): ApiKeyConfig[] {
  const keys: ApiKeyConfig[] = []
  const metaSuffix = /_(PERMISSIONS|EXPIRES)$/

  // Collect base key vars — exclude _PERMISSIONS and _EXPIRES from being treated as key entries
  const keyEnvVars = Object.keys(process.env).filter(
    (k) => k.startsWith('ISKANDAR_API_KEY_') && !metaSuffix.test(k),
  )

  for (const envVar of keyEnvVars) {
    const keyValue = process.env[envVar]
    if (!keyValue) continue

    const name = envVar.replace('ISKANDAR_API_KEY_', '').toLowerCase()
    const permissionsEnv = process.env[`${envVar}_PERMISSIONS`]
    const expiresEnv = process.env[`${envVar}_EXPIRES`]

    keys.push({
      key: keyValue,
      name,
      permissions: permissionsEnv ? permissionsEnv.split(',').map((p) => p.trim()) : ['read'],
      expiresAt: expiresEnv ? new Date(expiresEnv) : undefined,
    })
  }

  // Single fallback key
  if (process.env.ISKANDAR_API_KEY) {
    keys.push({
      key: process.env.ISKANDAR_API_KEY,
      name: 'default',
      permissions: ['read', 'write'],
    })
  }

  return keys
}

/**
 * Express middleware for JWT authentication
 */
export function jwtMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' })
      return
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' })
      return
    }

    const result = verifyJwt(token, secret)

    if (!result.valid) {
      res.status(401).json({ error: 'Authentication failed', details: result.errors })
      return
    }

    ;(req as any).user = result.payload
    next()
  }
}

/**
 * Express middleware for API key authentication.
 *
 * @param apiKeys          - Key list (defaults to loadApiKeysFromEnv())
 * @param requiredPermissions - If provided, the matched key must include all listed permissions
 */
export function apiKeyMiddleware(apiKeys?: ApiKeyConfig[], requiredPermissions?: string[]) {
  const keys = apiKeys ?? loadApiKeysFromEnv()

  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      res.status(401).json({ error: 'X-API-Key header missing' })
      return
    }

    const result = validateApiKey(apiKey, keys)

    if (!result.valid) {
      res.status(401).json({ error: 'Authentication failed', details: result.errors })
      return
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const keyPerms = result.apiKey!.permissions
      const missing = requiredPermissions.filter((p) => !keyPerms.includes(p))
      if (missing.length > 0) {
        res.status(403).json({ error: 'Insufficient permissions', required: requiredPermissions, missing })
        return
      }
    }

    ;(req as any).apiKey = result.apiKey
    next()
  }
}

/**
 * Combined authentication middleware (JWT or API Key).
 */
export function authMiddleware(options: {
  jwtSecret?: string
  apiKeys?: ApiKeyConfig[]
  requiredPermissions?: string[]
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization
    const apiKey = req.headers['x-api-key'] as string

    if (authHeader) {
      const [scheme, token] = authHeader.split(' ')
      if (scheme === 'Bearer' && token && options.jwtSecret) {
        const result = verifyJwt(token, options.jwtSecret)
        if (result.valid) {
          ;(req as any).user = result.payload
          next()
          return
        }
      }
    }

    if (apiKey && options.apiKeys) {
      const result = validateApiKey(apiKey, options.apiKeys)
      if (result.valid) {
        if (options.requiredPermissions && options.requiredPermissions.length > 0) {
          const keyPerms = result.apiKey!.permissions
          const missing = options.requiredPermissions.filter((p) => !keyPerms.includes(p))
          if (missing.length > 0) {
            res.status(403).json({
              error: 'Insufficient permissions',
              required: options.requiredPermissions,
              missing,
            })
            return
          }
        }
        ;(req as any).apiKey = result.apiKey
        next()
        return
      }
    }

    res.status(401).json({
      error: 'Authentication required',
      message: 'Provide either Bearer JWT token or X-API-Key',
    })
  }
}
