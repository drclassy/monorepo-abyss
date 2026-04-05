import type { DaemonStatus } from "./types";

const ALLOWED_DOCS = new Set(["SOUL.md", "MEMORY.md", "SKILLS.md"]);

/**
 * Validates an agent name.
 * @param agent - The agent name to validate
 * @returns True if the agent name is valid
 */
export function validateAgentName(agent: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(agent);
}

/**
 * Validates a document name.
 * @param doc - The document name to validate
 * @returns True if the document name is valid
 */
export function validateDocumentName(doc: string): boolean {
  return ALLOWED_DOCS.has(doc);
}

/**
 * Validates a fact ID.
 * @param factId - The fact ID to validate
 * @returns True if the fact ID is valid
 */
export function validateFactId(factId: string): boolean {
  return /^[a-zA-Z0-9._:-]{1,128}$/.test(factId);
}

/**
 * Validates a daemon mode.
 * @param mode - The daemon mode to validate
 * @returns True if the mode is valid
 */
export function validateDaemonMode(mode: string): mode is DaemonStatus["mode"] {
  return mode === "full" || mode === "consolidate";
}

/**
 * Validates interval seconds for daemon.
 * @param intervalSeconds - The interval in seconds
 * @returns True if the interval is valid
 */
export function validateIntervalSeconds(intervalSeconds: number): boolean {
  return (
    Number.isInteger(intervalSeconds) &&
    intervalSeconds >= 1 &&
    intervalSeconds <= 86400
  );
}
