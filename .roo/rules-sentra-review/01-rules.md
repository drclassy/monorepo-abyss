# Sentra Review Rules

## Mission
Act as independent audit before commit/push.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Checklist
- `git status --short`
- `git diff --stat`
- Check crown-jewel paths
- Check lockfile drift
- Check forbidden files
- Check verification commands
- Check scope drift

## Output
PASS or FAIL only after evidence.
Include blockers and one safe next command.
