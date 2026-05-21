'use client'

import { RefreshCw } from 'lucide-react'
import useSWR from 'swr'

import { portal } from './portal-design'
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

function MetricCell({
  label,
  value,
  status,
  statusLabel,
}: {
  label: string
  value: string
  status: StripSummary['ssotStatus']
  statusLabel: string
}) {
  return (
    <div className={cn(portal.surface.kpi, 'min-w-0')}>
      <p className={portal.type.kpiLabel}>{label}</p>
      <p className={cn(portal.type.kpiValue, 'mt-0.5 truncate')}>{value}</p>
      <div className="mt-1.5">
        <StatusBadge status={status} label={statusLabel} />
      </div>
    </div>
  )
}

export function ExecutiveStrip({ embedded = false }: { embedded?: boolean }) {
  const { data, error, isLoading, mutate } = useSWR('/api/portal/summary', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const summary = data?.data

  return (
    <section
      className={cn(
        embedded
          ? 'border-b border-sentra-grid dark:border-sentra-slate/80'
          : portal.surface.metricBar
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-2',
          !embedded && 'border-b border-sentra-grid dark:border-sentra-slate/80'
        )}
      >
        <p className={portal.type.label}>Live · 30s</p>
        <button
          type="button"
          onClick={() => mutate()}
          className={portal.btn.ghost}
          aria-label="Refresh"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </button>
      </div>

      {error ? <p className={cn(portal.type.error, 'px-3 py-2')}>Failed to load metrics.</p> : null}

      <div
        className={cn(
          'grid divide-x divide-y divide-sentra-grid dark:divide-sentra-slate/50 sm:divide-y-0',
          'grid-cols-2 sm:grid-cols-5'
        )}
      >
        {METRICS.map((m) => (
          <div key={m.key}>
            <MetricCell
              label={m.label}
              value={summary ? m.value(summary) : '—'}
              status={summary ? m.status(summary) : 'unknown'}
              statusLabel={summary ? m.statusLabel(summary) : '—'}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
