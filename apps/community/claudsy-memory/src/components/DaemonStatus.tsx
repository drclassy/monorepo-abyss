// Architected and built by Claudesy.

"use client";

import { useState } from "react";
import type { DaemonStatus as DaemonStatusType } from "@/lib/types";

interface DaemonStatusProps {
  daemon: DaemonStatusType;
  loading: boolean;
  onStartDaemon: (
    mode: DaemonStatusType["mode"],
    intervalSeconds: number,
  ) => void;
  onStopDaemon: () => void;
}

export function DaemonStatus({
  daemon,
  loading,
  onStartDaemon,
  onStopDaemon,
}: DaemonStatusProps) {
  const [daemonMode, setDaemonMode] = useState<DaemonStatusType["mode"]>(
    daemon.mode,
  );
  const [daemonInterval, setDaemonInterval] = useState(
    String(daemon.intervalSeconds || 300),
  );

  const daemonRunningForAgent = daemon.running;
  const daemonBusy = daemon.running;

  return (
    <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
      <div className="workspace-panel-sub" style={{ marginTop: 0 }}>
        Daemon
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          minHeight: 32,
        }}
      >
        {daemonRunningForAgent
          ? `Running (${daemon.mode}${daemon.pid ? ` • pid ${daemon.pid}` : ""})`
          : daemonBusy
            ? `Busy with another agent`
            : "No active daemon"}
      </div>
      <select
        className="nav-input"
        value={daemonMode}
        onChange={(event) =>
          setDaemonMode(event.target.value as DaemonStatusType["mode"])
        }
        disabled={loading || daemonBusy}
      >
        <option value="full">full</option>
        <option value="consolidate">consolidate</option>
      </select>
      <input
        className="nav-input"
        type="number"
        min={1}
        max={86400}
        value={daemonInterval}
        onChange={(event) => setDaemonInterval(event.target.value)}
        disabled={loading || daemonBusy}
        placeholder="Interval (seconds)"
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="cmd-btn accent"
          disabled={loading || daemonBusy}
          onClick={() =>
            onStartDaemon(daemonMode, Number(daemonInterval) || 300)
          }
        >
          Start
        </button>
        <button
          className="cmd-btn"
          disabled={loading || !daemon.running}
          onClick={onStopDaemon}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
