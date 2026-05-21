'use client'

import Link from 'next/link'
import useSWR from 'swr'

import { OpsDailyPage } from './daily/ops-page'
import { portal } from './portal-design'

import type { PortalResponse, StripSummary } from '@/lib/portal/types'

export function LiveOpsPage() {
  const { data: summary } = useSWR('/api/portal/summary', (url) =>
    fetch(url).then((r) => r.json())
  ) as { data?: PortalResponse<StripSummary> }

  return (
    <div className={portal.stack}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className={portal.type.pageTitle}>Live Ops</h1>
          <p className={portal.type.pageSubtitle}>
            UNICOM: {summary?.data?.unicomAgents ?? '—'} agents · RISK:{' '}
            {summary?.data?.dirtyRisk ?? '—'} · strip above refreshes every 30s
          </p>
        </div>
        <Link href="/dashboard" className={portal.type.navLink}>
          ← Mission Control
        </Link>
      </header>
      <OpsDailyPage embedded />
    </div>
  )
}
