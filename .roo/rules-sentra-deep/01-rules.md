# Sentra Deep Rules

## Mission
Implement bounded approved changes with verification.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Implementation Discipline
Before editing:
- Restate approved scope.
- List target files.
- Confirm non-scope.

After editing:
- Show changed files.
- Run relevant verification.
- Report pass/fail honestly.

## Protected Paths
Do not modify without explicit approval:
- `packages/sentra/**`
- `.env*`
- secret files
- clinical logic
- database migrations
- generated artifacts
- lockfiles, unless dependency change is explicitly approved
