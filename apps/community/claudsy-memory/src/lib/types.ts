// Claudesy Memory Engine — TypeScript types

export interface EngineState {
  agent: string;
  baseDir: string;
  factCount: number;
  sessionCount: number;
  categories: Record<string, number>;
  ollamaReachable: boolean;
  daemonRunning: boolean;
  daemonPid: number | null;
  lastRun: string | null;
}

export interface DaemonStatus {
  running: boolean;
  agent: string | null;
  pid: number | null;
  mode: "full" | "consolidate";
  intervalSeconds: number;
  startedAt: string | null;
  stopRequested: boolean;
  lastExitCode: number | null;
  lastError: string | null;
}

export interface HealthSummary {
  agent: string;
  status: "healthy" | "warning" | "critical";
  checkedAt: string;
  factCount: number;
  sessionCount: number;
  archiveCount: number;
  ollamaReachable: boolean;
  daemonRunning: boolean;
  daemonPid: number | null;
  anomalies: string[];
}

export interface HealthHistoryEntry {
  id: string;
  agent: string;
  kind: "baseline" | "status-change" | "anomaly" | "recovery";
  status: "healthy" | "warning" | "critical";
  checkedAt: string;
  message: string;
  anomalies: string[];
  factCount: number;
  sessionCount: number;
  archiveCount: number;
  ollamaReachable: boolean;
  daemonRunning: boolean;
}

export interface FactRecord {
  id: string;
  fact: string;
  importance: number;
  category: "semantic" | "episodic" | "procedural" | "preference";
  operation: "ADD" | "UPDATE" | "DELETE" | "NOOP";
  tags: string[];
  related_to?: string | null;
  summary?: string | null;
  session?: string | null;
  name?: string | null;
  steps?: string[] | null;
  source: string;
  created: string;
  last_accessed: string;
  access_count: number;
  updated_at?: string | null;
  status: "active" | "stale" | "deleted" | "superseded";
}

export interface SearchResult extends FactRecord {
  score?: number;
}

export interface SearchFilters {
  mode: "search" | "recent";
  query: string;
  category: string;
  status: string;
  page: number;
  pageSize: number;
}

export interface SearchMeta {
  mode: "search" | "recent";
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  category: string;
  status: string;
  query: string;
}

export interface ActivityEvent {
  id: string;
  level: "info" | "warn" | "error" | "success";
  category: string;
  message: string;
  timestamp: string;
  detail?: Record<string, unknown>;
}

export interface CommandResult {
  command: string;
  output: string;
  success: boolean;
  timestamp: string;
  durationMs?: number;
}

export interface DashboardState {
  agent: string;
  baseDir: string;
  agents: string[];
  engineState: EngineState | null;
  daemon: DaemonStatus;
  healthSummary: HealthSummary | null;
  healthHistory: HealthHistoryEntry[];
  activity: ActivityEvent[];
  commandResults: CommandResult[];
  searchResults: SearchResult[];
  searchMeta: SearchMeta;
  selectedFact: FactRecord | null;
  daemonRunning: boolean;
  loading: boolean;
  activeTab: "activity" | "output" | "search" | "health" | "inspect";
  searchQuery: string;
  healthOutput: string;
  activeZone: ActiveZone;
  detailPanel: ZoneDetailPanel;
}

export type WorkspaceTab =
  | "activity"
  | "output"
  | "search"
  | "health"
  | "inspect";

export type ActiveZone =
  | "overview"
  | "memory"
  | "curation";

export interface ZoneDetailPanel {
  open: boolean;
  mode: "fact" | "command" | "new-fact" | null;
}

export interface PaletteCommand {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  action: () => void;
}
