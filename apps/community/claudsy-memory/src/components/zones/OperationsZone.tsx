'use client'

// Architected and built by Claudesy.

import type { DashboardState, DaemonStatus } from '@/lib/types'
import { CommandResults } from '../CommandResults'
import { DaemonStatus as DaemonStatusPanel } from '../DaemonStatus'

interface OperationsZoneProps {
  state: DashboardState
  onRunCommand: (cmd: string) => void
  onStartDaemon: (mode: DaemonStatus['mode'], intervalSeconds: number) => void
  onStopDaemon: () => void
  onOpenCommandDetail: () => void
  onPaletteOpen: () => void
}

const COMMANDS = [
  { id: 'health',      label: 'Health Check',  desc: 'Check engine health and stats' },
  { id: 'extract',     label: 'Extract',        desc: 'Extract facts from latest session' },
  { id: 'consolidate', label: 'Consolidate',    desc: 'Consolidate memory facts' },
  { id: 'boot',        label: 'Boot Context',   desc: 'Render boot context for agent' },
  { id: 'run',         label: 'Full Run',        desc: 'Extract + Consolidate combined', accent: true },
] as const

export function OperationsZone({
  state,
  onRunCommand,
  onStartDaemon,
  onStopDaemon,
  onOpenCommandDetail,
  onPaletteOpen,
}: OperationsZoneProps) {
  function execCommand(id: string) {
    onRunCommand(id)
    onOpenCommandDetail()
  }

  return (
    <div className="zone-page">
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">Operations</h1>
          <p className="zone-hero-sub">Commands · daemon control · execution history</p>
        </div>
        <button className="cmd-btn" onClick={onPaletteOpen}>
          ▶ Command Palette
        </button>
      </div>

      <div className="zone-two-col">
        {/* Left: Command grid + daemon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="zone-card">
            <div className="zone-card-header">
              <span className="zone-card-title">Engine Commands</span>
              {state.loading && <span className="spinner" />}
            </div>
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
          </section>

          <section className="zone-card">
            <div className="zone-card-header">
              <span className="zone-card-title">Daemon Control</span>
              <span
                className="status-badge"
                style={{ color: state.daemon.running ? 'var(--c-ok)' : 'var(--text-muted)' }}
              >
                {state.daemon.running ? `running · ${state.daemon.mode}` : 'idle'}
              </span>
            </div>
            <div className="zone-card-body">
              <DaemonStatusPanel
                daemon={state.daemon}
                loading={state.loading}
                onStartDaemon={onStartDaemon}
                onStopDaemon={onStopDaemon}
              />
            </div>
          </section>
        </div>

        {/* Right: Command output */}
        <CommandResults latestResult={state.commandResults.at(-1)} />
      </div>
    </div>
  )
}
