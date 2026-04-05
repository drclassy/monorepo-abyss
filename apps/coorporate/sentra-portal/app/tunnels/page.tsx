/**
 * PORTAL Sentra — Tunnel Management Page
 * Expose local services to public URLs via localtunnel
 */

export const dynamic = 'force-dynamic'

import { Globe, Loader2 } from 'lucide-react'
import type React from 'react'
import { Suspense } from 'react'
import TunnelsPageClient from './client'

function Loading(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] bg-surface-page">
      <Loader2 className="h-8 w-8 animate-spin text-sentra-text-muted" />
    </div>
  )
}

export default function TunnelsPage(): React.JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <TunnelsPageClient />
    </Suspense>
  )
}
