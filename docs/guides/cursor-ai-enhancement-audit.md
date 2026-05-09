# Cursor AI Enhancement Audit (Solo Founder)

## Scope

Audit and hardening for:
- Cursor setup
- Cline setup
- Codex setup
- rules, workflow discipline, verification, rollback, and cognitive load

This guide is implementation-oriented and designed for solo founder operation.

## Severity Findings

### Critical

1. Multi-authority instruction overlap
   - Surfaces: `AGENTS.md`, `.agent/*`, `.cursor/rules/*`, `.clinerules/*`, handbook exports.
   - Risk: inconsistent agent behavior and difficult mental model.

2. Missing Codex persona anchor in workspace
   - Handoff referenced `.codex/PERSONA.md` while file was absent.
   - Risk: authority chain became partially implicit.

### High

1. Global rule load too heavy
   - Multiple `.cursor/rules/*` were `alwaysApply: true` for process/logging layers.
   - Risk: over-procedural responses for low-risk tasks.

2. No Cline context boundary file
   - `.clineignore` was absent.
   - Risk: noisy retrieval surface and higher cognitive load.

### Medium

1. Hook quality gate can feel heavy
   - `.cursor/hooks/autofix-loop.mjs` runs lint + typecheck on stop.
   - Benefit is high, but can feel slow for doc-only work.

2. Handbook and runtime rules can drift
   - HTML handbook pages can lag behind actual rule behavior.

## Target Operating Model

### Single control-plane

- Policy authority: `AGENTS.md`
- Operational state: `.agent/*`
- Tool adapters:
  - Cursor: coding + verification
  - Cline: anti-overreach workflow helper
  - Codex: execution persona and task discipline

### Two-mode UX

1. Safe-Quick
   - Read-only inspect, planning, docs, risk map
   - Short structured outputs

2. Safe-Execute
   - Explicit implementation request
   - Sequence: inspect -> plan -> implement minimal diff -> verify -> rollback note

## Implemented Changes

1. Added Codex persona anchor
   - File: `.codex/PERSONA.md`
   - Outcome: explicit authority and mode behavior for Codex sessions.

2. Added Cline context boundary
   - File: `.clineignore`
   - Outcome: reduced indexing noise and safer default context.

3. Reduced non-essential global rule load in Cursor
   - Files:
     - `.cursor/rules/04-state-machine-discipline.mdc`
     - `.cursor/rules/06-handoff-master.mdc`
     - `.cursor/rules/08-session-summarizer.mdc`
   - Change: `alwaysApply: true` -> `alwaysApply: false` with scoped `globs`.
   - Outcome: lighter prompt overhead while preserving strict safety layers.

4. Added explicit two-mode workflow in Cline
   - File: `.clinerules/20-workflow.md`
   - Outcome: simple operator model for solo founder.

5. Updated Cursor README to reflect hardening model
   - File: `.cursor/README.md`
   - Outcome: clearer operational guidance for team/tooling.

## Rollback Map

If needed, revert by file:

- `.codex/PERSONA.md`
  - Rollback: remove file if Codex persona anchor is intentionally moved elsewhere.
- `.clineignore`
  - Rollback: remove or trim patterns that hide required context.
- `.cursor/rules/04-state-machine-discipline.mdc`
- `.cursor/rules/06-handoff-master.mdc`
- `.cursor/rules/08-session-summarizer.mdc`
  - Rollback: set `alwaysApply: true` again if strict always-on governance is preferred.
- `.clinerules/20-workflow.md`
  - Rollback: remove "Operating Mode for Solo Founder" section.
- `.cursor/README.md`
  - Rollback: remove "Solo founder hardening model" section.

## Verification Checklist (Operator)

For each implementation task:
1. Scope (what will and will not change)
2. Risk level (low/medium/high)
3. Verification command (smallest relevant)
4. Rollback command/path
5. Done criteria

## Recommended Next Step

Run one short pilot task using `Safe-Quick` then one implementation task using
`Safe-Execute`, and compare:
- response clarity,
- time-to-result,
- number of unnecessary file touches.
