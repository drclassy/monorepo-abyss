import "server-only";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import type {
  DaemonStatus,
  EngineState,
  FactRecord,
  HealthHistoryEntry,
  HealthSummary,
  SearchResult,
} from "./types";
import {
  PYTHON,
  ENGINE_CWD,
  SERVER_BASE_DIR,
  MAX_HEALTH_HISTORY,
  getServerBaseDir as resolveServerBaseDir,
  getEngineInvocation,
} from "./config";
import {
  validateAgentName,
  validateDocumentName,
  validateFactId,
  validateDaemonMode,
  validateIntervalSeconds,
} from "./validation";
import {
  getDaemonStatus as getDaemonStatusInternal,
  startDaemon as startDaemonInternal,
  stopDaemon as stopDaemonInternal,
} from "./daemon";
const healthHistoryByAgent = new Map<string, HealthHistoryEntry[]>();
const latestHealthSummaryByAgent = new Map<string, HealthSummary>();

interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
}

interface HealthPayload {
  agent?: string;
  facts?: Record<string, number>;
  sessions?: number;
  archives?: number;
  ollama_reachable?: boolean;
  daemon_running?: boolean;
  daemon_pid?: number | null;
  last_run?: string | null;
}

interface HealthCheckResult {
  code: number;
  raw: string;
  parsed: HealthPayload | null;
  engineState: EngineState;
  healthSummary: HealthSummary;
  healthHistory: HealthHistoryEntry[];
}

export function getServerBaseDir(): string {
  return resolveServerBaseDir();
}

export {
  validateAgentName,
  validateDocumentName,
  validateFactId,
  validateDaemonMode,
  validateIntervalSeconds,
};

export function getDaemonStatus(): DaemonStatus {
  return getDaemonStatusInternal();
}

function mkHealthId(): string {
  return Math.random().toString(36).slice(2);
}

function maxHealthStatus(
  a: HealthSummary["status"],
  b: HealthSummary["status"],
): HealthSummary["status"] {
  const rank = { healthy: 0, warning: 1, critical: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function buildEngineStateFromHealthPayload(
  agent: string,
  parsed: HealthPayload | null,
  daemon: DaemonStatus,
): EngineState {
  const daemonMatchesAgent = daemon.running && daemon.agent === agent;
  const categories = parsed?.facts ?? {};
  const factCount = Object.values(categories).reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    agent: parsed?.agent ?? agent,
    baseDir: SERVER_BASE_DIR,
    factCount,
    sessionCount: parsed?.sessions ?? 0,
    categories,
    ollamaReachable: parsed?.ollama_reachable ?? false,
    daemonRunning: daemonMatchesAgent,
    daemonPid: daemonMatchesAgent ? daemon.pid : null,
    lastRun: parsed?.last_run ?? null,
  };
}

function buildHealthSummary(
  agent: string,
  parsed: HealthPayload | null,
  daemon: DaemonStatus,
): HealthSummary {
  const engineState = buildEngineStateFromHealthPayload(agent, parsed, daemon);
  const anomalies: string[] = [];
  let status: HealthSummary["status"] = "healthy";

  if (!parsed) {
    anomalies.push("Health payload unreadable");
    status = "critical";
  } else {
    if (!parsed.ollama_reachable) {
      anomalies.push("Ollama unreachable");
      status = maxHealthStatus(status, "warning");
    }
    if ((parsed.sessions ?? 0) > 0 && engineState.factCount === 0) {
      anomalies.push("Sessions exist but no facts are indexed");
      status = maxHealthStatus(status, "warning");
    }
  }

  if (daemon.lastError && daemon.agent === agent) {
    anomalies.push(`Daemon error: ${daemon.lastError}`);
    status = maxHealthStatus(status, "warning");
  }

  return {
    agent,
    status,
    checkedAt: new Date().toISOString(),
    factCount: engineState.factCount,
    sessionCount: engineState.sessionCount,
    archiveCount: parsed?.archives ?? 0,
    ollamaReachable: engineState.ollamaReachable,
    daemonRunning: engineState.daemonRunning,
    daemonPid: engineState.daemonPid,
    anomalies,
  };
}

function appendHealthHistory(agent: string, entry: HealthHistoryEntry): void {
  const current = healthHistoryByAgent.get(agent) ?? [];
  current.push(entry);
  healthHistoryByAgent.set(agent, current.slice(-MAX_HEALTH_HISTORY));
}

function recordHealthSummary(agent: string, summary: HealthSummary): void {
  const previous = latestHealthSummaryByAgent.get(agent);
  latestHealthSummaryByAgent.set(agent, summary);

  if (!previous) {
    appendHealthHistory(agent, {
      id: mkHealthId(),
      agent,
      kind: "baseline",
      status: summary.status,
      checkedAt: summary.checkedAt,
      message: `Health baseline recorded as ${summary.status}`,
      anomalies: summary.anomalies,
      factCount: summary.factCount,
      sessionCount: summary.sessionCount,
      archiveCount: summary.archiveCount,
      ollamaReachable: summary.ollamaReachable,
      daemonRunning: summary.daemonRunning,
    });
    return;
  }

  const previousAnomalies = previous.anomalies.join("|");
  const nextAnomalies = summary.anomalies.join("|");

  if (summary.status !== previous.status) {
    appendHealthHistory(agent, {
      id: mkHealthId(),
      agent,
      kind: summary.status === "healthy" ? "recovery" : "status-change",
      status: summary.status,
      checkedAt: summary.checkedAt,
      message:
        summary.status === "healthy"
          ? `Health recovered from ${previous.status} to healthy`
          : `Health status changed from ${previous.status} to ${summary.status}`,
      anomalies: summary.anomalies,
      factCount: summary.factCount,
      sessionCount: summary.sessionCount,
      archiveCount: summary.archiveCount,
      ollamaReachable: summary.ollamaReachable,
      daemonRunning: summary.daemonRunning,
    });
    return;
  }

  if (previousAnomalies !== nextAnomalies) {
    appendHealthHistory(agent, {
      id: mkHealthId(),
      agent,
      kind: summary.anomalies.length > 0 ? "anomaly" : "recovery",
      status: summary.status,
      checkedAt: summary.checkedAt,
      message:
        summary.anomalies.length > 0
          ? `Health anomalies updated: ${summary.anomalies.join("; ")}`
          : "Health anomalies cleared",
      anomalies: summary.anomalies,
      factCount: summary.factCount,
      sessionCount: summary.sessionCount,
      archiveCount: summary.archiveCount,
      ollamaReachable: summary.ollamaReachable,
      daemonRunning: summary.daemonRunning,
    });
  }
}

export function getHealthHistory(agent: string): HealthHistoryEntry[] {
  return [...(healthHistoryByAgent.get(agent) ?? [])].reverse();
}

async function run(args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const proc = spawn(PYTHON, [...getEngineInvocation(), ...args], {
      shell: false,
      cwd: ENGINE_CWD,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    proc.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
    proc.on("error", (err) => {
      stderr += err.message;
      resolve({ stdout, stderr, code: 1 });
    });
  });
}

function agentArgs(agent: string): string[] {
  return ["--agent", agent, "--base-dir", SERVER_BASE_DIR];
}

export async function runCommand(
  agent: string,
  command: string,
  extra: string[] = [],
): Promise<RunResult> {
  return run([...agentArgs(agent), command, ...extra]);
}

export async function getHealth(agent: string): Promise<string> {
  const result = await getHealthState(agent);
  return result.raw;
}

export async function getEngineState(agent: string): Promise<EngineState> {
  const result = await getHealthState(agent);
  return result.engineState;
}

export async function getHealthState(
  agent: string,
): Promise<HealthCheckResult> {
  const { stdout, stderr, code } = await run([...agentArgs(agent), "health"]);
  const daemon = getDaemonStatus();
  const raw = stdout || stderr;
  let parsed: HealthPayload | null = null;
  try {
    parsed = JSON.parse(stdout) as HealthPayload;
  } catch {
    parsed = null;
  }

  const engineState = buildEngineStateFromHealthPayload(agent, parsed, daemon);
  const healthSummary = buildHealthSummary(agent, parsed, daemon);
  recordHealthSummary(agent, healthSummary);

  return {
    code,
    raw,
    parsed,
    engineState,
    healthSummary,
    healthHistory: getHealthHistory(agent),
  };
}

export async function searchFacts(
  agent: string,
  query: string,
  options?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ results: SearchResult[]; raw: string }> {
  const extra = [
    "--limit",
    String(options?.limit ?? 10),
    "--offset",
    String(options?.offset ?? 0),
  ];
  if (options?.category) extra.push("--category", options.category);
  if (options?.status) extra.push("--status", options.status);
  const { stdout } = await run([
    ...agentArgs(agent),
    "search",
    query,
    ...extra,
  ]);
  try {
    const parsed = JSON.parse(stdout);
    const results = Array.isArray(parsed) ? parsed : (parsed.results ?? []);
    return { results: results as SearchResult[], raw: stdout };
  } catch {
    return { results: [], raw: stdout };
  }
}

export async function listRecentFacts(
  agent: string,
  options?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ results: SearchResult[]; raw: string }> {
  const extra = [
    "--limit",
    String(options?.limit ?? 10),
    "--offset",
    String(options?.offset ?? 0),
  ];
  if (options?.category) extra.push("--category", options.category);
  if (options?.status) extra.push("--status", options.status);
  const { stdout } = await run([...agentArgs(agent), "inspect", ...extra]);
  try {
    const parsed = JSON.parse(stdout);
    return {
      results: (Array.isArray(parsed) ? parsed : []) as SearchResult[],
      raw: stdout,
    };
  } catch {
    return { results: [], raw: stdout };
  }
}

export async function inspectFact(
  agent: string,
  factId: string,
): Promise<FactRecord | null> {
  const { stdout } = await run([
    ...agentArgs(agent),
    "inspect",
    "--id",
    factId,
  ]);
  try {
    const parsed = JSON.parse(stdout) as FactRecord | null;
    return parsed ?? null;
  } catch {
    return null;
  }
}

export async function startDaemon(
  agent: string,
  mode: DaemonStatus["mode"],
  intervalSeconds: number,
): Promise<{ ok: boolean; alreadyRunning?: boolean; daemon: DaemonStatus }> {
  return startDaemonInternal(agent, mode, intervalSeconds);
}

export async function stopDaemon(): Promise<{
  ok: boolean;
  stopped: boolean;
  daemon: DaemonStatus;
}> {
  return stopDaemonInternal();
}

export async function readDocument(
  agent: string,
  doc: string,
): Promise<string> {
  const docPath = path.join(
    /*turbopackIgnore: true*/ SERVER_BASE_DIR,
    "agents",
    /*turbopackIgnore: true*/ agent,
    /*turbopackIgnore: true*/ doc,
  );
  try {
    return await readFile(docPath, "utf-8");
  } catch {
    return `# ${doc}\n\n_No content yet._\n`;
  }
}

export async function writeDocument(
  agent: string,
  doc: string,
  content: string,
): Promise<void> {
  const dirPath = path.join(
    /*turbopackIgnore: true*/ SERVER_BASE_DIR,
    "agents",
    /*turbopackIgnore: true*/ agent,
  );
  await mkdir(dirPath, { recursive: true });
  await writeFile(
    path.join(dirPath, /*turbopackIgnore: true*/ doc),
    content,
    "utf-8",
  );
}

export async function listAgents(): Promise<string[]> {
  const agentsDir = path.join(
    /*turbopackIgnore: true*/ SERVER_BASE_DIR,
    "agents",
  );
  try {
    const entries = await readdir(agentsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}
