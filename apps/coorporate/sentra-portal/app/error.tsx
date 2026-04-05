'use client'

/**
 * PORTAL Sentra — Error Boundary
 * Dark-themed error UI so broken pages don't show white.
 * Architected and built by Claudesy.
 */

import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Sentra Portal] Error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-surface-page p-8 text-sentra-text-body">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
      <p className="mb-6 max-w-md text-center text-sm text-sentra-text-secondary">
        {error.message}
      </p>
      <Button
        onClick={reset}
        className="bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary"
      >
        Try again
      </Button>
    </div>
  )
}
