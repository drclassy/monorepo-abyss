# HANDOFF.md - The Abyss Monorepo
<!-- Operational SSOT handoff for the next agent/thread. -->
<!-- Last updated: 2026-05-16 - Agent: Codex - Session: monorepo-stabilization-typecheck -->

---

## Authority Reminder

Before any non-trivial repo work, every agent must:

1. Verify `.agent/` exists.
2. Verify critical files exist: `CONTEXT.md`, `PROGRESS.md`, `HANDOFF.md`, `LESSONS.md`, `DECISIONS.md`, `SESSION_STATE.md`.
3. Read `.agent/DIGEST.md` first when present, then read the task-relevant `.agent/` files.
4. Treat `AGENTS.md` as the public rulebook and `.agent/` as the operational SSOT.

Forbidden: deleting, moving, cleaning, resetting, ignoring, or treating `.agent/` as cache/junk.

---

## Quick Orient

**Repo:** `D:\Devops\abyss-monorepo`
**Branch:** `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`
**HEAD:** `3039306`
**Working tree:** dirty; existing local edits are active context, not noise.
**Protected SSOT:** `.agent/` exists and must be preserved.

---

## Current Mission State

The stabilization chain has progressed past build blockers.

Verified outcomes:

- `pnpm build` passes in the global verifier.
- `@the-abyss/academic-solutions` build blocker was fixed earlier.
- `@the-abyss/orchestrator` Prisma export/cache blocker was fixed.
- `@the-abyss/daf-website` Windows standalone symlink blocker was fixed by making standalone opt-in.
- Root `pnpm typecheck` now fails only on remaining `packages/sentra/**` crown jewel review items.

---

## Changes Made In This Chain

Config/workflow:

- `packages/platform/database/package.json` adds a dedicated Prisma generate path.
- `platform/orchestrator/package.json` generates database client before orchestrator build.
- `turbo.json` adds non-cached Prisma generate/build ordering.
- `apps/community/daf-website/next.config.ts` was changed on disk to make `output: 'standalone'` opt-in via `NEXT_STANDALONE === 'true'`. Note: this app path may not appear in root git diff due ignore rules.

Safe typecheck fixes:

- `packages/shared/sentra-ui/src/index.ts` keeps local UI exports and changes Radix/Lucide wildcard exports to namespace exports.
- `tooling/abyss-cli/src/index.ts` removes unused `fileURLToPath`, `__filename`, and `__dirname`.

Crown jewel fixes explicitly approved and completed:

- `packages/sentra/sentra-nada/src/engine/early-warning.ts` removes unused internal `input` parameter from `checkDengueShockPattern`.
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts` removes unused `KnowledgeSourceRegistryEntry` and `SkippedRecord` imports only.

No behavior, contract, schema, dependency, app structure, or provider changes were made for the crown jewel fixes above.

---

## Current Verification State

Last `pnpm typecheck` result:

- Fixed errors disappeared:
  - `packages/shared/sentra-ui/src/index.ts`
  - `tooling/abyss-cli/src/index.ts`
  - `packages/sentra/sentra-nada/src/engine/early-warning.ts`
  - `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`
- Remaining errors are only:
  - `packages/sentra/sentra-bentara/src/auth.ts`
  - `packages/sentra/sentra-nada/src/__tests__/*`

Do not claim global verification complete until these remaining typecheck blockers are reviewed/fixed or explicitly deferred by Chief.

---

## Remaining REVIEW List

1. `packages/sentra/sentra-bentara/src/auth.ts`
   - Express module augmentation/types not resolving.
   - `Request.user` and `Request.apiKey` are not recognized.
   - Review only first; do not change auth contract without approval.

2. `packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts`
   - Test fixtures include `id`, but `SymphonyHybridDiagnosisCandidate` does not accept `id`.
   - Review contract drift before editing.

3. `packages/sentra/sentra-nada/src/__tests__/*`
   - `SymphonyAlert` fixture uses `message`, but type does not accept it.
   - `PROTO_RESPIRATORY` is not assignable to `SymphonyActionProtocolId`.
   - Clinical parity test has `"A" | "V"` vs `"P"` mismatch.
   - Review clinical/reasoning test expectations before editing.

---

## Guardrails For Next Agent

- Do not touch `packages/sentra/**` automatically.
- For crown jewel work: diagnose first, report, then wait for approval unless the Chief explicitly says to fix a specific file/item.
- Do not edit diagnosis/reasoning/clinical contracts without explicit approval.
- Do not run destructive Git commands.
- Do not delete/move/restructure apps, packages, or `.agent/`.
- Keep fixes one file or one small issue at a time.

---

## Suggested Next Prompt

Review only:

`packages/sentra/sentra-bentara/src/auth.ts`

Goal: diagnose Express request typing errors only.

Rules:

- No auth behavior change.
- No contract change without approval.
- Report first; do not edit unless the fix is clearly type-only and Chief approves.
