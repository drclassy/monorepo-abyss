'use client'

// Architected and built by Claudesy.

interface TopBarProps {
  agent: string
  agents: string[]
  loading: boolean
  daemonRunning: boolean
  factCount: number
  onAgentChange: (agent: string) => void
  onSync: () => void
}

export function TopBar({
  agent,
  agents,
  loading,
  daemonRunning,
  factCount,
  onAgentChange,
  onSync,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <span className="top-bar-logo">Claudesy</span>
        <span className="top-bar-logo-sub">Memory Engine</span>
      </div>

      <div className="top-bar-divider" />

      <div className="top-bar-agent">
        <span className="top-bar-label">Agent</span>
        <select
          className="top-bar-select"
          value={agent}
          onChange={(e) => onAgentChange(e.target.value)}
          disabled={loading}
        >
          {agents.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="top-bar-spacer" />

      <div className="top-bar-status">
        <span className={`top-bar-pulse${daemonRunning ? ' live' : ''}`} />
        <span className="top-bar-status-text">
          {daemonRunning ? 'Daemon active' : 'Daemon idle'}
        </span>
      </div>

      <div className="top-bar-divider" />

      <div className="top-bar-facts">
        <span className="top-bar-label">Facts</span>
        <span className="top-bar-fact-count">{factCount}</span>
      </div>

      <div className="top-bar-divider" />

      <button
        className="top-bar-sync-btn"
        onClick={onSync}
        disabled={loading}
        title="Sync engine state"
      >
        {loading ? <span className="spinner" /> : '↻'}
      </button>
    </header>
  )
}
