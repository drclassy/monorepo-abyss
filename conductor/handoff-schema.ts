/**
 * Handoff Schema — The Abyss Monorepo
 * Sentra AI Ecosystem
 *
 * Defines TypeScript types for the .agent/HANDOFF.md structured format.
 * Used by agents to validate and write consistent handoff documents.
 */

export type TaskClass = 'A' | 'B' | 'C';
export type JETPhase = 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'J6' | 'J7' | 'J8' | 'J9';
export type AgentId = 'claude' | 'gemini' | 'jen';

export interface HandoffStep {
  /** Step number (1-based) */
  order: number;
  description: string;
  files_to_change: string[];
  acceptance_criteria: string[];
  rollback: string;
  status: 'pending' | 'in-progress' | 'done' | 'failed';
}

export interface HandoffRisk {
  description: string;
  mitigation: string;
  class: TaskClass;
}

export interface HandoffDocument {
  /** Session identifier — format: YYYY-MM-DD-<short-description> */
  session_id: string;
  agent: AgentId;
  task_class: TaskClass;
  jet_phase: JETPhase;
  go_status: boolean;

  /** Active task goal (1-2 sentences) */
  active_task: string;

  /** Diagnosis from J3 */
  diagnosis: string;

  /** Implementation plan from J4 */
  plan: HandoffStep[];

  /** Risks identified at J5 */
  risks: HandoffRisk[];

  /** Last commit SHA after J9 */
  last_commit?: string;

  /** Next action for next session */
  next_action: string;

  /** ISO timestamp of last update */
  updated_at: string;
}

export interface ErrorRecoveryEntry {
  step_failed: string;
  attempts: number;
  last_error: string;
  proposed_action: 'rollback' | 'alternative-path' | 'chief-escalation';
  description: string;
}

/** Validates that a handoff document has all required fields */
export function validateHandoff(doc: Partial<HandoffDocument>): doc is HandoffDocument {
  const required: (keyof HandoffDocument)[] = [
    'session_id',
    'agent',
    'task_class',
    'jet_phase',
    'active_task',
    'diagnosis',
    'plan',
    'next_action',
    'updated_at',
  ];

  return required.every((key) => doc[key] !== undefined && doc[key] !== null);
}
