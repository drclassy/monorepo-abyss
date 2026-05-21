'use client'

import { RefreshCw } from 'lucide-react'
import useSWR from 'swr'

import { lettaUi } from './portal-letta-ui'
import { StatusBadge } from './status-badge'

import type { PortalResponse, StripSummary } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = async (url: string): Promise<PortalResponse<StripSummary>> => {
  const res = await fetch(url)
  return res.json() as Promise<PortalResponse<StripSummary>>
}

const METRICS: Array<{
  key: string
  label: string
  value: (s: StripSummary) => string
  status: (s: StripSummary) => StripSummary['ssotStatus']
  statusLabel: (s: StripSummary) => string
}> = [
  {
    key: 'ssot',
    label: 'SSOT',
    value: (s) => (s.ssotFreshnessHours != null ? `${s.ssotFreshnessHours}h` : '—'),
    status: (s) => s.ssotStatus,
    statusLabel: (s) => s.ssotStatus,
  },
  {
    key: 'unicom',
    label: 'UNICOM',
    value: (s) => String(s.unicomAgents ?? '—'),
    status: (s) => s.unicomStatus,
    statusLabel: (s) => s.unicomStatus,
  },
  {
    key: 'risk',
    label: 'Dirty risk',
    value: (s) => String(s.dirtyRisk ?? '—'),
    status: (s) => ((s.dirtyRisk ?? 0) > 0 ? 'critical' : 'ok'),
    statusLabel: (s) => ((s.dirtyRisk ?? 0) > 0 ? 'risk' : 'clear'),
  },
  {
    key: 'rag',
    label: 'RAG',
    value: (s) => s.ragReadiness ?? '—',
    status: (s) =>
      s.ragReadiness === 'ready' ? 'ok' : s.ragReadiness === 'not_ready' ? 'critical' : 'unknown',
    statusLabel: (s) => s.ragReadiness ?? 'unknown',
  },
  {
    key: 'verify',
    label: 'Verify',
    value: (s) => s.verifyStatus ?? '—',
    status: (s) => s.verifyStatus,
    statusLabel: (s) => s.verifyStatus,
  },
]

export function PortalDashboardStrip({ onRefresh }: { onRefresh?: () => void }) {
  const { data, error, isLoading, mutate } = useSWR('/api/portal/summary', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const summary = data?.data

  function refresh() {
    void mutate()
    onRefresh?.()
  }

  return (
    <section className={cn(lettaUi.card, 'overflow-hidden')}>
      <div
        className={cn('flex items-center justify-between border-b', lettaUi.border, 'px-5 py-3')}
      >
        <p className={lettaUi.caption}>Live · 30s</p>
        <button
          type="button"
          onClick={refresh}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-zinc-800 px-2 py-1',
            lettaUi.caption
          )}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>
      {error ? (
        <p className={cn(lettaUi.body, 'px-5 py-2 text-red-400/90')}>Failed to load metrics.</p>
      ) : null}
      <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800 sm:grid-cols-5 sm:divide-y-0">
        {METRICS.map((m) => (
          <div key={m.key} className="px-4 py-3">
            <p className={lettaUi.caption}>{m.label}</p>
            <p className={cn(lettaUi.bodyStrong, 'mt-1 tabular-nums')}>
              {summary ? m.value(summary) : '—'}
            </p>
            <div className="mt-2">
              {summary ? (
                <StatusBadge status={m.status(summary)} label={m.statusLabel(summary)} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
