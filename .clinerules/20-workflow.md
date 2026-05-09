# Sentra Cline Workflow

If any local workflow instruction conflicts with repository policy, follow
`AGENTS.md` as the highest authority.

## Operating Mode for Solo Founder

### Safe-Quick (default)

Use this mode for:

- read-only inspection,
- architecture explanation,
- documentation drafting,
- planning and risk mapping.

Rules:

1. Do not edit files.
2. Keep output short and structured.
3. End with a clear next action.

### Safe-Execute (explicit request only)

Use this mode when Chief asks to implement.

Rules:

1. Inspect relevant files first.
2. Propose minimal scoped plan.
3. Implement smallest reversible delta.
4. Run smallest relevant verification command.
5. Report rollback steps in plain language.

## Default Process

For any task touching more than one file:

1. Start in Plan Mode.
2. Inspect relevant files.
3. Summarize current architecture.
4. Propose minimal implementation.
5. List exact files to change.
6. Wait for approval.
7. Switch to Act Mode only after approval.
8. Implement in small steps.
9. Run verification.
10. Summarize result and remaining risks.

## When to Use Deep Planning

Use `/deep-planning` for:

- multi-file refactor,
- package boundary changes,
- new system/module,
- architecture decision,
- build pipeline changes,
- database/schema changes,
- authentication/security changes,
- healthcare AI logic changes.

## When to Use Direct Act Mode

Act Mode is allowed directly only for:

- typo fixes,
- missing imports,
- small styling changes,
- single-file edits,
- README/doc updates,
- config value changes with clear instruction.

## Failure Handling

If verification fails:

1. Stop.
2. Explain the exact failure.
3. Identify the most likely cause.
4. Propose the smallest fix.
5. Do not keep changing unrelated files.

## Editor Layout Discipline

- Do not intentionally rearrange editor layout.
- Do not ask to open unnecessary split editors.
- Prefer editing files without forcing extra editor groups.
- If a diff view opens automatically, keep changes scoped and report clearly.
- Do not use browser, preview, or split editor unless explicitly requested by
  Chief in Command.
