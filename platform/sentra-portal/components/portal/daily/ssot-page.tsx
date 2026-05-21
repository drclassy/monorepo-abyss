'use client'

import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard } from '../portal-card'
import { usePortalText } from '../portal-text'
import { StatusBadge } from '../status-badge'

import type { PortalResponse, SsotPayload } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<SsotPayload>>

export function SsotDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'ssot',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const { data } = useSWR('/api/portal/ssot', fetcher, { refreshInterval: 60000 })
  const ssot = data?.data

  const title = 'Agent SSOT'
  const subtitle = 'Operational handoff, milestones, and daily SSOT sync health.'

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

  if (!ssot) {
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

  const progressPct =
    ssot.progress.total > 0 ? Math.round((ssot.progress.done / ssot.progress.total) * 100) : 0

  return (
    <DailyPageFrame
      embedded={frameMode}
      panel={panel}
      compact={compact}
      id={id}
      title={title}
      subtitle={subtitle}
    >
      <PortalCard title="HANDOFF · Next Action">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <StatusBadge
            status={ssot.handoff.freshnessStatus}
            label={`${ssot.handoff.freshnessHours ?? '—'}h`}
          />
        </div>
        <p className={cn(t.body, 'whitespace-pre-wrap')}>
          {ssot.handoff.nextActionFull ||
            ssot.handoff.nextAction ||
            'No next action section found.'}
        </p>
        {ssot.handoff.activeWork ? (
          <p className={cn(t.bodyMuted, 'mt-3')}>
            <strong>Active:</strong> {ssot.handoff.activeWork}
          </p>
        ) : null}
        {ssot.handoff.blockers.length > 0 && (
          <ul className={cn(t.error, 'mt-4 list-disc pl-5')}>
            {ssot.handoff.blockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </PortalCard>

      <div className={cn('grid grid-cols-1 lg:grid-cols-2', t.grid)}>
        <PortalCard title="PROGRESS">
          <p className={t.kpiValue}>
            {ssot.progress.done}/{ssot.progress.total}
          </p>
          <div className={cn('mt-4 h-2 rounded-full', t.progressTrack)}>
            <div
              className={cn('h-full rounded-full', t.progressFill)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </PortalCard>

        <PortalCard title="Shape Guard">
          {ssot.shapeViolations.length === 0 ? (
            <p className={t.body}>`.agent/` root shape OK</p>
          ) : (
            <ul className={t.body}>
              {ssot.shapeViolations.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>

      {compact && ssot.ssotDaily ? (
        <PortalCard title={`SSOT Daily · ${ssot.ssotDaily.filename}`}>
          <p className={cn(t.bodyMuted, 'mb-2')}>{ssot.ssotDaily.modifiedAt}</p>
          <pre
            className={cn(t.tableCellMono, 'max-h-32 overflow-auto whitespace-pre-wrap text-xs')}
          >
            {ssot.ssotDaily.excerpt}
          </pre>
        </PortalCard>
      ) : null}

      {!compact && (
        <>
          <PortalCard title="Session Heatmap (14d)">
            <div className="flex flex-wrap gap-2">
              {ssot.sessionHeatmap.map((day) => (
                <div
                  key={day.date}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    day.count > 0 ? t.heatActive : t.heatIdle
                  )}
                  title={`${day.date}: ${day.count}`}
                >
                  {day.date.slice(5)} · {day.count}
                </div>
              ))}
            </div>
          </PortalCard>

          {ssot.ssotDaily && (
            <PortalCard title={`Latest SSOT Daily · ${ssot.ssotDaily.filename}`}>
              <p className={cn(t.bodyMuted, 'mb-3')}>{ssot.ssotDaily.modifiedAt}</p>
              <pre className={cn(t.tableCellMono, 'max-h-48 overflow-auto whitespace-pre-wrap')}>
                {ssot.ssotDaily.excerpt}
              </pre>
            </PortalCard>
          )}

          <PortalCard title="Protected Paths">
            <ul className={t.tableCellMono}>
              {ssot.protectedPaths.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </PortalCard>
        </>
      )}
    </DailyPageFrame>
  )
}
