'use client'

// Architected and built by Claudesy.

import type { DashboardState } from '@/lib/types'
import { AgentManagement } from '../AgentManagement'

interface AgentsZoneProps {
  state: DashboardState
  onAgentChange: (agent: string) => void
  onAddAgent: (name: string) => void
  onRemoveAgent: (name: string) => void
  onStartAgent: () => void
}

export function AgentsZone({
  state,
  onAgentChange,
  onAddAgent,
  onRemoveAgent,
  onStartAgent,
}: AgentsZoneProps) {
  return (
    <div className="zone-page">
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">Agent Management</h1>
          <p className="zone-hero-sub">
            {state.agents.length} agent{state.agents.length !== 1 ? 's' : ''} registered · active: {state.agent}
          </p>
        </div>
      </div>

      <div className="zone-single-col">
        <AgentManagement
          state={state}
          onAgentChange={onAgentChange}
          onAddAgent={onAddAgent}
          onRemoveAgent={onRemoveAgent}
          onStartAgent={onStartAgent}
        />
      </div>
    </div>
  )
}
