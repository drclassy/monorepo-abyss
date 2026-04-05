/**
 * PORTAL Sentra — Environment Vault Page
 * Secure management of environment variables
 */

export const dynamic = 'force-dynamic'

import { Loader2, Shield } from 'lucide-react'
import type React from 'react'
import { Suspense } from 'react'
import VaultPageClient from './client'

function Loading(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] bg-surface-page">
      <Loader2 className="h-8 w-8 animate-spin text-sentra-text-muted" />
    </div>
  )
}

export default function VaultPage(): React.JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <VaultPageClient />
    </Suspense>
  )
}
