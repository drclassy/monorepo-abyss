import os from "os";

import path from "path";

export const PYTHON = process.env.CLAUDESY_PYTHON ?? "python";

export const DEFAULT_ENGINE_CWD = process.cwd();

export const ENGINE = process.env.CLAUDESY_ENGINE_PATH ?? "";

export const ENGINE_CWD = process.env.CLAUDESY_ENGINE_CWD ?? DEFAULT_ENGINE_CWD;

export const SERVER_BASE_DIR =
  process.env.CLAUDESY_BASE_DIR ??
  path.join(/*turbopackIgnore: true*/ os.homedir(), ".claudesy");

export const DEFAULT_DAEMON_INTERVAL_SECONDS = 300;

export const MAX_HEALTH_HISTORY = 25;

/**
 * Gets the server base directory for data storage.
 *
 * @returns The absolute path to the base directory
 * @since 1.0.0
 */
export function getServerBaseDir(): string {
  return SERVER_BASE_DIR;
}

export function getEngineInvocation(): string[] {
  if (ENGINE) {
    return [ENGINE];
  }

  return ["-m", "claudesy_memory.cli"];
}
