'use client'

// Architected and built by Claudesy.

import { useState } from 'react'

interface DocumentsZoneProps {
  agent: string
  loading: boolean
  onDocSave: (content: string, docName: string) => Promise<void>
  onActivity: (ev: { id: string; level: 'info' | 'warn' | 'error' | 'success'; category: string; message: string; timestamp: string }) => void
}

const DOCS = [
  { id: 'SOUL.md',   label: 'SOUL',   caption: 'Agent identity and boot context' },
  { id: 'MEMORY.md', label: 'MEMORY', caption: 'Persistent memory recall document' },
  { id: 'SKILLS.md', label: 'SKILLS', caption: 'Skill matrix and capabilities' },
] as const

function mkId() {
  return Math.random().toString(36).slice(2)
}

export function DocumentsZone({ agent, loading, onDocSave, onActivity }: DocumentsZoneProps) {
  const [activeDoc, setActiveDoc]       = useState<string | null>(null)
  const [docContent, setDocContent]     = useState('')
  const [editValue, setEditValue]       = useState('')
  const [docLoading, setDocLoading]     = useState(false)
  const [saveMsg, setSaveMsg]           = useState('')

  async function loadDoc(doc: string) {
    setDocLoading(true)
    setSaveMsg('')
    try {
      const res = await fetch(
        `/api/document?agent=${encodeURIComponent(agent)}&doc=${encodeURIComponent(doc)}`
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

  async function handleSave() {
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

  function handleClose() {
    setActiveDoc(null)
    setDocContent('')
    setEditValue('')
    setSaveMsg('')
  }

  const hasChanges = editValue !== docContent

  return (
    <div className="zone-page">
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">Documents</h1>
          <p className="zone-hero-sub">SOUL · MEMORY · SKILLS — engine memory documents</p>
        </div>
        {activeDoc && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasChanges && (
              <button className="cmd-btn accent" onClick={handleSave} disabled={docLoading || loading}>
                {docLoading ? <span className="spinner" /> : 'Save'}
              </button>
            )}
            <button className="cmd-btn" onClick={handleClose}>Close</button>
          </div>
        )}
      </div>

      {!activeDoc ? (
        <div className="docs-picker-grid">
          {DOCS.map((doc) => (
            <button
              key={doc.id}
              className="docs-picker-card"
              onClick={() => loadDoc(doc.id)}
              disabled={docLoading || loading}
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
            {saveMsg && <span className="detail-msg">{saveMsg}</span>}
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
  )
}
