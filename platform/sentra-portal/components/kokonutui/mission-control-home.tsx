'use client'

import { Activity, BookOpen, Brain, FileText, MessageSquare, Terminal } from 'lucide-react'
import Link from 'next/link'

import { PortalCard } from '@/components/portal/portal-card'
import { portal } from '@/components/portal/portal-design'
import { cn } from '@/lib/utils'

const CARDS = [
  {
    href: '/dashboard/daily/ssot',
    title: 'Agent SSOT',
    desc: 'HANDOFF, PROGRESS, ssot-daily, shape guard',
    icon: FileText,
  },
  {
    href: '/dashboard/daily/context',
    title: 'Context Capsule',
    desc: 'Handbook freshness + file:// launch',
    icon: Brain,
  },
  {
    href: '/dashboard/daily/rag',
    title: 'Sentra-pustaka',
    desc: 'Registry, AADI readiness, eval runs',
    icon: BookOpen,
  },
  {
    href: '/dashboard/daily/unicom',
    title: 'Sentra UNICOM',
    desc: 'Cockpit health, agents, delivery mode',
    icon: MessageSquare,
  },
  {
    href: '/dashboard/daily/prompt',
    title: 'Sentra Prompt',
    desc: 'Extension version + audit log stats',
    icon: Activity,
  },
  {
    href: '/dashboard/daily/ops',
    title: 'Abyss CLI Ops',
    desc: 'Dirty tree, doctor, branch status',
    icon: Terminal,
  },
] as const

export default function MissionControlHome() {
  return (
    <div className={portal.stack}>
      <header>
        <h1 className={portal.type.pageTitle}>PORTAL Mission Control</h1>
        <p className={cn(portal.type.pageSubtitle, 'mt-1 max-w-2xl')}>
          Executive strip refreshes every 30s. Open a command center for daily review.
        </p>
      </header>

      <PortalCard title="Command Centers">
        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', portal.gridDense)}>
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={cn(
                portal.surface.inset,
                'flex flex-col transition-colors hover:border-zinc-300 dark:hover:border-zinc-600'
              )}
            >
              <card.icon className={cn('mb-3 h-4 w-4', portal.type.accent)} />
              <span className={portal.type.cardTitle}>{card.title}</span>
              <span className={cn(portal.type.bodyMuted, 'mt-1')}>{card.desc}</span>
            </Link>
          ))}
        </div>
      </PortalCard>

      <PortalCard title="Legacy Views">
        <Link
          href="/dashboard/ecosystem"
          className={cn(portal.type.cardTitle, portal.type.accent, 'hover:underline')}
        >
          Ecosystem Intelligence →
        </Link>
      </PortalCard>
    </div>
  )
}
