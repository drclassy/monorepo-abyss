// Architected and built by Claudesy.

"use client";

import { useState } from "react";
import type { DashboardState } from "@/lib/types";

interface AgentManagementProps {
  state: DashboardState;
  onAgentChange: (agent: string) => void;
  onAddAgent: (name: string) => void;
  onRemoveAgent: (name: string) => void;
  onStartAgent: () => void;
}

export function AgentManagement({
  state,
  onAgentChange,
  onAddAgent,
  onRemoveAgent,
  onStartAgent,
}: AgentManagementProps) {
  const [newAgent, setNewAgent] = useState("");

  function handleAddAgent() {
    const name = newAgent.trim();
    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) return;
    onAddAgent(name);
    setNewAgent("");
  }

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-header">
        <div>
          <div className="workspace-panel-title">AGENT OPERATIONS</div>
          <div className="workspace-panel-sub">
            Kelola roster agent dan boot workspace aktif dari panel tengah.
          </div>
        </div>
      </div>
      <div className="workspace-panel-body" style={{ paddingBottom: 26 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="sidebar-stat-stack" style={{ padding: 0 }}>
            <div className="sidebar-stat-tile">
              <span className="sidebar-stat-label">AGENTS</span>
              <span className="sidebar-stat-val">{state.agents.length}</span>
              <span className="sidebar-stat-unit">available</span>
            </div>
            <div className="sidebar-stat-tile">
              <span className="sidebar-stat-label">MEMORY</span>
              <span className="sidebar-stat-val">
                {state.engineState?.factCount ?? "—"}
              </span>
              <span className="sidebar-stat-unit">facts</span>
            </div>
            <div className="sidebar-stat-tile">
              <span className="sidebar-stat-label">SESSIONS</span>
              <span className="sidebar-stat-val">
                {state.engineState?.sessionCount ?? "—"}
              </span>
              <span className="sidebar-stat-unit">active</span>
            </div>
          </div>

          <input
            className="nav-input"
            value={state.baseDir}
            readOnly
            title="Server-managed base directory"
            placeholder="Base directory"
          />

          <div
            className="agent-list"
            style={{
              padding: 0,
              overflow: "auto",
              flex: "unset",
              minHeight: 180,
              maxHeight: 320,
            }}
          >
            {state.agents.map((agent) => {
              const isActive = agent === state.agent;
              return (
                <div
                  key={agent}
                  className={`agent-list-item${isActive ? " active" : ""}`}
                  onClick={() => onAgentChange(agent)}
                >
                  <span className={`agent-dot${isActive ? " active" : ""}`} />
                  <div className="agent-list-info">
                    <span className="agent-list-name">{agent}</span>
                    <span className="agent-list-status">
                      {isActive
                        ? "active in this workspace"
                        : "available locally"}
                    </span>
                  </div>
                  {!isActive && (
                    <button
                      className="agent-remove-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveAgent(agent);
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="nav-input"
              style={{ flex: 1 }}
              placeholder="new-agent-name"
              value={newAgent}
              onChange={(event) => setNewAgent(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleAddAgent()}
            />
            <button className="cmd-btn accent" onClick={handleAddAgent}>
              +
            </button>
          </div>

          <button
            className="start-agent-btn"
            onClick={onStartAgent}
            disabled={state.loading}
          >
            Start Agent
          </button>
        </div>
      </div>
    </div>
  );
}
