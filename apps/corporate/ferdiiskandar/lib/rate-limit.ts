// Architected and built by dr Classy

import { type NextRequest } from 'next/server'

type RateLimitBucket = {
  count: number
  resetAt: number
}

export function getClientKey(request: NextRequest | { headers: Headers }): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function createFixedWindowRateLimiter({
  maxRequests,
  windowMs,
}: {
  maxRequests: number
  windowMs: number
}) {
  const buckets = new Map<string, RateLimitBucket>()

  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key)
    }
  }, windowMs)

  return {
    isRateLimited(clientKey: string): boolean {
      const now = Date.now()
      const existing = buckets.get(clientKey)
      if (!existing || now > existing.resetAt) {
        buckets.set(clientKey, { count: 1, resetAt: now + windowMs })
        return false
      }
      if (existing.count >= maxRequests) return true
      existing.count += 1
      return false
    },
  }
}

/**
 * Temporary local-safe fallback while Upstash is not an accepted dependency.
 * This preserves route-level protection for local verification, but production
 * distributed rate limiting must be decided explicitly before deployment.
 */
export function createHybridRateLimiter(options: {
  maxRequests: number
  windowMs: number
  /** Distinct Redis key prefix per route (e.g. abby, chat, abby-lead). */
  prefix: string
}) {
  const memory = createFixedWindowRateLimiter({
    maxRequests: options.maxRequests,
    windowMs: options.windowMs,
  })

  return {
    async isRateLimited(clientKey: string): Promise<boolean> {
      return memory.isRateLimited(clientKey)
    },
  }
}
