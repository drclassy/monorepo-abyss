'use client'

// Architected and built by Claudesy.

export function CurationZone() {
  const panels = [
    {
      id: 'approval',
      title: 'Approval Queue',
      icon: '✓',
      count: '0 pending',
      desc: 'No facts pending approval',
      action: '+ New Rule',
      actionDisabled: true,
    },
    {
      id: 'dedup',
      title: 'Merge / Dedup',
      icon: '⊞',
      count: 'Scan for duplicates',
      desc: 'No duplicates detected',
      action: 'Run Scan',
      actionDisabled: true,
    },
    {
      id: 'retention',
      title: 'Retention Policy',
      icon: '⏱',
      count: 'Default: keep all',
      desc: 'No decay rules configured',
      action: 'Edit Policy',
      actionDisabled: true,
    },
  ]

  const upcoming = [
    { label: 'Provenance / Audit Trail',    desc: 'Per-fact edit history and source lineage' },
    { label: 'Conflict Resolution',          desc: 'Detect and merge contradictory facts' },
    { label: 'Bulk Import / Export',         desc: 'CSV and JSON batch operations' },
    { label: 'Memory Eval / Benchmarks',     desc: 'Retrieval quality scoring and regression tests' },
    { label: 'Semantic Search Console',      desc: 'Embedding-based advanced query operators' },
  ]

  return (
    <div className="zone-page">
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">Curation & Governance</h1>
          <p className="zone-hero-sub">
            Memory quality controls · approval · dedup · retention
          </p>
        </div>
        <span className="release-chip" style={{ alignSelf: 'center' }}>Scaffolding</span>
      </div>

      {/* Main curation panels */}
      <div className="curation-grid">
        {panels.map((p) => (
          <section key={p.id} className="zone-card curation-panel">
            <div className="zone-card-header">
              <span className="curation-icon">{p.icon}</span>
              <span className="zone-card-title">{p.title}</span>
            </div>
            <div className="zone-card-body">
              <div className="curation-count">{p.count}</div>
              <p className="curation-desc">{p.desc}</p>
            </div>
            <div className="zone-card-footer">
              <button className="cmd-btn" disabled={p.actionDisabled}>
                {p.action}
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Upcoming features */}
      <section className="zone-card" style={{ marginTop: 16 }}>
        <div className="zone-card-header">
          <span className="zone-card-title">Upcoming Features</span>
        </div>
        <div className="zone-card-body">
          {upcoming.map((item) => (
            <div key={item.label} className="release-data-row">
              <span className="release-data-label">{item.label}</span>
              <span className="release-data-value" style={{ color: 'var(--text-muted)' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
