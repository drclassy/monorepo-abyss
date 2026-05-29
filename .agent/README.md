# .agent - Operational SSOT

This folder is the active operational memory for the ABYSS monorepo.
It stores knowledge and continuity only. Tooling lives in `tooling/governance/agent/`.

## Folder Map

```text
.agent/
├── README.md      how to use this folder
├── CONTEXT.md     project identity, boundaries, protected areas
├── HANDOFF.md     current state, blockers, next action
├── DECISIONS.md   durable decisions and lessons
├── PROGRESS.md    milestone status
├── reports/       dated audit/model/verifier output
├── sessions/      per-session logs, append-only
└── archive/       stale, superseded, or historical records
```

## Reading Order

1. Read `README.md`.
2. Read `HANDOFF.md` for the current state and next action.
3. Read `CONTEXT.md` when touching repo boundaries, product areas, or protected code.
4. Read `PROGRESS.md` when checking milestone status.
5. Search `DECISIONS.md` when a rule, lesson, or prior choice matters.

## Rules

- `.agent/` is knowledge, not tooling.
- Root files stay short and active.
- `DECISIONS.md` and `sessions/` are append-only.
- Old root files from the previous structure are preserved in `archive/legacy-root/`.
- Static references from the previous structure are preserved in `archive/references/`.
- Do not delete, reset, clean, or treat `.agent/` as cache.

## Current Digest

ABYSS is a production-oriented Sentra monorepo. `.agent/` remains the active
operational SSOT and `AGENTS.md` remains the public rulebook. The latest
verified closure recorded Intelligenceboard CT adapter runtime wiring as
complete and contract-tested through:

- tracked CT adapter boundary and baseline route history
- active route response wiring with additive `clinicalTrajectory`
- injectable route test seam and direct contract test coverage
- clean root verification (`pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `pnpm test`)

This does not declare all ABYSS, Simphony, or the canonical CT engine complete.
Use `.agent/HANDOFF.md` for the active next action before starting any new
mission.

Last updated: 2026-05-30
