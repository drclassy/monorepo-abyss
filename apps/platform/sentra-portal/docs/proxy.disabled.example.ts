/**
 * Example Next.js proxy (disabled by default).
 * Rename to `proxy.ts` under `src/` and adjust Next.js config to enable.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
