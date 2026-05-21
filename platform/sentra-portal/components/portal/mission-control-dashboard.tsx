'use client'

import { RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import useSWR from 'swr'

import { ContextDailyPage } from './daily/context-page'
import { OpsDailyPage } from './daily/ops-page'
import { PromptDailyPage } from './daily/prompt-page'
import { RagDailyPage } from './daily/rag-page'
import { SsotDailyPage } from './daily/ssot-page'
import { UnicomDailyPage } from './daily/unicom-page'
import { news, NEWS_DESK } from './newspaper/newspaper-design'

import type {
  ContextPayload,
  OpsPayload,
  PortalResponse,
  PromptPayload,
  RagPayload,
  SsotPayload,
  StripSummary,
  UnicomPayload,
} from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PanelId = 'ssot' | 'ops' | 'rag' | 'unicom' | 'context' | 'prompt'

const fetcher = <T,>(url: string) => fetch(url).then((r) => r.json()) as Promise<PortalResponse<T>>

function formatFetchedAt(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function ClassifiedCell({ label, value, risk }: { label: string; value: string; risk?: boolean }) {
  return (
    <div className={news.classifiedCell}>
      <p className={news.classifiedLabel}>{label}</p>
      <p
        className={cn(news.classifiedValue, risk && news.classifiedValueRisk)}
        style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}
      >
        {value}
      </p>
    </div>
  )
}

function TribuneRow({
  label,
  value,
  risk,
  onClick,
}: {
  label: string
  value: string
  risk?: boolean
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className={news.itemLabel}>{label}</span>
      <strong className={risk ? news.itemValueRisk : news.itemValue}>{value}</strong>
    </>
  )

  if (!onClick) {
    return <div className={cn(news.item, 'px-0')}>{inner}</div>
  }

  return (
    <button type="button" onClick={onClick} className={news.item}>
      {inner}
    </button>
  )
}

function TribuneColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2
        className={news.columnTitle}
        style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function deskPreview(
  id: PanelId,
  summary: StripSummary | undefined,
  desks: {
    ssot?: SsotPayload
    ops?: OpsPayload
    rag?: RagPayload
    unicom?: UnicomPayload
    context?: ContextPayload
    prompt?: PromptPayload
  }
): string {
  if (id === 'ssot' && desks.ssot) {
    return (
      desks.ssot.handoff.nextActionFull.slice(0, 120) ||
      desks.ssot.handoff.activeWork ||
      'No HANDOFF action'
    )
  }
  if (id === 'ops' && desks.ops) {
    return `${desks.ops.dirtyTotal} dirty files · ${desks.ops.riskFiles.length} RISK · verify ${desks.ops.branch}`
  }
  if (id === 'rag' && desks.rag) {
    const e = desks.rag.latestEval
    return `${desks.rag.registryApproved}/${desks.rag.registryTotal} approved · ${e?.aadiReadiness ?? 'no eval'}`
  }
  if (id === 'unicom' && desks.unicom) {
    return `${desks.unicom.health.status} · ${desks.unicom.agents.length} agents · ${desks.unicom.deliveryMode}`
  }
  if (id === 'context' && desks.context) {
    return `${desks.context.specId} · ${desks.context.freshnessHours ?? '—'}h · ${desks.context.handbookPath}`
  }
  if (id === 'prompt' && desks.prompt) {
    const s = desks.prompt.auditStats
    return `v${desks.prompt.extensionVersion} · ${s.ready}/${s.total} ready · ${s.unsafe} unsafe`
  }
  if (summary) {
    if (id === 'ssot') return summary.nextAction
    if (id === 'ops') return `${summary.dirtyTotal} files · ${summary.dirtyRisk} risk`
    if (id === 'rag')
      return `${summary.ragApproved}/${summary.ragTotal} · ${summary.ragReadiness.replace(/_/g, ' ')}`
    if (id === 'unicom') return `${summary.unicomStatus} · ${summary.unicomAgents} agents`
    if (id === 'context')
      return summary.contextFreshnessHours != null
        ? `${summary.contextFreshnessHours}h fresh`
        : 'Handbook local'
    if (id === 'prompt') return `${summary.promptReady}/${summary.promptTotal} ready`
  }
  return 'Loading…'
}

function DeskDetails({
  id,
  title,
  section,
  preview,
  children,
}: {
  id: PanelId
  title: string
  desk: string
  section: string
  preview: string
  children: ReactNode
}) {
  return (
    <details id={id} className={news.details}>
      <summary className={news.detailsSummary}>
        <span className="min-w-0 flex-1">
          <span className="block">{title}</span>
          <span className="mt-0.5 block truncate text-[12px] font-normal text-[#555555]">
            {preview}
          </span>
        </span>
        <span className="shrink-0 text-[11px] font-sans font-normal uppercase tracking-wide text-[#777777]">
          {section}
        </span>
      </summary>
      <div className={news.detailsBody}>{children}</div>
    </details>
  )
}

function scrollToDesk(id: PanelId) {
  const el = document.getElementById(id)
  if (!el) return
  if (el instanceof HTMLDetailsElement) el.open = true
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function TribuneBoard({
  summary,
  isLoading,
}: {
  summary: StripSummary | undefined
  isLoading: boolean
}) {
  const dash = '—'
  const progressPct =
    summary && summary.progressTotal > 0
      ? Math.round((summary.progressDone / summary.progressTotal) * 100)
      : null

  return (
    <>
      <div className="mt-6 space-y-px">
        <div className={news.classifiedRow}>
          <ClassifiedCell label="Verify" value={summary?.verifyStatus ?? dash} />
          <ClassifiedCell label="Build" value={summary?.verifyBuild ?? dash} />
          <ClassifiedCell label="Typecheck" value={summary?.verifyTypecheck ?? dash} />
          <ClassifiedCell label="Test" value={summary?.verifyTest ?? dash} />
        </div>
        <div className={news.classifiedRow}>
          <ClassifiedCell label="Keep" value={summary ? String(summary.dirtyKeep) : dash} />
          <ClassifiedCell label="Review" value={summary ? String(summary.dirtyReview) : dash} />
          <ClassifiedCell label="Hold" value={summary ? String(summary.dirtyHold) : dash} />
          <ClassifiedCell
            label="Risk"
            value={summary ? String(summary.dirtyRisk) : dash}
            risk={(summary?.dirtyRisk ?? 0) > 0}
          />
        </div>
        <div className={news.classifiedRow}>
          <ClassifiedCell
            label="Eval pass"
            value={summary?.evalPassPct != null ? `${summary.evalPassPct}%` : dash}
          />
          <ClassifiedCell
            label="Registry"
            value={summary ? `${summary.ragApproved}/${summary.ragTotal}` : dash}
          />
          <ClassifiedCell
            label="RAG pending"
            value={summary ? String(summary.ragPending) : dash}
            risk={(summary?.ragPending ?? 0) > 0}
          />
          <ClassifiedCell
            label="SSE live"
            value={summary ? String(summary.unicomSseConnected) : dash}
          />
        </div>
      </div>

      <div className={news.columns}>
        <TribuneColumn title="Continuity">
          <TribuneRow
            label="Agent SSOT"
            value={
              summary?.ssotFreshnessHours != null
                ? `${summary.ssotFreshnessHours}h fresh`
                : isLoading
                  ? '…'
                  : dash
            }
            onClick={() => scrollToDesk('ssot')}
          />
          <TribuneRow
            label="Context"
            value={
              summary?.contextFreshnessHours != null
                ? `${summary.contextFreshnessHours}h`
                : isLoading
                  ? '…'
                  : 'Local'
            }
            onClick={() => scrollToDesk('context')}
          />
          <TribuneRow
            label="Prompt"
            value={
              summary
                ? `${summary.promptReady}/${summary.promptTotal || 0} ready`
                : isLoading
                  ? '…'
                  : dash
            }
            risk={(summary?.promptUnsafe ?? 0) > 0}
            onClick={() => scrollToDesk('prompt')}
          />
          <TribuneRow
            label="Progress"
            value={
              summary
                ? `${summary.progressDone}/${summary.progressTotal}${progressPct != null ? ` · ${progressPct}%` : ''}`
                : isLoading
                  ? '…'
                  : dash
            }
            onClick={() => scrollToDesk('ssot')}
          />
        </TribuneColumn>

        <TribuneColumn title="Operations">
          <TribuneRow
            label="Abyss CLI"
            value={
              summary
                ? `${summary.dirtyRisk} risk · ${summary.dirtyTotal} dirty`
                : isLoading
                  ? '…'
                  : dash
            }
            risk={(summary?.dirtyRisk ?? 0) > 0}
            onClick={() => scrollToDesk('ops')}
          />
          <TribuneRow
            label="Knowledge"
            value={summary?.ragReadiness.replace(/_/g, ' ') ?? (isLoading ? '…' : dash)}
            risk={summary?.ragReadiness !== 'ready' && summary?.ragReadiness !== 'no_eval'}
            onClick={() => scrollToDesk('rag')}
          />
          <TribuneRow
            label="UNICOM"
            value={
              summary
                ? summary.unicomStatus === 'ok'
                  ? `${summary.unicomAgents} agents`
                  : `${summary.unicomStatus} · ${summary.unicomAgents}`
                : isLoading
                  ? '…'
                  : dash
            }
            risk={summary?.unicomStatus !== 'ok'}
            onClick={() => scrollToDesk('unicom')}
          />
          <TribuneRow
            label="Latest rule"
            value={
              summary?.latestDecision ? summary.latestDecision.slice(0, 48) : isLoading ? '…' : dash
            }
            onClick={() => scrollToDesk('ssot')}
          />
        </TribuneColumn>
      </div>
    </>
  )
}

export default function MissionControlDashboard() {
  const { data, isLoading, mutate } = useSWR('/api/portal/summary', fetcher<StripSummary>, {
    refreshInterval: 30000,
  })

  const { data: ssotRes } = useSWR('/api/portal/ssot', fetcher<SsotPayload>, {
    refreshInterval: 60000,
  })
  const { data: opsRes } = useSWR('/api/portal/ops', fetcher<OpsPayload>, {
    refreshInterval: 60000,
  })
  const { data: ragRes } = useSWR('/api/portal/rag', fetcher<RagPayload>, {
    refreshInterval: 120000,
  })
  const { data: unicomRes } = useSWR('/api/portal/unicom', fetcher<UnicomPayload>, {
    refreshInterval: 30000,
  })
  const { data: contextRes } = useSWR('/api/portal/context', fetcher<ContextPayload>, {
    refreshInterval: 120000,
  })
  const { data: promptRes } = useSWR('/api/portal/prompt', fetcher<PromptPayload>, {
    refreshInterval: 120000,
  })

  const summary = data?.data
  const verifyBootstrapped = useRef(false)

  useEffect(() => {
    if (verifyBootstrapped.current || !summary || summary.verifyStatus !== 'unknown') return
    verifyBootstrapped.current = true
    fetch('/api/portal/verify', { method: 'POST' })
      .then(() => mutate())
      .catch(() => {
        verifyBootstrapped.current = false
      })
  }, [summary, mutate])

  const deskPayloads = {
    ssot: ssotRes?.data,
    ops: opsRes?.data,
    rag: ragRes?.data,
    unicom: unicomRes?.data,
    context: contextRes?.data,
    prompt: promptRes?.data,
  }

  const apiError = data && !data.ok ? data.error : null
  const editionDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={cn(news.page, 'h-screen overflow-auto')}>
      <div className={news.shell}>
        <h1
          className={news.mast}
          style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}
        >
          The PORTAL Tribune
        </h1>

        <div className={news.mastBar}>
          <p className={news.edition}>
            Mission control · {editionDate}
            {summary ? ` · ${summary.branch} @ ${summary.headShort}` : ''}
            {data?.fetchedAt ? ` · updated ${formatFetchedAt(data.fetchedAt)}` : ''}
          </p>
          <button type="button" onClick={() => mutate()} className={news.refreshBtn}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {apiError ? <p className={news.alert}>{apiError}</p> : null}

        {summary?.activeWork ? (
          <div className={news.activeWork}>
            <p className={news.activeWorkLabel}>Active work · HANDOFF</p>
            <p className={news.activeWorkBody}>{summary.activeWork}</p>
            {summary.snapshotNext ? (
              <p className={cn(news.bodyMuted, 'mt-2 text-xs')}>
                Snapshot next: {summary.snapshotNext}
              </p>
            ) : null}
          </div>
        ) : null}

        {summary && summary.topRiskFiles.length > 0 ? (
          <p className={news.riskTicker}>RISK files: {summary.topRiskFiles.join(' · ')}</p>
        ) : null}

        <TribuneBoard summary={summary} isLoading={isLoading} />

        <p className={news.lead}>
          <strong>Next:</strong>{' '}
          {deskPayloads.ssot?.handoff.nextActionFull ||
            summary?.nextAction ||
            (isLoading ? 'Loading…' : '—')}
        </p>

        <div className={news.desksWrap}>
          <h2
            className={news.desksHeading}
            style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}
          >
            Inside pages
          </h2>
          <p className={news.desksSub}>
            Live from monorepo
            {summary?.repoRoot ? ` · ${summary.repoRoot}` : ''}
          </p>

          <DeskDetails
            id="ssot"
            title="Agent SSOT"
            desk={NEWS_DESK.ssot.desk}
            section={NEWS_DESK.ssot.section}
            preview={deskPreview('ssot', summary, deskPayloads)}
          >
            <SsotDailyPage embedded compact panel />
          </DeskDetails>
          <DeskDetails
            id="context"
            title="Context"
            desk={NEWS_DESK.context.desk}
            section={NEWS_DESK.context.section}
            preview={deskPreview('context', summary, deskPayloads)}
          >
            <ContextDailyPage embedded compact panel />
          </DeskDetails>
          <DeskDetails
            id="prompt"
            title="Prompt"
            desk={NEWS_DESK.prompt.desk}
            section={NEWS_DESK.prompt.section}
            preview={deskPreview('prompt', summary, deskPayloads)}
          >
            <PromptDailyPage embedded compact panel />
          </DeskDetails>
          <DeskDetails
            id="ops"
            title="Abyss CLI"
            desk={NEWS_DESK.ops.desk}
            section={NEWS_DESK.ops.section}
            preview={deskPreview('ops', summary, deskPayloads)}
          >
            <OpsDailyPage embedded compact panel />
          </DeskDetails>
          <DeskDetails
            id="rag"
            title="Knowledge"
            desk={NEWS_DESK.rag.desk}
            section={NEWS_DESK.rag.section}
            preview={deskPreview('rag', summary, deskPayloads)}
          >
            <RagDailyPage embedded compact panel />
          </DeskDetails>
          <DeskDetails
            id="unicom"
            title="UNICOM"
            desk={NEWS_DESK.unicom.desk}
            section={NEWS_DESK.unicom.section}
            preview={deskPreview('unicom', summary, deskPayloads)}
          >
            <UnicomDailyPage embedded compact panel />
          </DeskDetails>
        </div>
      </div>
    </div>
  )
}
