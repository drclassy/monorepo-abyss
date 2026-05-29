# PROGRESS - Milestones and Status

Update when a milestone moves. Keep this high-level; details belong in HANDOFF.md, sessions/, reports/, or archive/.

Legend: [x] done, [~] in progress, [ ] not started, [!] blocked.

## Sentra UNICOM Subsystem

- [x] Phase 0 boundary-lock docs created under `docs/unicom/`.
- [x] Phase 1 `@the-abyss/unicom-core` implemented with typed protocol,
  validation, reducer, and contract tests.
- [x] Phase 2 `@the-abyss/unicom-policy` implemented with approval/block rules
  for evidence, destructive, crown-jewel, secret, external API, and clinical
  boundaries.
- [x] Phase 3 `@the-abyss/unicom-agent-sdk` and `@the-abyss/unicom-testkit`
  implemented with fake transport coverage.
- [x] Phase 4 `@the-abyss/unicom-server` and `@the-abyss/unicom-client`
  implemented with local Socket.IO-backed realtime and an in-memory append-only
  event store.
- [x] Phase 5 `apps/internal/unicom` cockpit implemented and locally verified
  against the UNICOM server.
- [x] Phase 6 `@the-abyss/unicom-persistence` scaffolded for append-only
  Postgres event storage without touching repo migrations.
- [ ] Phase 7 real ABYSS agent integration not started.
- [x] Active legacy `packages/platform/unicom/**` references were cleaned and
  the legacy package was deleted in cleanup commit `fbe892a`.
- [~] Historical specs, plans, and notes still contain legacy UNICOM Hub
  references as archival context only.

## Clinical Trajectory / Intelligenceboard CT Wiring

- [x] Intelligenceboard CT adapter boundary is tracked.
- [x] Intelligenceboard CT adapter tests are tracked.
- [x] Hook-normalized snapshot artifacts are synchronized.
- [x] Trajectory route baseline is tracked.
- [x] Minimal runtime wiring is active in
  `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts`.
- [x] Success response now returns additive `clinicalTrajectory` while
  preserving `success`, `data`, `visit_history`, `momentum_history`, and `meta`.
- [x] Injectable route test seam exists.
- [x] Route contract test exists for `clinicalTrajectory` and preserved legacy
  fields.
- [x] Final closure and next-phase handoff doc exists at
  `docs/specs/clinical-trajectory-v1/CT_WIRING_FINAL_CLOSURE_AND_NEXT_PHASE_HANDOFF.md`.
- [~] Independent final audit is recommended as the next CT step
  (`ABYSS-CT-AUDIT-013`).

## Repo Stabilization

- [x] Academic solutions build blocker fixed.
- [x] Orchestrator Prisma generate/cache blocker fixed.
- [x] DAF website Windows standalone build blocker fixed.
- [x] Safe non-crown-jewel typecheck blockers fixed.
- [x] Approved narrow unused/type-only crown-jewel fixes completed.
- [x] Typecheck fixture and app-local Prisma client blockers fixed.
- [x] ESLint and typecheck gates restored.
- [x] Root verification currently passes:
  - `pnpm typecheck -- --pretty false`
  - `pnpm build`
  - `pnpm exec eslint --print-config eslint.config.mjs`
  - normal pre-commit hook on commit `69168bf`

## SSOT and Governance

- [x] .agent/ minimal SSOT shape adopted.
- [x] .agent.bak records sorted into .agent/.
- [x] Agent tooling moved to tooling/governance/agent/.
- [x] Repo-local `.codex/` governance layer has been deprecated and removed after external backup.
- [x] Governance healthcheck now validates repo governance tooling without requiring root `.codex/`.
- [x] Claude Code project entrypoint and hook settings now point to the active SSOT shape and governance tooling paths.
- [x] Cursor core rule and Roo mode rules now use the same active SSOT read pattern as Codex.
- [x] Cursor shared hardening baseline now includes wired hooks, repo skills,
  repo subagents, committed MCP template notes, and automation starter docs.
- [x] Claude Code parity baseline added: `.claude/settings.json` wires the
  canonical `tooling/governance/agent/hooks/*` lifecycle hooks, a new
  `pre-tool-use-protect.ps1` guards Edit/Write to Protected Areas, plus local
  Claude subagents (`phi-safety-reviewer`, `orphan-classifier`), skills
  (`agent-handoff`, `jet-verify`), and `.mcp.json` (Playwright + Context7).
  `.claude/**` + `.mcp.json` stay local-only per public-push hygiene; tracked
  additions are the protect hook and `mcp.json.example` docs.
- [x] Claude Code runtime smoke run proved the aligned repo SSOT path operationally.
- [!] Cursor Agent CLI runtime smoke run is blocked by missing CLI authentication on this workstation.
- [!] Roo runtime proof is still blocked from terminal because no proven local headless entrypoint was found; current evidence remains extension-only.
- [~] Daily SSOT helper simplified to one local model call plus script-rendered files.
- [~] Cursor Automations remain operator-configured in the Agents Window; the
  repo only commits starter recipes and guardrails.
- [!] Governance healthcheck still reports stale references in apps/corporate/ferdiiskandar/AGENTS.md.

## Today

- Verification-gate stabilization follow-up reduced post-green warning noise:
  - `apps/community/classy-transformer` package lint warnings were cleared.
  - `apps/community/classy-transformer/website` package lint warnings were
    cleared with a local config/typing cleanup.
  - `packages/platform/document-ingestion` build warning from unreachable
    `"types"` export ordering was cleared.
  - `apps/healthcare/referralink` build CSS warnings from `print:*` utility
    selectors were cleared by switching the affected letter preview to plain
    print class names.
  - `apps/healthcare/intelligenceboard` build still passes, but Turbopack NFT
    tracing warnings remain deferred because they point into generated Prisma
    client tracing and are not yet a smallest-safe cleanup.
- Root verification remains green after the follow-up warning cleanup:
  - `pnpm --filter @the-abyss/classy-transformer lint`
  - `pnpm --filter @the-abyss/classy-transformer-website lint`
  - `pnpm --filter @the-abyss/document-ingestion build`
  - root `pnpm lint`
  - root `pnpm build`
- Post-stabilization verification passed.
- Root monorepo verification now passes again via
  `pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local.ps1"`.
- Docs/governance retained-docs cluster was packaged and committed in
  `d7c53be` (`docs(repo): add retained planning and governance docs`).
- Terraform root cleanup was packaged and committed in `76d71d9`
  (`refactor(terraform): narrow root config to environment entrypoints`).
- Root test recovery completed after follow-up app fixes:
  - `apps/community/classy-memory` now uses an app-local
    `verify-dashboard-buttons.mjs` after `tooling/quality` removal, and its
    lint blockers were cleared.
  - `apps/community/classy-transformer` test syntax regression in
    `__tests__/llm/user-api-keys.test.ts` was fixed.
  - `apps/healthcare/sentra-assist` stale test expectations were aligned with
    the current clinical alert semantics.
- Stabilization commits completed:
  - `60698fa` `fix(sentra): stabilize typecheck fixtures`
  - `0210c86` `fix(intelligenceboard): use app-local prisma client types`
  - `b4464bf` `fix(sentra): remove typecheck-blocking unused declarations`
  - `69168bf` `fix(tooling): restore eslint and typecheck gates`
  - `cb6cbf4` `refactor(packages): move integration bridge workspace path`
  - `27b9ed5` `chore(editor): consolidate cursor rules and handbook tooling`
  - `ac06615` `fix(runtime): tighten orchestrator and sentra validation types`
  - `df8ef22` `fix(ui): align sentra portal components with lint rules`
  - `2f70b2d` `docs(ferdiiskandar): add Abby content and app planning assets`
  - `71fd686` `feat(cli): add repo-aware status and focus commands`
  - `06f3b46` `chore(governance): simplify Codex enforcement`
  - `b1f4dad` `docs(legacy): archive stale docs and renumber active guides`
  - `ea7b8ff` `refactor(tooling): promote prompt engine and retire legacy handbook`
  - `17b404a` `build(workspace): refresh pnpm lockfile`
  - `a6a6fb9` `test(tooling): avoid localhost-only literature worker checks`
- `tooling/prompt-engine` now includes the new `Sentra Prompt Engine` webview
  composer flow with lightweight repo context, deterministic prompt assembly,
  and README/test/build coverage.
- Root verification is green again after fixing the root `package.json`
  conflict state and making `platform/sentra-portal` summary integration test
  tolerate parallel Turbo runtime via an explicit timeout.
- `.agent` conversion to SSOT is ready for migration commit planning once the
  active files and archive/report/session preservation files are reviewed
  together.
- **MERGE COMPLETE:** Branch `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`
  merged into `master` (commit `e3868a5`, 2026-05-21). 12 conflicts resolved,
  8 ESLint errors fixed, branch deleted. Repo is on `master` and green.

## UNICOM Hub (Historical)

### v1 (Polling) — Complete
- [x] Legacy UNICOM Hub v1 fully implemented in its original package era — all
  11 tasks done.
- [x] 29/29 tests pass, typecheck clean, binary smoke-tested.
- [x] `.mcp.json` wired, root `tsconfig.json` path alias added.

### v2 (SSE Real-time) — Complete (2026-05-21)
- [x] `SseManager` — SSE connection tracking, keepalive, lifecycle (10 unit tests)
- [x] Dual-path delivery — SSE push jika online, inbox fallback jika offline
- [x] `GET /subscribe/:agentId` — SSE endpoint untuk real-time push
- [x] `POST /receive` — drain inbox untuk agent offline
- [x] `sseManager` di-thread melalui semua MCP tool handlers
- [x] Eviction disconnect + `sseManager.dispose()` pada server close
- [x] `/health`, `/stats`, `/agents` endpoint mengembalikan SSE status
- [x] `feed.ts` — message feed tracking (recent activity, no content exposed)
- [x] `SseManager` + `createSseManager` di-export dari public API
- [x] 47/47 tests pass (8 test files), typecheck clean, build sukses
- [x] Smoke test: `curl /health` returns `{"status":"ok","agents":0,"sseConnected":0}`
- [ ] Manual MCP integration test pending — Chief perlu start server dan verify `/mcp` di Claude Code UI.

## RAG Enhancement

- [ ] 13-task implementation plan ready at `C:\Users\drclassy\.claude\plans\https-developers-openai-com-cookbook-exa-ancient-biscuit.md`
- [ ] Phase 1 (Tasks 1–5): Pipeline Hardening — not started.
- [ ] Phase 2 (Tasks 6–9): Trust & Evaluation — not started.
- [ ] Phase 3 (Tasks 10–13): Literature Auto-Pipeline — not started.

## Current Summary

Root build, typecheck, and test are green. Sentra UNICOM foundation is
committed and verified, and active legacy platform references are removed. RAG
Enhancement plan is ready for execution (Phase 1 → 2 → 3, mandatory order).

Intelligenceboard CT adapter runtime wiring is also complete and
contract-tested, with final closure recorded before any next CT phase starts.

Last updated: 2026-05-30
