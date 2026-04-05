import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { DaemonStatus } from "./types";
import {
  PYTHON,
  ENGINE_CWD,
  SERVER_BASE_DIR,
  DEFAULT_DAEMON_INTERVAL_SECONDS,
  getEngineInvocation,
} from "./config";

const DEFAULT_DAEMON_STATUS: DaemonStatus = {
  running: false,
  agent: null,
  pid: null,
  mode: "full",
  intervalSeconds: DEFAULT_DAEMON_INTERVAL_SECONDS,
  startedAt: null,
  stopRequested: false,
  lastExitCode: null,
  lastError: null,
};

const DAEMON_STATUS_PATH = path.join(
  /*turbopackIgnore: true*/ SERVER_BASE_DIR,
  "daemon-status.json",
);

let daemonProcess: ChildProcessWithoutNullStreams | null = null;
let daemonStatus: DaemonStatus = { ...DEFAULT_DAEMON_STATUS };

function updateDaemonStatus(patch: Partial<DaemonStatus>): void {
  daemonStatus = { ...daemonStatus, ...patch };
}

function ensureDaemonStatusDir(): void {
  mkdirSync(SERVER_BASE_DIR, { recursive: true });
}

function normalizeStoppedStatus(
  patch: Partial<DaemonStatus> = {},
): DaemonStatus {
  return {
    ...DEFAULT_DAEMON_STATUS,
    ...daemonStatus,
    ...patch,
    running: false,
    pid: null,
    startedAt: null,
    stopRequested: false,
  };
}

function persistDaemonStatus(status: DaemonStatus): void {
  ensureDaemonStatusDir();
  writeFileSync(
    DAEMON_STATUS_PATH,
    JSON.stringify(status, null, 2),
    "utf-8",
  );
  daemonStatus = { ...status };
}

function readPersistedDaemonStatus(): DaemonStatus | null {
  try {
    const raw = readFileSync(DAEMON_STATUS_PATH, "utf-8");
    return {
      ...DEFAULT_DAEMON_STATUS,
      ...(JSON.parse(raw) as Partial<DaemonStatus>),
    };
  } catch {
    return null;
  }
}

function isProcessRunning(pid: number | null): boolean {
  if (!pid) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function terminateProcess(pid: number, force = false): boolean {
  if (process.platform === "win32") {
    const args = force
      ? ["/PID", String(pid), "/T", "/F"]
      : ["/PID", String(pid), "/T"];
    const result = spawnSync("taskkill", args, { stdio: "ignore" });
    return result.status === 0;
  }

  try {
    process.kill(pid, force ? "SIGKILL" : "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

function loadResolvedDaemonStatus(): DaemonStatus {
  const persisted = readPersistedDaemonStatus();

  if (!persisted) {
    return { ...daemonStatus };
  }

  if (!persisted.running || !persisted.pid) {
    daemonStatus = { ...DEFAULT_DAEMON_STATUS, ...persisted };
    return { ...daemonStatus };
  }

  if (isProcessRunning(persisted.pid)) {
    daemonStatus = { ...DEFAULT_DAEMON_STATUS, ...persisted };
    return { ...daemonStatus };
  }

  const stopped = normalizeStoppedStatus({
    ...persisted,
    lastError: persisted.lastError ?? "Daemon process no longer running",
  });
  daemonProcess = null;
  persistDaemonStatus(stopped);
  return stopped;
}

function wireDaemonLifecycle(child: ChildProcessWithoutNullStreams): void {
  let latestStderr = "";

  child.stderr.on("data", (chunk: Buffer) => {
    const message = chunk.toString().trim();
    if (message) {
      latestStderr = message;
    }
  });

  child.on("error", (err: Error) => {
    daemonProcess = null;
    persistDaemonStatus(normalizeStoppedStatus({
      lastError: err.message,
      lastExitCode: 1,
    }));
  });

  child.on("close", (code: number | null) => {
    daemonProcess = null;
    persistDaemonStatus(normalizeStoppedStatus({
      lastExitCode: code ?? 0,
      lastError:
        (code ?? 0) === 0 ? null : latestStderr || daemonStatus.lastError,
    }));
  });
}

function agentArgs(agent: string): string[] {
  return ["--agent", agent, "--base-dir", SERVER_BASE_DIR];
}

/**
 * Gets the current daemon status.
 * @returns The daemon status
 */
export function getDaemonStatus(): DaemonStatus {
  return loadResolvedDaemonStatus();
}

/**
 * Starts the daemon for the given agent.
 * @param agent - The agent name
 * @param mode - The daemon mode
 * @param intervalSeconds - The interval in seconds
 * @returns The result of starting the daemon
 */
export async function startDaemon(
  agent: string,
  mode: DaemonStatus["mode"],
  intervalSeconds: number,
): Promise<{ ok: boolean; alreadyRunning?: boolean; daemon: DaemonStatus }> {
  const current = getDaemonStatus();

  if (current.running) {
    if (current.agent === agent) {
      return { ok: true, alreadyRunning: true, daemon: current };
    }
    throw new Error(`Daemon already running for agent '${current.agent}'`);
  }

  const child = spawn(
    PYTHON,
    [
      ...getEngineInvocation(),
      ...agentArgs(agent),
      "daemon",
      "--interval-seconds",
      String(intervalSeconds),
      "--mode",
      mode,
    ],
    {
      shell: false,
      cwd: ENGINE_CWD,
      detached: true,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );

  daemonProcess = child;
  child.unref();
  persistDaemonStatus({
    running: true,
    agent,
    pid: child.pid ?? null,
    mode,
    intervalSeconds,
    startedAt: new Date().toISOString(),
    stopRequested: false,
    lastExitCode: null,
    lastError: null,
  });
  wireDaemonLifecycle(child);

  return { ok: true, daemon: getDaemonStatus() };
}

/**
 * Stops the daemon.
 * @returns The result of stopping the daemon
 */
export async function stopDaemon(): Promise<{
  ok: boolean;
  stopped: boolean;
  daemon: DaemonStatus;
}> {
  const current = getDaemonStatus();

  if (!current.running || !current.pid) {
    const stopped = normalizeStoppedStatus(current);
    persistDaemonStatus(stopped);
    return { ok: true, stopped: false, daemon: stopped };
  }

  const daemonPid = current.pid;

  updateDaemonStatus({ stopRequested: true });
  persistDaemonStatus({
    ...current,
    stopRequested: true,
  });

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    daemonProcess?.once("close", () => finish());
    terminateProcess(daemonPid);
    setTimeout(() => {
      if (isProcessRunning(daemonPid)) {
        if (!terminateProcess(daemonPid, true)) {
          finish();
          return;
        }
      }
      setTimeout(() => finish(), 500);
    }, 3000);
  });

  daemonProcess = null;
  const stopped = normalizeStoppedStatus({
    ...current,
    lastExitCode: 0,
    lastError: null,
  });
  persistDaemonStatus(stopped);

  return { ok: true, stopped: true, daemon: stopped };
}
