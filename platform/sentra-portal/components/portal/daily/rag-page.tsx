'use client'

import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard } from '../portal-card'
import { usePortalText } from '../portal-text'
import { StatusBadge } from '../status-badge'

import type { PortalResponse, RagPayload } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<RagPayload>>

function readinessStatus(readiness: string): 'ok' | 'warn' | 'critical' | 'unknown' {
  if (readiness === 'ready') return 'ok'
  if (readiness === 'partial') return 'warn'
  if (readiness === 'not_ready') return 'critical'
  return 'unknown'
}

export function RagDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'rag',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const { data } = useSWR('/api/portal/rag', fetcher, { refreshInterval: 120000 })
  const rag = data?.data
  const title = 'Knowledge'
  const subtitle = 'Registry, retrieval eval runs, and AADI readiness.'

  if (!data?.ok && data?.error) {
    return (
      <DailyPageFrame
        embedded={frameMode}
        panel={panel}
        compact={compact}
        id={id}
        title={title}
        subtitle={subtitle}
      >
        <p className={t.error}>{data.error}</p>
      </DailyPageFrame>
    )
  }

  if (!rag) {
    return (
      <DailyPageFrame
        embedded={frameMode}
        panel={panel}
        compact={compact}
        id={id}
        title={title}
        subtitle={subtitle}
      >
        <p className={t.bodyMuted}>Loading…</p>
      </DailyPageFrame>
    )
  }

  const evalStatus = rag.latestEval?.aadiReadiness ?? 'no_eval'

  return (
    <DailyPageFrame
      embedded={frameMode}
      panel={panel}
      compact={compact}
      id={id}
      title={title}
      subtitle={subtitle}
    >
      <div className={cn('grid grid-cols-1 md:grid-cols-3', t.grid)}>
        <PortalCard title="Registry">
          <p className={t.kpiValue}>{rag.registryTotal}</p>
          <p className={t.bodyMuted}>
            Approved {rag.registryApproved} · Pending {rag.registryPending}
          </p>
        </PortalCard>

        <PortalCard title="AADI Readiness">
          <StatusBadge status={readinessStatus(evalStatus)} label={evalStatus} />
          {rag.quality && <p className={cn(t.bodyMuted, 'mt-2')}>{rag.quality.readinessReason}</p>}
        </PortalCard>

        <PortalCard title="Latest Eval">
          {rag.latestEval ? (
            <>
              <p className={t.tableCellMono}>{rag.latestEval.runId}</p>
              <p className={t.body}>
                Pass {rag.latestEval.passedQueries}/{rag.latestEval.totalQueries} ·{' '}
                {rag.latestEval.writeMode}
              </p>
              <p className={t.bodyMuted}>{rag.latestEval.completedAt}</p>
            </>
          ) : (
            <p className={t.bodyMuted}>No eval run under {rag.evalRunsDir}</p>
          )}
        </PortalCard>
      </div>

      {rag.quality && (
        <PortalCard title="Evidence Quality">
          <div className={cn('grid grid-cols-2 md:grid-cols-4', t.gridDense)}>
            <div>
              <p className={t.label}>Approval rate</p>
              <p className={t.statValue}>{(rag.quality.approvalRate * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className={t.label}>Traceability</p>
              <p className={t.statValue}>
                {(rag.quality.traceabilityCompleteness * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </PortalCard>
      )}

      {!compact && (
        <>
          <PortalCard title="Enhancement Roadmap">
            <ul className={cn(t.body, 'list-disc space-y-2 pl-5')}>
              {rag.phaseNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </PortalCard>
        </>
      )}
    </DailyPageFrame>
  )
}
