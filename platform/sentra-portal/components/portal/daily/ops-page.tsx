'use client'

import { useState } from 'react'
import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard, PortalStat, PortalStatGrid } from '../portal-card'
import {
  PortalTable,
  PortalTableBody,
  PortalTableHead,
  PortalTd,
  PortalTh,
  PortalTr,
} from '../portal-table'
import { usePortalText } from '../portal-text'
import { StatusBadge } from '../status-badge'

import type { OpsPayload, PortalResponse, VerifyStatusFile } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<OpsPayload>>

const QUADRANT_COLORS = {
  KEEP: 'bg-[#166534]',
  REVIEW: 'bg-[#5b21b6]',
  HOLD: 'bg-[#a16207]',
  RISK: 'bg-[#b91c1c]',
} as const

export function OpsDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'ops',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const title = 'Abyss CLI Ops'
  const subtitle = 'Repository branch, dirty-tree classification, and portal verify gate.'
  const { data } = useSWR('/api/portal/ops', fetcher, { refreshInterval: 60000 })
  const { data: verifyData, mutate: mutateVerify } = useSWR(
    '/api/portal/verify',
    (url) => fetch(url).then((r) => r.json()) as Promise<PortalResponse<VerifyStatusFile | null>>
  )
  const [runningVerify, setRunningVerify] = useState(false)
  const ops = data?.data

  async function runPortalVerify() {
    setRunningVerify(true)
    try {
      await fetch('/api/portal/verify', { method: 'POST' })
      await mutateVerify()
    } finally {
      setRunningVerify(false)
    }
  }

  const maxQuadrant = ops ? Math.max(...Object.values(ops.dirtyQuadrants), 1) : 1

  const inner =
    !data?.ok && data?.error ? (
      <p className={t.error}>{data.error}</p>
    ) : !ops ? (
      <p className={t.bodyMuted}>Loading…</p>
    ) : (
      <>
        <PortalStatGrid>
          <PortalStat label="Branch" value={ops.branch} />
          <PortalStat label="HEAD" value={ops.headShort} />
          <PortalStat label="Apps" value={String(ops.appsCount)} />
          <PortalStat label="Sessions" value={String(ops.sessionLogs)} />
        </PortalStatGrid>

        <PortalCard title={`Dirty Tree · ${ops.dirtyTotal} files`}>
          <div className={cn('grid grid-cols-2 md:grid-cols-4', t.gridDense)}>
            {(Object.keys(QUADRANT_COLORS) as Array<keyof typeof QUADRANT_COLORS>).map((key) => {
              const count = ops.dirtyQuadrants[key]
              const height = Math.max(8, Math.round((count / maxQuadrant) * 80))
              return (
                <div key={key} className="flex flex-col items-center gap-2">
                  <div
                    className={cn('w-full rounded-t', QUADRANT_COLORS[key])}
                    style={{ height: `${height}px` }}
                  />
                  <span className={t.cardTitle}>{key}</span>
                  <span className={t.bodyMuted}>{count}</span>
                </div>
              )
            })}
          </div>
        </PortalCard>

        <PortalCard title={`RISK Files (top ${compact ? 5 : 25})`}>
          {ops.riskFiles.length === 0 ? (
            <p className={t.body}>No RISK-classified dirty files.</p>
          ) : (
            <PortalTable>
              <PortalTableHead>
                <PortalTh>Status</PortalTh>
                <PortalTh>File</PortalTh>
              </PortalTableHead>
              <PortalTableBody>
                {ops.riskFiles.slice(0, compact ? 5 : 25).map((item) => (
                  <PortalTr key={item.file}>
                    <PortalTd mono>{item.status}</PortalTd>
                    <PortalTd mono accent>
                      {item.file}
                    </PortalTd>
                  </PortalTr>
                ))}
              </PortalTableBody>
            </PortalTable>
          )}
        </PortalCard>

        {!compact && (
          <>
            <PortalCard title="Portal Verify Gate">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <StatusBadge
                  status={verifyData?.data?.overall ?? 'unknown'}
                  label={verifyData?.data?.overall ?? 'not run'}
                />
                {verifyData?.data?.at && (
                  <span className={t.bodyMuted}>Last: {verifyData.data.at}</span>
                )}
                <button
                  type="button"
                  disabled={runningVerify}
                  onClick={runPortalVerify}
                  className={t.btnGhost}
                >
                  {runningVerify ? 'Running…' : 'Run portal verify'}
                </button>
              </div>
              {verifyData?.data && (
                <p className={t.bodyMuted}>
                  typecheck {verifyData.data.typecheck} · test {verifyData.data.test}
                </p>
              )}
            </PortalCard>

            <PortalCard title="Doctor">
              <ul className={t.body}>
                {ops.doctorNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </PortalCard>
          </>
        )}
      </>
    )

  return (
    <DailyPageFrame
      embedded={frameMode}
      panel={panel}
      compact={compact}
      id={id}
      title={title}
      subtitle={subtitle}
    >
      {inner}
    </DailyPageFrame>
  )
}
