// Architected and built by Claudesy.

"use client";

import { useMemo, useState } from "react";
import type { ActivityEvent } from "@/lib/types";

type ActivityFilter = "all" | "memory" | "skill" | "health";

const FILTER_CATS: Record<ActivityFilter, string[]> = {
  all: [],
  memory: ["cmd", "agent", "doc"],
  skill: ["search", "inspect"],
  health: ["init", "health", "daemon"],
};

const CAT_LABEL: Record<string, string> = {
  init: "System",
  cmd: "Command",
  doc: "Document",
  agent: "Agent",
  search: "Search",
  inspect: "Inspect",
  health: "Health",
  daemon: "Daemon",
};

const LEVEL_CLS: Record<string, string> = {
  info: "ev-info",
  warn: "ev-warn",
  error: "ev-error",
  success: "ev-success",
};

function groupByCat(events: ActivityEvent[]) {
  const map = new Map<string, ActivityEvent[]>();
  for (const ev of events) {
    const arr = map.get(ev.category) ?? [];
    arr.push(ev);
    map.set(ev.category, arr);
  }
  return [...map.entries()].map(([cat, evs]) => ({ cat, evs }));
}

interface ActivityFeedProps {
  activity: ActivityEvent[];
  lastEvent?: ActivityEvent;
}

export function ActivityFeed({ activity, lastEvent }: ActivityFeedProps) {
  const [actFilter, setActFilter] = useState<ActivityFilter>("all");

  const filteredEvents = useMemo(() => {
    const all = [...activity].reverse();
    const cats = FILTER_CATS[actFilter];
    return cats.length ? all.filter((e) => cats.includes(e.category)) : all;
  }, [activity, actFilter]);

  const groups = useMemo(() => groupByCat(filteredEvents), [filteredEvents]);

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-header">
        <div>
          <div className="workspace-panel-title">ACTIVITY FEED</div>
          <div className="workspace-panel-sub">
            {lastEvent
              ? `Last event at ${lastEvent.timestamp}`
              : "No activity yet"}
          </div>
        </div>
        <div className="activity-feed-tabs">
          {(["all", "memory", "skill", "health"] as ActivityFilter[]).map(
            (f) => (
              <button
                key={f}
                className={`activity-feed-tab${actFilter === f ? " active" : ""}`}
                onClick={() => setActFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "memory"
                    ? "Memory"
                    : f === "skill"
                      ? "Skill"
                      : "Health"}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="workspace-panel-body">
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No activity yet</div>
            <div className="empty-state-sub">
              Run a command from the control deck to see events.
            </div>
          </div>
        ) : (
          groups.map(({ cat, evs }) => (
            <div key={cat} className="activity-group">
              <div className="activity-group-header">
                <span className="activity-group-name">
                  {CAT_LABEL[cat] ?? cat}
                </span>
                <span className="activity-event-count">
                  {evs.length} event{evs.length !== 1 ? "s" : ""}
                </span>
              </div>
              {evs.map((ev) => (
                <div key={ev.id} className="activity-event-row">
                  <div className="activity-event-meta">
                    <span
                      className={`ev-badge ${LEVEL_CLS[ev.level] ?? "ev-info"}`}
                    >
                      {ev.level}
                    </span>
                    <span className="activity-event-scope">{ev.category}</span>
                    <span className="activity-event-time">{ev.timestamp}</span>
                  </div>
                  <div className="activity-event-msg">{ev.message}</div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
