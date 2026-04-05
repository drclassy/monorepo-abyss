// Architected and built by Claudesy.

"use client";

import type { CommandResult } from "@/lib/types";

interface CommandResultsProps {
  latestResult?: CommandResult;
}

export function CommandResults({ latestResult }: CommandResultsProps) {
  return (
    <div className="workspace-panel">
      <div className="workspace-panel-header">
        <div>
          <div className="workspace-panel-title">COMMAND OUTPUT</div>
          <div className="workspace-panel-sub">
            {latestResult
              ? `${latestResult.command} · ${latestResult.success ? "success" : "failed"}`
              : "No command executed yet"}
          </div>
        </div>
      </div>
      <div className="workspace-panel-body">
        {latestResult ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span className="status-chip">
                <span className="status-chip-label">COMMAND</span>
                <span className="status-chip-value">
                  {latestResult.command}
                </span>
              </span>
              <span className="status-chip">
                <span className="status-chip-label">STATUS</span>
                <span
                  className="status-chip-value"
                  style={{
                    color: latestResult.success
                      ? "var(--c-ok)"
                      : "var(--c-critical)",
                  }}
                >
                  {latestResult.success ? "OK" : "FAIL"}
                </span>
              </span>
              {latestResult.durationMs !== undefined && (
                <span className="status-chip">
                  <span className="status-chip-label">DURATION</span>
                  <span className="status-chip-value">
                    {latestResult.durationMs}ms
                  </span>
                </span>
              )}
            </div>
            <pre className="output-body" style={{ margin: 0 }}>
              {latestResult.output}
            </pre>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <div className="empty-state-title">No command output yet</div>
            <div className="empty-state-sub">
              Run Health, Extract, Consolidate, Boot, or Full Run from the
              control deck.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
