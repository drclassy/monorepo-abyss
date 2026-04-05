'use client'

// Architected and built by Claudesy.

import { useEffect, useState } from 'react'
import { useDashboardState } from '../hooks/useDashboardState'
import { TopBar } from './TopBar'
import { ZoneNav } from './sidebar'
import { DetailPanel } from './DetailPanel'
import { OverviewZone } from './zones/OverviewZone'
import { MemoryZone } from './zones/MemoryZone'
import { CurationZone } from './zones/CurationZone'
import { GridBackground } from './ui/grid-background'

// ── Command palette ──────────────────────────────────────────
interface PaletteProps {
  onClose: () => void
  onCommand: (cmd: string) => void
}

function CommandPalette({ onClose, onCommand }: PaletteProps) {
  const items = [
    { id: 'health', label: 'Run Health Check', key: 'H' },
    { id: 'extract', label: 'Extract Facts from Latest Session', key: 'E' },
    { id: 'consolidate', label: 'Consolidate Memory', key: 'C' },
    { id: 'boot', label: 'Render Boot Context', key: 'B' },
    { id: 'run', label: 'Full Run (Extract + Consolidate)', key: 'R' },
  ]
  const [selected, setSelected] = useState(0)

  function exec(id: string) {
    onCommand(id)
    onClose()
  }

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-modal" onClick={(e) => e.stopPropagation()}>
        <input
          className="palette-input"
          placeholder="Type a command..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') setSelected((v) => Math.min(v + 1, items.length - 1))
            if (e.key === 'ArrowUp') setSelected((v) => Math.max(v - 1, 0))
            if (e.key === 'Enter') exec(items[selected].id)
          }}
        />
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`palette-item${i === selected ? ' selected' : ''}`}
            onClick={() => exec(item.id)}
            onMouseEnter={() => setSelected(i)}
          >
            <span>{item.label}</span>
            <span className="palette-item-key">{item.key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main dashboard ───────────────────────────────────────────
export function Dashboard() {
  const {
    state,
    dispatch,
    loadState,
    runCommand,
    handleSearch,
    handleSearchPage,
    handleInspectFact,
    handleStartDaemon,
    handleStopDaemon,
    handleDocSave,
    handleAddAgent,
    handleRemoveAgent,
    handleAgentChange,
    handleSetZone,
    handleOpenDetailPanel,
    handleCloseDetailPanel,
  } = useDashboardState()

  const [paletteOpen, setPaletteOpen] = useState(false)

  // Keyboard shortcut for palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell">
      <TopBar
        agent={state.agent}
        agents={state.agents}
        loading={state.loading}
        daemonRunning={state.daemonRunning}
        factCount={state.engineState?.factCount ?? 0}
        onAgentChange={handleAgentChange}
        onSync={() => loadState(state.agent)}
      />

      <div className="app-body">
        <ZoneNav
          activeZone={state.activeZone}
          onZoneChange={handleSetZone}
          daemonRunning={state.daemonRunning}
        />

        <main className="zone-content">
          <GridBackground cellSize={80} crossArm={8} lineOpacity={0.045} crossOpacity={0.2}>
          {state.activeZone === 'overview' && (
            <OverviewZone
              state={state}
              onRunCommand={runCommand}
              onOpenCommandDetail={() => handleOpenDetailPanel('command')}
              onStartDaemon={handleStartDaemon}
              onStopDaemon={handleStopDaemon}
              onPaletteOpen={() => setPaletteOpen(true)}
              onDocSave={handleDocSave}
              onActivity={(ev) => dispatch({ type: 'ADD_ACTIVITY', event: ev })}
              onAgentChange={handleAgentChange}
              onAddAgent={handleAddAgent}
              onRemoveAgent={handleRemoveAgent}
              onStartAgent={() => {
                void runCommand('boot')
                handleOpenDetailPanel('command')
              }}
            />
          )}

          {state.activeZone === 'memory' && (
            <MemoryZone
              state={state}
              onSearch={handleSearch}
              onSearchPageChange={handleSearchPage}
              onInspectFact={(id) => {
                void handleInspectFact(id)
                handleOpenDetailPanel('fact')
              }}
              onNewFact={() => handleOpenDetailPanel('new-fact')}
            />
          )}

          {state.activeZone === 'curation' && <CurationZone />}
          </GridBackground>
        </main>

        <DetailPanel
          state={state}
          mode={state.detailPanel.mode}
          open={state.detailPanel.open}
          onClose={handleCloseDetailPanel}
          onRunCommand={runCommand}
        />
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onCommand={(cmd) => {
            void runCommand(cmd)
            handleOpenDetailPanel('command')
          }}
        />
      )}
    </div>
  )
}
