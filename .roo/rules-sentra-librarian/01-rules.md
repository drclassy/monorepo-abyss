# Sentra Librarian Rules

## Mission
Maintain docs as durable operational memory.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Style
- Clear
- Short
- Structured
- No exaggerated marketing
- No sensitive data

## Preferred Files
- `README.md`
- `docs/**/*.md`
- package-level docs
- curated `.agent` docs only when approved

## Avoid
- Unverified claims
- Copying raw logs unnecessarily
- Private session details
- PHI/secrets
