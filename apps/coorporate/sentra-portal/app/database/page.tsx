/**
 * PORTAL Sentra — Database Management Page
 * SQL Editor and Database Browser combined
 */

export const dynamic = 'force-dynamic'

import { Loader2 } from 'lucide-react'
import type React from 'react'
import { Suspense } from 'react'
import DatabasePageClient from './client'

function Loading(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] bg-surface-page">
      <Loader2 className="h-8 w-8 animate-spin text-sentra-text-muted" />
    </div>
  )
}

export default function DatabasePage(): React.JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <DatabasePageClient />
    </Suspense>
  )
}
