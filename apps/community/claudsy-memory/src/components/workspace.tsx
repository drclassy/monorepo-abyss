'use client'

// Architected and built by Claudesy.
import { useMemo, useState } from 'react'
import type {
  DashboardState,
  DaemonStatus,
  HealthHistoryEntry,
  SearchFilters,
  WorkspaceTab,
} from '@/lib/types'

interface WorkspaceProps {
  state: DashboardState
  onTabChange: (tab: WorkspaceTab) => void
  docContent: string
  docName: string
  onDocSave: (content: string) => void
  onAgentChange: (agent: string) => void
  onAddAgent: (name: string) => void
  onRemoveAgent: (name: string) => void
  onStartAgent: () => void
  onRunCommand: (cmd: string) => void
  onSearch: (filters: SearchFilters) => void
  onLoadDocument: (doc: string) => void
  onStartDaemon: (mode: DaemonStatus['mode'], intervalSeconds: number) => void
  onStopDaemon: () => void
  onPaletteOpen: () => void
  onInspectFact: (factId: string) => void
  onSearchPageChange?: (page: number) => void
}

const TOP_NAV = [
  'Engine Overview',
  'Memory Atlas',
  'Session Replay',
  'Boot Context',
  'Engine Health',
] as const

const DOC_ACTIONS = [
  { id: 'SOUL.md', label: 'SOUL', caption: 'Identitas' },
  { id: 'MEMORY.md', label: 'MEMORY', caption: 'Recall' },
  { id: 'SKILLS.md', label: 'SKILLS', caption: 'Skillset' },
] as const

function greetingForHour(hour: number) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}

function formatDateLabel(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildStatusTone(status?: 'healthy' | 'warning' | 'critical' | null) {
  if (status === 'healthy') return 'ok'
  if (status === 'warning') return 'warn'
  return 'off'
}

function statusTextFromHealth(history?: HealthHistoryEntry | null) {
  if (!history) return 'Belum ada snapshot'
  return history.message
}

function DocEditorOverlay({
  docName,
  content,
  onSave,
  onClose,
}: {
  docName: string
  content: string
  onSave: (content: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(content)

  return (
    <div className="workspace">
      <div className="workspace-hero">
        <div className="workspace-hero-copy">
          <h1 className="workspace-hero-heading">{docName}</h1>
          <p className="workspace-hero-sub">Editing engine document</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 20 }}>
      <button className="cmd-btn" onClick={onClose}>← Workspace</button>
          <button className="cmd-btn accent" onClick={() => onSave(value)}>Save</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 14px 14px' }}>
        <textarea
          className="doc-editor"
          style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
    </div>
  )
}

export function Workspace({
  state,
  onTabChange,
  docContent,
  docName,
  onDocSave,
  onStartAgent,
  onRunCommand,
  onSearch,
  onLoadDocument,
  onPaletteOpen,
}: WorkspaceProps) {
  const now = new Date()
  const greeting = greetingForHour(now.getHours())
  const heroName = state.agent || 'Claudesy Operator'
  const latestActivity = state.activity.at(-1) ?? null
  const healthSummary = state.healthSummary
  const latestHealth = state.healthHistory.at(-1) ?? null

  const categoryBadges = useMemo(() => {
    const categories = state.engineState?.categories ?? {}
    const labels = Object.entries(categories)
      .filter(([, count]) => count > 0)
      .slice(0, 5)
      .map(([name, count]) => `${name.toUpperCase()} ${count}`)

      return labels.length > 0 ? labels : ['MEMORY', 'ENGINE', 'ACTIVE']
  }, [state.engineState?.categories])

  const profileRows = [
    { label: 'Operator', value: state.agent },
    { label: 'Workspace Path', value: state.baseDir },
    { label: 'Fact Count', value: String(state.engineState?.factCount ?? 0) },
    { label: 'Session Count', value: String(state.engineState?.sessionCount ?? 0) },
    { label: 'Last Run', value: formatDateTimeLabel(state.engineState?.lastRun) },
    { label: 'Latest Event', value: latestActivity?.message ?? 'Belum ada event' },
  ]

  const institutionRows = [
    { label: 'Model Reachability', value: state.engineState?.ollamaReachable ? 'Ollama online' : 'Ollama offline' },
    { label: 'Daemon Mode', value: state.daemon.running ? `${state.daemon.mode} • aktif` : 'idle' },
    { label: 'Health State', value: healthSummary?.status ?? 'unknown', accent: true },
    { label: 'Last Snapshot', value: latestHealth?.status ?? 'Belum ada status' },
  ]

  const credentialRows = [
    { label: 'Daemon PID', value: state.daemon.pid ? String(state.daemon.pid) : '—' },
    { label: 'Loop Interval', value: `${state.daemon.intervalSeconds}s` },
    { label: 'Last Check', value: formatDateTimeLabel(healthSummary?.checkedAt) },
    { label: 'Anomaly Count', value: String(healthSummary?.anomalies.length ?? 0) },
  ]

  const statusRows = [
    {
      label: 'Engine Runtime',
      value: statusTextFromHealth(latestHealth),
      tone: buildStatusTone(healthSummary?.status ?? 'critical'),
    },
    {
      label: 'Daemon Loop',
      value: state.daemon.running ? 'Aktif' : 'Standby',
      tone: state.daemon.running ? 'ok' : 'warn',
    },
    {
      label: 'Recall Access',
      value: state.searchResults.length > 0 ? 'Hasil siap dibuka' : 'Siap dibuka',
      tone: state.searchResults.length > 0 ? 'ok' : 'off',
    },
  ]

  const logbookRows = state.activity.length > 0
    ? [...state.activity].slice(-5).reverse().map((event, index) => ({
        id: event.id,
        no: String(index + 1),
        subject: event.category,
        detail: event.message,
        date: event.timestamp,
      }))
    : [{
        id: 'empty',
        no: '1',
        subject: 'activity',
        detail: 'Belum ada activity log',
        date: formatDateLabel(now.toISOString()),
      }]

  const whoIsOnline = state.daemon.running ? 'ONLINE' : 'STANDBY'

  if (docContent && docName) {
    return (
      <DocEditorOverlay
        docName={docName}
        content={docContent}
        onSave={onDocSave}
        onClose={() => onTabChange('activity')}
      />
    )
  }

  return (
    <div className="release-page">
      <div className="release-shell">
        <section className="release-greeting-card">
          <div className="release-greeting-main">
            <h1 className="release-greeting-title">{greeting}, {heroName}</h1>
            <div className="release-topnav">
              {TOP_NAV.map((item, index) => (
                <button
                  key={item}
                  className={`release-topnav-link${index === 4 ? ' active' : ''}`}
                  onClick={() => {
                    if (item === 'Boot Context') {
                      onLoadDocument('SOUL.md')
                      return
                    }
                    if (item === 'Engine Health') {
                      onRunCommand('health')
                      return
                    }
                    onPaletteOpen()
                  }}
                >
                  {item}
                </button>
              ))}
              <button className="release-edit-button" onClick={onPaletteOpen}>
                Open Controls
              </button>
            </div>
          </div>
          <div className="release-greeting-side">
            <div className="release-credential-box">
              ENGINE: {state.agent}
            </div>
            <button className="release-dropdown-button" aria-label="Open options">
              v
            </button>
          </div>
        </section>

        <div className="release-main-grid">
          <div className="release-main-column">
            <section className="release-card">
              <div className="release-card-body release-profile-body">
                <div className="release-profile-hero">
                  <div className="release-profile-avatar">{state.agent.slice(0, 2).toUpperCase()}</div>
                  <div className="release-profile-copy">
                    <div className="release-section-kicker">Memory Operator</div>
                    <h2 className="release-profile-name">{state.agent}</h2>
                    <div className="release-profile-role">
                      Claudesy Memory Engine • Local Runtime
                    </div>
                    <div className="release-chip-row">
                      {categoryBadges.map((badge) => (
                        <span key={badge} className="release-chip">{badge}</span>
                      ))}
                    </div>
                  </div>
                  <div className="release-profile-mark">CME</div>
                </div>

                <div className="release-mini-grid">
                  <div className="release-mini-card">
                    <div className="release-section-kicker">Engine Role</div>
                    <div className="release-mini-value">Memory Operator</div>
                  </div>
                  <div className="release-mini-card">
                    <div className="release-section-kicker">Execution Mode</div>
                    <div className="release-mini-value">AI Memory Console</div>
                  </div>
                </div>

                <div className="release-links-card">
                  <div className="release-section-kicker">Engine Surfaces</div>
                  <div className="release-link-row">
                    {DOC_ACTIONS.map((doc) => (
                      <button
                        key={doc.id}
                        className="release-link-button"
                        onClick={() => onLoadDocument(doc.id)}
                        title={doc.caption}
                      >
                        {doc.label}
                      </button>
                    ))}
                    <button className="release-link-button" onClick={() => onRunCommand('boot')}>BOOT</button>
                    <button className="release-link-button" onClick={() => onRunCommand('health')}>SCAN</button>
                    <button className="release-link-button" onClick={() => onStartAgent()}>RUN</button>
                  </div>
                </div>
              </div>

              <div className="release-card-section">
                <div className="release-section-kicker release-section-heading">Runtime Context</div>
                {profileRows.map((row) => (
                  <div key={row.label} className="release-data-row">
                    <span className="release-data-label">{row.label}</span>
                    <span className="release-data-value">{row.value || '—'}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="release-card-plain">
              <div className="release-section-kicker release-section-heading">Engine Actions</div>
              <div className="release-service-grid">
                {[
                  { title: 'Health Scan', subtitle: 'runtime check', code: 'HEALTH', action: () => onRunCommand('health') },
                  { title: 'Command Palette', subtitle: 'control deck', code: 'PALETTE', action: () => onPaletteOpen() },
                  { title: 'Memory Recall', subtitle: 'recent memory', code: 'RECALL', action: () => onLoadDocument('MEMORY.md') },
                ].map((item) => (
                  <button key={item.title} className="release-service-card" onClick={item.action}>
                    <span className="release-service-title">{item.title}</span>
                    <div className="release-service-row">
                      <span className="release-service-subtitle">{item.subtitle}</span>
                      <span className="release-service-code">{item.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="release-card-plain">
              <div className="release-section-kicker release-section-heading">Runtime Presence</div>
              <div className="release-online-card">
                <div className="release-online-copy">
                  <div className="release-online-name">
                    {state.agent} <span className="release-online-self">ACTIVE</span>
                  </div>
                  <div className="release-online-sub">Claudesy Memory Engine • Local Runtime</div>
                </div>
                <div className="release-online-state">
                  <span className={`release-online-dot${state.daemon.running ? ' live' : ''}`} />
                  {whoIsOnline}
                </div>
              </div>
            </section>
          </div>

          <div className="release-main-column">
            <section className="release-card">
              <div className="release-card-section">
                <div className="release-section-kicker release-section-heading">Execution State</div>
                <div className="release-tag-row">
                  <span className="release-role-pill">
                    {state.daemon.running ? 'Daemon Loop Sedang Berjalan' : 'Engine Supervisor Ready'}
                  </span>
                </div>
                <div className="release-muted-copy">Claudesy Memory Engine • Active local runtime</div>
              </div>

              <div className="release-card-section">
                <div className="release-section-kicker release-section-heading">Engine Signals</div>
                {institutionRows.map((row) => (
                  <div key={row.label} className="release-data-row">
                    <span className="release-data-label">{row.label}</span>
                    <span className={`release-data-value${row.accent ? ' accent' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="release-card-section release-card-section-last">
                <div className="release-section-kicker release-section-heading">Runtime Credentials</div>
                {credentialRows.map((row) => (
                  <div key={row.label} className="release-data-row">
                    <span className="release-data-label">{row.label}</span>
                    <span className="release-data-value">{row.value}</span>
                  </div>
                ))}
                <div className="release-footnote-row">
                  <span className="release-footnote-dot" />
                  <span className="release-footnote-text">Engine state tersimpan pada workspace lokal</span>
                </div>
              </div>
            </section>

            <section className="release-card-plain">
              <div className="release-section-kicker release-section-heading">Health Snapshot</div>
              <div className="release-status-stack">
                {statusRows.map((row) => (
                  <div key={row.label} className="release-status-row">
                    <span className="release-status-label">{row.label}</span>
                    <span className="release-status-value">{row.value}</span>
                    <span className={`release-status-dot ${row.tone}`} />
                  </div>
                ))}
              </div>
            </section>

            <section className="release-card-plain">
              <div className="release-section-kicker release-section-heading">Activity Logbook</div>
              <div className="release-logbook-table">
                <div className="release-logbook-head">
                  <span>No</span>
                  <span>Stream</span>
                  <span>Event</span>
                  <span>Timestamp</span>
                </div>
                <div className="release-logbook-body">
                  {logbookRows.map((row) => (
                    <button
                      key={row.id}
                      className="release-logbook-row"
                      onClick={() => onTabChange('activity')}
                    >
                      <span>{row.no}</span>
                      <span>{row.subject}</span>
                      <span>{row.detail}</span>
                      <span>{row.date}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="release-footer" aria-label="Footer aplikasi">
          <div className="release-footer-topline" />
          <div className="release-footer-hero">
            <div className="release-footer-hero-main">
              <div className="release-footer-kicker">Claudesy Runtime Layer</div>
              <h2 className="release-footer-title">Claudesy Memory Engine 2026</h2>
            </div>
            <div className="release-footer-summary">
              <p>
                Claudesy Memory Engine saat ini masih dalam tahap pengembangan
                intensif. Dengan demikian, fitur, data, dan fungsionalitas yang tersedia
                mungkin belum sepenuhnya akurat dan stabil.
              </p>
              <p>
                Seluruh hak kekayaan intelektual, properti, dan konten yang terkait dengan
                engine ini berada di bawah ekosistem Sentra dan Claudesy.
              </p>
            </div>
          </div>
          <div className="release-footer-grid">
            <section className="release-footer-section">
              <div className="release-footer-section-title">Memory Surfaces</div>
              <div className="release-footer-links">
                <button className="release-footer-link" onClick={() => onLoadDocument('SOUL.md')}>Boot Context</button>
                <button className="release-footer-link" onClick={() => onLoadDocument('MEMORY.md')}>Memory Recall</button>
                <button className="release-footer-link" onClick={() => onLoadDocument('SKILLS.md')}>Skill Matrix</button>
                <button className="release-footer-link" onClick={() => onStartAgent()}>Runtime Start</button>
              </div>
            </section>
            <section className="release-footer-section">
              <div className="release-footer-section-title">Engine Controls</div>
              <div className="release-footer-links">
                <button className="release-footer-link" onClick={() => onSearch({ mode: 'recent', query: '', category: '', status: '', page: 1, pageSize: state.searchMeta.pageSize })}>Recent Recall</button>
                <button className="release-footer-link" onClick={() => onPaletteOpen()}>Command Palette</button>
                <button className="release-footer-link" onClick={() => onRunCommand('health')}>Health Scan</button>
                <button className="release-footer-link" onClick={() => onTabChange('output')}>Command Output</button>
              </div>
            </section>
            <section className="release-footer-section">
              <div className="release-footer-section-title">System Views</div>
              <div className="release-footer-links">
                <button className="release-footer-link" onClick={() => onTabChange('activity')}>Activity Stream</button>
                <button className="release-footer-link" onClick={() => onTabChange('search')}>Search Results</button>
                <button className="release-footer-link" onClick={() => onTabChange('health')}>Health Timeline</button>
              </div>
            </section>
            <section className="release-footer-section">
              <div className="release-footer-section-title">Governance</div>
              <div className="release-footer-links">
                <button className="release-footer-link" onClick={() => onLoadDocument('SOUL.md')}>Runtime Notes</button>
                <button className="release-footer-link" onClick={() => onLoadDocument('MEMORY.md')}>Memory Policies</button>
                <button className="release-footer-link" onClick={() => onLoadDocument('SKILLS.md')}>Skill Contracts</button>
                <button className="release-footer-link" onClick={() => onRunCommand('health')}>Safety Status</button>
              </div>
            </section>
            <section className="release-footer-section release-footer-section-meta">
              <div className="release-footer-section-title">Scope</div>
              <div className="release-footer-meta-list">
                <div>Multi-agent persistent memory</div>
                <div>Local workspace runtime</div>
                <div>Recall, health, daemon, and boot context</div>
              </div>
            </section>
          </div>
          <div className="release-footer-bottomline">
            <div>© 2026 Claudesy Memory Engine</div>
            <div>Designed for disciplined, persistent memory operations.</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
