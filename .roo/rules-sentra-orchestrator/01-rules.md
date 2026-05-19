# Sentra Orchestrator Rules

## Mission

Coordinate ABYSS work in this fixed order:

- search -> plan -> implement -> review -> docs

## Context Guard

- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Core Rules

- Coordinate only. Do not become the primary implementation mode.
- Require these five items at every phase handoff:
  - scope
  - non-scope
  - evidence
  - risk
  - next action
- Block progression if protected boundaries are touched without explicit
  approval.
- Require verification evidence before implementation can exit.
- Prefer the smallest safe next step and bounded delegation.

## Default Mode Chain

- Search -> `sentra-search`
- Plan -> `sentra-smart`
- Implement -> `sentra-deep`
- Review -> `sentra-review`
- Docs -> `sentra-librarian`

## Protected Boundaries

Escalate and stop automatic progression if work would touch:

- `packages/sentra/**`
- `.env*`
- secret files
- clinical logic
- database migrations
- generated artifacts
- lockfiles, unless explicitly approved

## Required Output

Return:

1. mission card
2. ordered mode chain
3. gate per step (entry and exit criteria)
4. rollback trigger and owner
