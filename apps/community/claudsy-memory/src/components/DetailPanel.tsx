'use client'

// Architected and built by Claudesy.

import { useState } from 'react'
import type { DashboardState, ZoneDetailPanel } from '@/lib/types'

interface DetailPanelProps {
  state: DashboardState
  mode: ZoneDetailPanel['mode']
  open: boolean
  onClose: () => void
  onRunCommand: (cmd: string) => void
}

function FactDetailView({ state }: { state: DashboardState }) {
  const fact = state.selectedFact
  if (!fact) {
    return (
      <div className="detail-empty">
        <div className="detail-empty-title">No fact selected</div>
        <div className="detail-empty-sub">Click a row in Memory zone to inspect a fact.</div>
      </div>
    )
  }

  const rows: { label: string; value: string }[] = [
    { label: 'ID',           value: fact.id },
    { label: 'Category',     value: fact.category },
    { label: 'Status',       value: fact.status },
    { label: 'Importance',   value: String(fact.importance) },
    { label: 'Source',       value: fact.source },
    { label: 'Created',      value: fact.created },
    { label: 'Last Accessed',value: fact.last_accessed },
    { label: 'Access Count', value: String(fact.access_count) },
    { label: 'Operation',    value: fact.operation },
  ]

  return (
    <div className="detail-fact">
      <div className="detail-section">
        <div className="detail-section-label">FACT</div>
        <p className="detail-fact-text">{fact.fact}</p>
      </div>
      {fact.summary && (
        <div className="detail-section">
          <div className="detail-section-label">SUMMARY</div>
          <p className="detail-fact-sub">{fact.summary}</p>
        </div>
      )}
      {fact.tags.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-label">TAGS</div>
          <div className="detail-tag-row">
            {fact.tags.map((tag) => (
              <span key={tag} className="release-chip">{tag}</span>
            ))}
          </div>
        </div>
      )}
      <div className="detail-section">
        <div className="detail-section-label">METADATA</div>
        <div className="detail-meta-grid">
          {rows.map((row) => (
            <div key={row.label} className="detail-meta-row">
              <span className="detail-meta-label">{row.label}</span>
              <span className="detail-meta-value">{row.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CommandDetailView({ state }: { state: DashboardState }) {
  const result = state.commandResults.at(-1)
  if (!result) {
    return (
      <div className="detail-empty">
        <div className="detail-empty-title">No command output</div>
        <div className="detail-empty-sub">Run a command from Operations zone.</div>
      </div>
    )
  }

  return (
    <div className="detail-command">
      <div className="detail-section">
        <div className="detail-section-label">COMMAND</div>
        <div className="detail-command-header">
          <span className="detail-command-name">{result.command}</span>
          <span
            className="status-badge"
            style={{ color: result.success ? 'var(--c-ok)' : 'var(--c-critical)' }}
          >
            {result.success ? 'OK' : 'FAIL'}
          </span>
          {result.durationMs !== undefined && (
            <span className="detail-command-dur">{result.durationMs}ms</span>
          )}
        </div>
      </div>
      <div className="detail-section">
        <div className="detail-section-label">OUTPUT</div>
        <pre className="detail-output">{result.output}</pre>
      </div>
    </div>
  )
}

function NewFactView({ agent, onClose }: { agent: string; onClose: () => void }) {
  const [category, setCategory] = useState<'semantic' | 'episodic' | 'procedural' | 'preference'>('semantic')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'active' | 'stale'>('active')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          fact: content.trim(),
          category,
          status,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg('Fact saved successfully.')
        setContent('')
        setTags('')
        setTimeout(onClose, 1200)
      } else {
        setMsg(typeof data.error === 'string' ? data.error : 'Save failed.')
      }
    } catch {
      setMsg('Network error — could not save fact.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="detail-new-fact">
      <div className="detail-section">
        <div className="detail-section-label">NEW FACT</div>
        <textarea
          className="detail-textarea"
          placeholder="Enter fact content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </div>
      <div className="detail-section">
        <div className="detail-section-label">CATEGORY</div>
        <select
          className="nav-input"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
        >
          <option value="semantic">semantic</option>
          <option value="episodic">episodic</option>
          <option value="procedural">procedural</option>
          <option value="preference">preference</option>
        </select>
      </div>
      <div className="detail-section">
        <div className="detail-section-label">STATUS</div>
        <select
          className="nav-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="active">active</option>
          <option value="stale">stale</option>
        </select>
      </div>
      <div className="detail-section">
        <div className="detail-section-label">TAGS (comma-separated)</div>
        <input
          className="nav-input"
          placeholder="tag1, tag2, ..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      {msg && (
        <div className="detail-msg">{msg}</div>
      )}
      <div className="detail-actions">
        <button className="cmd-btn accent" onClick={handleSave} disabled={saving || !content.trim()}>
          {saving ? <span className="spinner" /> : 'Save Fact'}
        </button>
        <button className="cmd-btn" onClick={onClose} disabled={saving}>Cancel</button>
      </div>
    </div>
  )
}

export function DetailPanel({ state, mode, open, onClose }: DetailPanelProps) {
  const titles: Record<NonNullable<ZoneDetailPanel['mode']>, string> = {
    'fact':     'Fact Inspector',
    'command':  'Command Output',
    'new-fact': 'New Fact',
  }

  return (
    <aside className={`detail-panel${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="detail-panel-header">
        <span className="detail-panel-title">{mode ? titles[mode] : ''}</span>
        <button className="detail-panel-close" onClick={onClose} aria-label="Close panel">✕</button>
      </div>
      <div className="detail-panel-body">
        {mode === 'fact'     && <FactDetailView state={state} />}
        {mode === 'command'  && <CommandDetailView state={state} />}
        {mode === 'new-fact' && <NewFactView agent={state.agent} onClose={onClose} />}
      </div>
    </aside>
  )
}
