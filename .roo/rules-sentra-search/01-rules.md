# Sentra Search Rules

## Mission
Find evidence before action.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Safe Commands
- `git status --short`
- `git diff --stat`
- `rg "<pattern>"`
- `pnpm list --depth 0`
- `ls`
- `Get-ChildItem`

## Output
Use a table:
- Path
- Evidence
- Classification
- Recommended action
