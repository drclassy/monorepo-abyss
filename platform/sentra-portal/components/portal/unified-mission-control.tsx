'use client'

import { Activity, BookOpen, Brain, FileText, MessageSquare, Terminal } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ContextDailyPage } from './daily/context-page'
import { OpsDailyPage } from './daily/ops-page'
import { PromptDailyPage } from './daily/prompt-page'
import { RagDailyPage } from './daily/rag-page'
import { SsotDailyPage } from './daily/ssot-page'
import { UnicomDailyPage } from './daily/unicom-page'
import { ExecutiveStrip } from './executive-strip'
import { MissionControlOverview } from './mission-control-overview'
import { portal } from './portal-design'

import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'ssot', label: 'SSOT', icon: FileText },
  { id: 'ops', label: 'Ops', icon: Terminal },
  { id: 'rag', label: 'RAG', icon: BookOpen },
  { id: 'unicom', label: 'UNICOM', icon: MessageSquare },
  { id: 'context', label: 'Context', icon: Brain },
  { id: 'prompt', label: 'Prompt', icon: Activity },
] as const

type SectionId = (typeof SECTIONS)[number]['id'] | 'overview'

function isSectionId(hash: string): hash is SectionId {
  return hash === 'overview' || SECTIONS.some((s) => s.id === hash)
}

export default function UnifiedMissionControl() {
  const [active, setActive] = useState<SectionId>('overview')

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace('#', '')
      if (!hash) {
        setActive('overview')
        return
      }
      if (isSectionId(hash)) setActive(hash)
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  function jump(id: SectionId) {
    setActive(id)
    const path = id === 'overview' ? '/dashboard' : `/dashboard#${id}`
    window.history.replaceState(null, '', path)
  }

  return (
    <div className={portal.stack}>
      <div className={portal.layout.workspace}>
        <div className="border-b border-sentra-grid px-4 py-3 dark:border-sentra-slate/80">
          <h1 className={portal.type.pageTitle}>Mission Control</h1>
          <p className={portal.type.pageSubtitle}>Sentra monorepo operations</p>
        </div>
        <ExecutiveStrip embedded />
        <nav className={portal.tabs.row} aria-label="Domains">
          <button
            type="button"
            onClick={() => jump('overview')}
            className={active === 'overview' ? portal.tabs.itemActive : portal.tabs.item}
          >
            Overview
          </button>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => jump(id)}
              className={cn(
                'inline-flex items-center gap-1.5',
                active === id ? portal.tabs.itemActive : portal.tabs.item
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4">
          {active === 'overview' ? (
            <MissionControlOverview onOpen={(id) => jump(id as SectionId)} strip={false} />
          ) : (
            <div className={portal.stack}>
              <button type="button" onClick={() => jump('overview')} className={portal.btn.link}>
                ← Back to overview
              </button>
              {active === 'ssot' && <SsotDailyPage embedded panel />}
              {active === 'ops' && <OpsDailyPage embedded panel />}
              {active === 'rag' && <RagDailyPage embedded panel />}
              {active === 'unicom' && <UnicomDailyPage embedded panel />}
              {active === 'context' && <ContextDailyPage embedded panel />}
              {active === 'prompt' && <PromptDailyPage embedded panel />}
            </div>
          )}
        </div>
      </div>

      {active === 'overview' ? (
        <p className={portal.type.bodyMuted}>
          <Link href="/dashboard/ecosystem" className={portal.btn.link}>
            Ecosystem Intelligence (legacy)
          </Link>
        </p>
      ) : null}
    </div>
  )
}
