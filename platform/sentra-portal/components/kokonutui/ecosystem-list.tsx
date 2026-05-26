'use client'

import { Activity, BookOpen, Brain, Cpu, Heart, Terminal } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DivisionItem {
  id: string
  title: string
  description?: string
  status: string
  type: 'healthcare' | 'platform' | 'library' | 'agent'
}

interface EcosystemListProps {
  totalNodes?: string
  divisions?: DivisionItem[]
  className?: string
}

const DIVISIONS: DivisionItem[] = [
  {
    id: '1',
    title: 'Healthcare Division',
    description: 'Sentra-Main, Referralink, IntelligenceBoard',
    status: '5 Apps Online',
    type: 'healthcare',
  },
  {
    id: '2',
    title: 'Intelligence & Logic',
    description: 'Orchestrator (Saga), Aby (Gemma 2)',
    status: 'All Synced',
    type: 'agent',
  },
  {
    id: '3',
    title: 'Medical Library',
    description: '119 GUIDELINES / KMK indexed',
    status: '85% Mapped',
    type: 'library',
  },
  {
    id: '4',
    title: 'Infrastructure',
    description: 'NeonDB, Local RAG, Ollama Hub',
    status: 'Stable',
    type: 'platform',
  },
]

export default function EcosystemList({
  totalNodes = '12 Intelligence Nodes',
  divisions = DIVISIONS,
  className,
}: EcosystemListProps) {
  return (
    <div
      className={cn(
        'w-full max-w-xl mx-auto',
        'bg-white dark:bg-zinc-900/70',
        'border border-zinc-100 dark:border-zinc-800',
        'rounded-xl shadow-sm backdrop-blur-xl',
        className
      )}
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Abyss Ecosystem Capacity</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalNodes}</h1>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Regional Sub-Systems
          </h2>
        </div>

        <div className="space-y-1">
          {divisions.map((div) => (
            <div
              key={div.id}
              className={cn(
                'group flex items-center justify-between',
                'p-2 rounded-lg',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800/50',
                'transition-all duration-200'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn('p-1.5 rounded-lg', {
                    'bg-rose-100 dark:bg-rose-900/30': div.type === 'healthcare',
                    'bg-blue-100 dark:bg-blue-900/30': div.type === 'platform',
                    'bg-emerald-100 dark:bg-emerald-900/30': div.type === 'library',
                    'bg-purple-100 dark:bg-purple-900/30': div.type === 'agent',
                  })}
                >
                  {div.type === 'healthcare' && (
                    <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  {div.type === 'platform' && (
                    <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  {div.type === 'library' && (
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {div.type === 'agent' && (
                    <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {div.title}
                  </h3>
                  {div.description && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {div.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {div.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              'flex items-center justify-center gap-2',
              'py-2 px-3 rounded-lg',
              'text-xs font-medium',
              'bg-zinc-900 dark:bg-zinc-50',
              'text-zinc-50 dark:text-zinc-900',
              'hover:bg-zinc-800 dark:hover:bg-zinc-200',
              'shadow-sm transition-all duration-200'
            )}
            onClick={() => window.alert('Memulai pemeriksaan kesehatan seluruh node...')}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Check</span>
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center justify-center gap-2',
              'py-2 px-3 rounded-lg',
              'text-xs font-medium',
              'bg-zinc-900 dark:bg-zinc-50',
              'text-zinc-50 dark:text-zinc-900',
              'hover:bg-zinc-800 dark:hover:bg-zinc-200',
              'shadow-sm transition-all duration-200'
            )}
            onClick={() =>
              window.alert('Membuka ringkasan stack local-first dan status layanan internal...')
            }
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Stack Console</span>
          </button>
        </div>
      </div>
    </div>
  )
}
