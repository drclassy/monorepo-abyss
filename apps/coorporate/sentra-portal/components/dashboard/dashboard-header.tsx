/**
 * PORTAL Sentra — Dashboard Header with Refresh
 * Architected and built by Claudesy.
 */

'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DashboardHeader(): React.ReactElement {
  const router = useRouter()

  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-muted-foreground mt-1">
          Centralized monitoring and management for all Sentra projects
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 border-sentra-border-strong text-sentra-text-primary hover:bg-surface-hover hover:text-sentra-text-primary"
        onClick={() => router.refresh()}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </header>
  )
}
