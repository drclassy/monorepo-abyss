'use client'

// Architected and built by Claudesy.

import { useState } from 'react'
import type { DashboardState, DaemonStatus } from '@/lib/types'
import { ActivityFeed } from '../ActivityFeed'
import { CommandResults } from '../CommandResults'
import { DaemonStatus as DaemonStatusPanel } from '../DaemonStatus'
import { AgentManagement } from '../AgentManagement'

interface OverviewZoneProps {
  state: DashboardState
  onRunCommand: (cmd: string) => void
  onOpenCommandDetail: () => void
  onStartDaemon: (mode: DaemonStatus['mode'], intervalSeconds: number) => void
  onStopDaemon: () => void
  onPaletteOpen: () => void
  onDocSave: (content: string, docName: string) => Promise<void>
  onActivity: (ev: { id: string; level: 'info' | 'warn' | 'error' | 'success'; category: string; message: string; timestamp: string }) => void
  onAgentChange: (agent: string) => void
  onAddAgent: (name: string) => void
  onRemoveAgent: (name: string) => void
  onStartAgent: () => void
}

function greetingForHour(hour: number) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}

function mkId() {
  return Math.random().toString(36).slice(2)
}

const COMMANDS = [
  { id: 'health',      label: 'Health Check',  desc: 'Check engine health and stats' },
  { id: 'extract',     label: 'Extract',        desc: 'Extract facts from latest session' },
  { id: 'consolidate', label: 'Consolidate',    desc: 'Consolidate memory facts' },
  { id: 'boot',        label: 'Boot Context',   desc: 'Render boot context for agent' },
  { id: 'run',         label: 'Full Run',        desc: 'Extract + Consolidate combined' },
] as const

const DOCS = [
  { id: 'SOUL.md',   label: 'SOUL',   caption: 'Agent identity and boot context' },
  { id: 'MEMORY.md', label: 'MEMORY', caption: 'Persistent memory recall document' },
  { id: 'SKILLS.md', label: 'SKILLS', caption: 'Skill matrix and capabilities' },
] as const

export function OverviewZone({
  state,
  onRunCommand,
  onOpenCommandDetail,
  onStartDaemon,
  onStopDaemon,
  onPaletteOpen,
  onDocSave,
  onActivity,
  onAgentChange,
  onAddAgent,
  onRemoveAgent,
  onStartAgent,
}: OverviewZoneProps) {
  const now = new Date()
  const greeting = greetingForHour(now.getHours())
  const health = state.healthSummary
  const daemon = state.daemon
  const engine = state.engineState

  const [activeDoc, setActiveDoc]   = useState<string | null>(null)
  const [docContent, setDocContent] = useState('')
  const [editValue, setEditValue]   = useState('')
  const [docLoading, setDocLoading] = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')

  const statusTone = health?.status === 'healthy' ? 'ok'
    : health?.status === 'warning' ? 'warn'
    : 'fail'

  const quickStats = [
    { label: 'Facts',    value: engine?.factCount    ?? '—', unit: 'stored' },
    { label: 'Sessions', value: engine?.sessionCount ?? '—', unit: 'logged' },
    { label: 'Agents',   value: state.agents.length,          unit: 'registered' },
    { label: 'Daemon',   value: daemon.running ? 'ON' : 'OFF', unit: daemon.mode },
  ]

  const signals = [
    { label: 'Health State',    value: health?.status ?? 'unknown',  accent: true },
    { label: 'Daemon Loop',     value: daemon.running ? `${daemon.mode} • aktif` : 'idle' },
    { label: 'Ollama',          value: engine?.ollamaReachable ? 'online' : 'offline' },
    { label: 'Last Run',        value: engine?.lastRun ? new Date(engine.lastRun).toLocaleString('id-ID') : '—' },
    { label: 'Anomalies',       value: String(health?.anomalies.length ?? 0) },
  ]

  function execCommand(id: string) {
    onRunCommand(id)
    onOpenCommandDetail()
  }

  async function loadDoc(doc: string) {
    setDocLoading(true)
    setSaveMsg('')
    try {
      const res = await fetch(
        `/api/document?agent=${encodeURIComponent(state.agent)}&doc=${encodeURIComponent(doc)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `Failed to load ${doc}`)
      setActiveDoc(doc)
      setDocContent(data.content ?? '')
      setEditValue(data.content ?? '')
      onActivity({
        id: mkId(), level: 'success', category: 'doc',
        message: `Loaded ${doc}`, timestamp: new Date().toLocaleTimeString(),
      })
    } catch (err) {
      onActivity({
        id: mkId(), level: 'error', category: 'doc',
        message: `Load failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        timestamp: new Date().toLocaleTimeString(),
      })
    } finally {
      setDocLoading(false)
    }
  }

  async function handleDocSaveLocal() {
    if (!activeDoc) return
    setSaveMsg('')
    setDocLoading(true)
    try {
      await onDocSave(editValue, activeDoc)
      setDocContent(editValue)
      setSaveMsg('Saved successfully.')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Save failed.')
    } finally {
      setDocLoading(false)
    }
  }

  function handleDocClose() {
    setActiveDoc(null)
    setDocContent('')
    setEditValue('')
    setSaveMsg('')
  }

  const hasChanges = editValue !== docContent

  return (
    <div className="zone-page">
      {/* Hero */}
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">{greeting}, {state.agent}</h1>
          <p className="zone-hero-sub">Claudesy Memory Engine · Overview</p>
        </div>
        <div className="zone-hero-actions">
          <button className="cmd-btn accent" onClick={() => { onRunCommand('health'); onOpenCommandDetail() }}>
            Health Check
          </button>
          <button className="cmd-btn" onClick={() => { onRunCommand('run'); onOpenCommandDetail() }}>
            Full Run
          </button>
          <button className="cmd-btn" onClick={onPaletteOpen}>
            ▶ Command Palette
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="zone-stats-row">
        {quickStats.map((s) => (
          <div key={s.label} className="zone-stat-card">
            <div className="zone-stat-label">{s.label}</div>
            <div className="zone-stat-value">{String(s.value)}</div>
            <div className="zone-stat-unit">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Agent Management */}
      <AgentManagement
        state={state}
        onAgentChange={onAgentChange}
        onAddAgent={onAddAgent}
        onRemoveAgent={onRemoveAgent}
        onStartAgent={onStartAgent}
      />

      {/* Engine Signals + Activity Feed */}
      <div className="zone-two-col">
        <section className="zone-card">
          <div className="zone-card-header">
            <span className="zone-card-title">Engine Signals</span>
            <span className={`release-status-dot ${statusTone}`} />
          </div>
          <div className="zone-card-body">
            {signals.map((row) => (
              <div key={row.label} className="release-data-row">
                <span className="release-data-label">{row.label}</span>
                <span className={`release-data-value${row.accent ? ' accent' : ''}`}>{row.value}</span>
              </div>
            ))}
          </div>
          {health?.anomalies.length ? (
            <div className="zone-card-footer">
              <div className="zone-card-footer-label">Anomalies</div>
              {health.anomalies.slice(0, 3).map((a, i) => (
                <div key={i} className="zone-anomaly-row">{a}</div>
              ))}
            </div>
          ) : null}
        </section>

        <ActivityFeed
          activity={state.activity}
          lastEvent={state.activity.at(-1)}
        />
      </div>

      {/* Operations */}
      <div className="zone-two-col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="zone-card">
            <div className="zone-card-body">
              <div className="ops-command-grid">
                {COMMANDS.map((cmd) => (
                  <button
                    key={cmd.id}
                    className={`ops-cmd-btn${cmd.id === 'run' ? ' accent' : ''}`}
                    disabled={state.loading}
                    onClick={() => execCommand(cmd.id)}
                    title={cmd.desc}
                  >
                    <span className="ops-cmd-label">{cmd.label}</span>
                    <span className="ops-cmd-desc">{cmd.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="zone-card-header">
              <span className="zone-card-title">Engine Commands</span>
              {state.loading && <span className="spinner" />}
            </div>
          </section>

          <section className="zone-card">
            <div className="zone-card-header">
              <span className="zone-card-title">Daemon Control</span>
              <span
                className="status-badge"
                style={{ color: daemon.running ? 'var(--c-ok)' : 'var(--text-muted)' }}
              >
                {daemon.running ? `running · ${daemon.mode}` : 'idle'}
              </span>
            </div>
            <div className="zone-card-body">
              <DaemonStatusPanel
                daemon={daemon}
                loading={state.loading}
                onStartDaemon={onStartDaemon}
                onStopDaemon={onStopDaemon}
              />
            </div>
          </section>
        </div>

        <CommandResults latestResult={state.commandResults.at(-1)} />
      </div>

      {/* Documents */}
      <section className="zone-card">
        <div className="zone-card-header">
          <span className="zone-card-title">Documents</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>SOUL · MEMORY · SKILLS</span>
          {activeDoc && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
              {saveMsg && <span className="detail-msg">{saveMsg}</span>}
              {hasChanges && (
                <button className="cmd-btn accent" onClick={handleDocSaveLocal} disabled={docLoading || state.loading}>
                  {docLoading ? <span className="spinner" /> : 'Save'}
                </button>
              )}
              <button className="cmd-btn" onClick={handleDocClose}>Close</button>
            </div>
          )}
        </div>
        <div className="zone-card-body">
          {!activeDoc ? (
            <div className="docs-picker-grid">
              {DOCS.map((doc) => (
                <button
                  key={doc.id}
                  className="docs-picker-card"
                  onClick={() => loadDoc(doc.id)}
                  disabled={docLoading || state.loading}
                >
                  <span className="docs-picker-icon">≡</span>
                  <span className="docs-picker-label">{doc.label}</span>
                  <span className="docs-picker-caption">{doc.caption}</span>
                  <span className="docs-picker-file">{doc.id}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="docs-editor-wrap">
              <div className="docs-editor-header">
                <span className="zone-card-title">{activeDoc}</span>
                {hasChanges && <span className="docs-unsaved">• Unsaved changes</span>}
              </div>
              <textarea
                className="doc-editor docs-editor-area"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={docLoading}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
