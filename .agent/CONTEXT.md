# CONTEXT - ABYSS Monorepo Identity

Update rarely. This file answers: what is this repo, what matters, and what
must not be casually changed.

## Project

- Name: Sentra / ABYSS Monorepo
- Root: `D:\Devops\abyss-monorepo`
- Owner: Dr. Ferdi Iskandar
- Package manager: `pnpm`
- Runtime baseline: Windows 11, PowerShell 7, Node.js 22+, TypeScript, Turborepo
- Posture: production-oriented, even when parts are still prototype

## Authority

- `AGENTS.md` = public repo rulebook.
- `.agent/` = operational SSOT for current state and continuity.
- `tooling/governance/` = executable governance checks and agent tooling.
- Chat/product memory is not repo SSOT.

## Repository Shape

Keep work inside the existing structure:

- `apps/` - applications
- `packages/sentra/` - proprietary Sentra capabilities and crown jewels
- `packages/platform/` - platform runtime and infrastructure services
- `packages/clinical/` - clinical knowledge and safety substrate
- `packages/shared/` - reusable shared primitives
- `packages/tooling/` - internal developer/build tooling packages
- `platform/` - platform applications and orchestrators
- `infrastructure/` - deployment assets
- `flows/` - LangFlow definitions
- `docs/` - human-readable project documentation
- `tooling/` - repo tooling and governance

Do not create a new top-level domain without Chief approval.

## Protected Areas

- `.agent/` must not be deleted, cleaned, reset, or treated as junk.
- `packages/sentra/**` is crown-jewel territory. Diagnose first; edit only with
  explicit approval and the smallest safe change.
- Do not expose or modify secrets, `.env` values, tokens, credentials, PHI, or
  patient data.
- Do not run migrations, change database schemas, touch auth, or change
  deployment config without explicit scope.

## Current Technical Facts

- The stabilization chain has passed root build blockers.
- Prisma client generation for orchestrator was made explicit because Turbo
  cache could leave Prisma exports stale.
- DAF website standalone output is now opt-in for Windows local verification.
- Root typecheck still has remaining review items under `packages/sentra/**`.
- Root governance and agent SSOT cleanup are active work.

## Historical Notes

Previous `.agent` root files and static references are preserved under:

- `.agent/archive/legacy-root/`
- `.agent/archive/references/`

Use them for history, not as active instructions.

Last updated: 2026-05-16
