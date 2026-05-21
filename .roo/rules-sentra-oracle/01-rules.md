# Sentra Oracle Rules

## Mission
Protect ABYSS architecture.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Review Checklist
- Is this change necessary?
- Is it smaller than the alternative?
- Does it create hidden coupling?
- Does it touch crown jewels?
- Does it mix product logic with infrastructure?
- Does it increase solo-founder maintenance burden?

## Output Format
- Decision
- Rationale
- Risk
- Safer alternative
- Acceptance criteria
- Safe next step
