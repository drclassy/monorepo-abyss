# HANDOFF - Current State and Next Action

Update every meaningful session. This is the first active file the next agent
should read after `.agent/README.md`.

Last updated: 2026-05-30 (session: ct-closure-handoff)

## Snapshot

- Repo: `D:\Devops\abyss-monorepo`
- Branch: `codex/master-ci-gate`
- GitHub target: `https://github.com/drclassy/monorepo-abyss`
- Active work: Intelligenceboard CT adapter runtime wiring closure recorded and clean.
- Mode: READY FOR NEXT SINGLE MISSION — latest CT closure and handoff doc committed
- Next: Start from `ABYSS-CT-AUDIT-013` unless Chief explicitly chooses another next-phase option

## Intelligenceboard CT Wiring Closure (2026-05-30)

- Latest verified CT closure commit: `d07b1c3a`
  - `docs(ct): record final wiring closure handoff`
- Prior implementation chain locked in:
  - `8b2f6254` `chore(ct): track hook-normalized intelligenceboard ct adapter boundary`
  - `7dd1d9c7` `docs(ct): plan intelligenceboard ct adapter runtime wiring boundary`
  - `fb1750ea` `chore: expand intelligenceboard trajectory route tracking boundary`
  - `5861d752` `chore(ct): track hook-normalized intelligenceboard trajectory route baseline`
  - `dd62ae57` `feat(ct): wire intelligenceboard ct adapter response`
  - `97066718` `test(ct): cover intelligenceboard clinicalTrajectory response`
- Final closure record lives at:
  - `docs/specs/clinical-trajectory-v1/CT_WIRING_FINAL_CLOSURE_AND_NEXT_PHASE_HANDOFF.md`
- Verified final state:
  - CT adapter source and test are tracked
  - trajectory route baseline is tracked
  - route runtime wiring is active and returns additive `clinicalTrajectory`
  - legacy route response fields remain preserved
  - injectable route test seam exists
  - route contract test exists
  - targeted app verification and root `typecheck` / `lint` / `build` / `test` all passed
  - working tree was clean at final closure report
- Boundary meaning remains strict:
  - Simphony = diagnosis / clinical reasoning authority
  - CT = trajectory capability and contract
  - Intelligenceboard / Dashboard = consumer, not authority
  - Sentra Assist = consumer, not authority
  - `ct-adapter.ts` = transitional bridge, not authority
- Do not reopen the old route tracking / hook-normalization loop. The approved
  boundary and closure lessons are now captured in the final closure doc.

## Respan Observability — Shared Package (2026-05-29)

- Verified Chief's `npx @respan/cli setup` left **only** `RESPAN_API_KEY` in
  `.env` (41 char, valid). No SDK/CLI/config/init code — prior per-app install
  (`7eb308b4`) was reverted (`ca587cb4`, "wrong approach").
- Implemented Respan as a **root-level shared feature** (per Chief's direction),
  not per-app:
  - NEW `packages/shared/observability` (`@the-abyss/observability`) — owns
    pinned Respan deps (`@respan/respan@2.1.0`,
    `@respan/instrumentation-anthropic@1.1.2`,
    `@respan/instrumentation-openai@1.0.2`) and exports idempotent
    `registerObservability(): Promise<boolean>`. TDD: 3/3 tests, typecheck,
    lint all green.
  - MODIFY `turbo.json` globalEnv += `RESPAN_API_KEY`; `.env.example` += Respan block.
- Pilot wiring (LOCAL/PRIVATE — `apps/` is git-excluded) in
  `apps/community/classy-transformer`: `instrumentation.ts` delegates to the
  shared package, `next.config.mjs` `transpilePackages`, dep added. App
  typecheck passes.
- Auth nuance: SDK uses `RESPAN_API_KEY` (set) to **send** traces; CLI browsing
  needs separate `npx @respan/cli auth login` (not done). `auth status` reports
  "Not authenticated" — expected; does not block SDK tracing.

### Live-test fix (2026-05-29, follow-up)

- Live test exposed: the `@respan/respan` `Respan` wrapper **silently ignores**
  `instrumentModules` (not in its options type) and **disables openAI/anthropic
  by default** → 0 useful instrumentations under Next.js bundler.
- Fix: switch to **`RespanTelemetry` from `@respan/tracing@1.1.6`** (the class
  that supports `instrumentModules` — Respan's documented Next.js/bundler
  workaround). The app's `instrumentation.ts` imports its own `openai` /
  `@anthropic-ai/sdk` and passes them in; `next.config.mjs` adds
  `serverExternalPackages` for the Respan/OTEL runtime (fixes `Can't resolve
  'stream'`).
- **Verified (no LLM call):** plain-Node smoke + Next dev both show
  `instrumentModulesKeys: ['openAI','anthropic']` and
  `successfully loaded instrumentations: ['OpenAIInstrumentation','AnthropicInstrumentation']`,
  `Respan tracing initialized successfully`, no `stream` error.
- **Trace emission PROVEN (2026-05-29):** ran one real LLM call through the
  instrumented OpenAI SDK pointed at local Ollama (`granite4.1:3b`, zero cloud
  cost). Log: `Processing LLM instrumentation span: openai.chat` →
  `Sending span "openai.chat" to processor "default"` → exported to
  `https://api.respan.ai/api/v2/traces`. End-to-end pipeline works.
  (Chief to confirm the span visually at platform.respan.ai.)

### Pre-existing app bug found (NOT Respan; classy-transformer)

- classy-transformer local dev homepage 500s: Next's edge middleware tracer
  (`next/dist/.../server/lib/trace/tracer.js`) throws
  `Native module not found: @opentelemetry/api` in the Edge runtime.
- **Proven pre-existing by elimination:** with our `instrumentation.ts`
  disabled AND `next.config` reverted to original, the 500 persists. Adding
  `@opentelemetry/api` as a direct dep did NOT fix it (reverted). It is a
  Next 15.2.6 + pnpm + Edge-runtime resolution issue, independent of Respan.
- Respan tracing itself initializes fine (Node runtime) regardless of this bug.
- **Recommend:** triage separately under classy-transformer's own JET workflow
  (may only affect local Windows dev, not prod/Vercel). Out of scope for the
  shared observability package.

## Public Push Hygiene (2026-05-28)

- `.roo/` folder deleted from filesystem (was already gitignored).
- `apps/` fully excluded from git index (`git rm -r --cached apps/`).
  - All applications now excluded; each lives in private repos.
  - `.gitignore` simplified from complex selective rules to single `apps/` entry.
- `packages/sentra/` (crown-jewel clinical AI engines) excluded from git index.
  - Added `packages/sentra/` to `.gitignore`.
  - Local development unaffected — files remain on filesystem.
- `LICENSE` changed from Apache 2.0 → MIT.
- Root `package.json` license field → `"MIT"`.
- All 7 `packages/unicom/*/package.json` → `"license": "MIT"` added.
- `.agent/archive/`, `.agent/hooks/`, `.agent/scripts/` excluded from index.
- `.agent/reports/ssot-daily/`, `.roomodes` excluded from index.
- `docs/handbook/`, `docs/architecture/`, `docs/superpowers/` removed from index and filesystem.
- `CODEOWNERS` updated to remove stale apps/ and packages/sentra/ references.
- `README.md` rewritten with sentra-readme skill — community positioning, MIT badge,
  UNICOM feature focus, Sentra Professional tier disclosure.
- All email references verified: `drferdiiskandar@sentrahai.com` is the canonical contact.

## Sentra README Skill Install (2026-05-28)

- Chief provided `C:\Users\drclassy\Downloads\files.zip` containing the
  `sentra-readme` skill package.
- Skill installed to `C:\Users\drclassy\.claude\skills\sentra-readme\`:
  - `SKILL.md` — main skill content (positioning-driven README master pattern)
  - `references/patterns.md` — component snippet library (badges, Mermaid, tables)
  - `references/template.md` — ready-to-fill README template
- `~/.claude/skills/` is auto-scanned by Claude Code — no `settings.json`
  registration required.
- Skill confirmed active in session; visible as `sentra-readme` in skill listing.
- Plugin cache copy also placed at
  `C:\Users\drclassy\.claude\plugins\cache\local\sentra-readme\1.0.0\`
  (redundant — `skills/` dir is the authoritative copy).
- Mode: IDLE — no repo code was changed; this session was tooling/skills only.
- Next: Continue with prior agenda — Phase 7 agent integration planning or
  archival doc relabeling.

## Public Push Hygiene (2026-05-28)

- Current push-prep task removed local AI tool surfaces from the Git index with
  `git rm --cached` while preserving files on disk:
  - `.qoder/**`
  - `.qoderignore`
  - `.claude/**`
- Root `.gitignore` now keeps Qoder repo-wiki output, local screenshots,
  scratch query scripts, `.qoder/`, `.qoderignore`, `.claude/`, and local
  `.vscode/settings.json` / `.vscode/tasks.json` out of default push scope.
- Generated crown-jewel runtime artifacts under
  `packages/sentra/sentra-pustaka/data/embedding-artifacts/**` and
  `packages/sentra/sentra-pustaka/data/retrieval-evaluation/runs/**` were
  removed from the index only; source, tests, and curated eval query fixtures
  remain tracked.
- README and docs indexes were refreshed to use existing `.agent` status files,
  include the active `docs/unicom/**` subsystem, and describe `apps/` as a
  curated boundary rather than a bulk public app surface.

## Sentra UNICOM Foundation (2026-05-27)

- Committed milestones:
  - `74ddc226` `feat(unicom): add ABYSS-native realtime agent communication foundation`
  - `fbe892a` `chore(unicom): remove legacy platform references`
- Chief-approved target structure:
  - `docs/unicom/**`
  - `packages/unicom/core`
  - `packages/unicom/policy`
  - `packages/unicom/testkit`
  - `packages/unicom/agent-sdk`
  - `packages/unicom/server`
  - `packages/unicom/client`
  - `packages/unicom/persistence`
  - `apps/internal/unicom`
- Legacy `packages/platform/unicom/**` was deleted in cleanup commit
  `fbe892a` and must not be restored as the foundation.
- Local verification completed:
  - package-level typecheck/test/build passes for the new `packages/unicom/*`
    family
  - `@the-abyss/unicom` app typecheck/build passes
  - local server is runnable on `http://127.0.0.1:4318`
  - local app is runnable on `http://127.0.0.1:3021`
- Governance note:
  - root `.gitignore` originally ignored `apps/*`, so `apps/internal/unicom`
    needed an explicit allowlist entry and a local `app.boundary.json`
    classification.

## RAG Recovery Integration (2026-05-23)

- Source recovery branch: `feat/rag-enhancement-execution`
- Recovery commits preserved:
  - `9825ca3` `chore(repo): ignore ferdiiskandar local build artifacts`
  - `e850d10` `feat(rag): recover stranded worktree changes`
  - `3c4b580` `merge(master): sync latest mainline into rag enhancement branch`
- Clean integration branch merge commit: `4e9c01d` `merge(rag): integrate feat/rag-enhancement-execution`
- Recovered scope includes:
  - RAG pipeline hardening across `@sentra/cermin`, `@sentra/pustaka`, and `@the-abyss/document-ingestion`
  - local app Git noise fix for `apps/corporate/ferdiiskandar/{node_modules,.next,.turbo}`
  - stranded RAG test/script files such as `packages/sentra/sentra-pustaka/tests/local.engine.test.ts` and `tooling/scripts/rag/sentra-rag-terminal.ps1`
- Important operational note:
  - `master` itself was not advanced in-place because `D:\Devops\abyss-monorepo` is the active `master` worktree and still has unrelated local modifications under `tooling/prompt-engine/**`. Advancing that branch ref now would contaminate the root worktree state.

## Post-Review Code-Review Skill Fixes (2026-05-21)

`/code-review` high-effort (3 subagents: Reuse, Quality, Efficiency) reviewed commits `8bfc968` + `98ee717`. Findings applied:

| Finding | File | Fix |
|---|---|---|
| HIGH — Disposable leak | `extension.ts:300` | Capture `messageListener`, dispose on `panel.onDidDispose` |
| NOTABLE — dispatch table | `extension.ts:303-337` | 3 if-chains → `messageHandlers` Record dispatch |
| MEDIUM — uncached root walk | `portal-audit-log.ts:14` | Module-level `_rootCache Map` caches up to 28 existsSync calls |
| MINOR — hardcoded bg token | `top-nav.tsx:18` | `bg-[#0a0a0b]` + `border-[#1F1F23]` → `bg-zinc-950` + `border-zinc-900` |
| LOW — empty string toLowerCase | `audit.ts:72` | Guard: only spread + toLowerCase when `manualInstruction` is truthy |
| LOW — hand-rolled compact fmt | `sentra-context-engine.html:1391` | `formatCompactNumber` → `Intl.NumberFormat(notation:'compact')` |

Skipped (deferred):
- `findMonorepoRoot` triple-copy (cross-package, needs coordination)
- `audit.ts` declarative rules (7× pattern, risky behavior-parity refactor)
- `layout.tsx` missionHome consolidation (false positive — checks serve different purposes)
- `/dashboard` shared constant (cross-file, out of scope)

## UNICOM Hub — SSE v2 Implementation Complete (2026-05-21)

**Masalah v1:** Poll-based `receive_messages` — Chief harus relay setiap pesan. Agent tidak bisa diskusi autonom.

**Solusi v2:** SSE Subscribe + Dual-Path Delivery. Agent buka `GET /subscribe/:agentId`, UNICOM push pesan real-time. Agent offline → inbox fallback.

**All 5 tasks completed:**

| Task | Commit | What |
|---|---|---|
| Task 1 | `9f7f39a` + `2ccadb6` | `SseManager` class + 10 unit tests (keepalive, lifecycle, mock) |
| Task 2 | `67ed18c` + `0656dd9` | `routeMessage` dual-path delivery (SSE push jika online, inbox fallback) + options object refactor + TOCTOU guard |
| Task 3 | `f9dfacb` | Thread `SseManager` through MCP tool handlers (`send_message`, `broadcast`, `update_status`) |
| Task 4 | `40d07d6` + `ef67406` | `GET /subscribe/:agentId`, `POST /receive`, eviction disconnect, SSE integration tests |
| Task 5 | `ef67406` | Export `SseManager` + `createSseManager` dari `index.ts`, build + smoke test |

**Verification:**
- 47/47 tests pass (8 test files)
- `pnpm typecheck` clean
- `pnpm build` sukses — `dist/bin/unicom.js` + `dist/src/index.js`
- Smoke test: `curl /health` → `{"status":"ok","agents":0,"sseConnected":0}`

**Files changed/created:**
- CREATE: `src/sse-manager.ts`, `src/feed.ts`, `tests/sse-manager.test.ts`, `tests/server-sse.test.ts`
- MODIFY: `src/router.ts`, `src/server.ts`, `src/index.ts`, `src/tools/*.ts`, `tests/router.test.ts`, `tests/server.test.ts`

**Code Quality Review Fixes (commit `0874a98`):**
- `readBody()` error handling + `setEncoding('utf8')` — prevent request hangs
- `/mcp` JSON parse error guard — 400 response instead of crash
- SSE connection limit (`MAX_SSE_CONNECTIONS=100`) — DoS protection
- Sender validation on `POST /send` — 403 for unregistered agents
- New `POST /register` endpoint — HTTP client can register agents
- Initial SSE `:connected` event — confirms stream is live
- `broadcast()` single-pass iteration — O(n) instead of O(2n)
- `deliver()` signature cleanup — removed redundant type parameter

**Verification after fixes:**
- 49/49 tests pass (8 test files, +2 new tests)
- `pnpm typecheck` clean
- `pnpm build` sukses
- Smoke test: `curl /health` → `{"status":"ok","agents":0,"sseConnected":0}`

**Endpoints:**
- `GET /subscribe/:agentId` — SSE stream untuk real-time push
- `POST /send` — kirim pesan (dual-path: SSE jika online, inbox jika offline)
- `POST /receive` — drain inbox untuk agent offline
- `POST /register` — register agent via HTTP
- `GET /health` — status + SSE connected count
- `GET /stats` — agents, SSE, inbox depths, recent feed
- `GET /agents` — list agents dengan SSE status per agent
- `POST /mcp` — MCP Streamable HTTP endpoint

**Next Action:**
- ~~Menunggu keputusan Chief: finishing branch~~ → **DONE**: branch merged to `master` (commit `e3868a5`) dan deleted.
- Lanjut ke RAG Enhancement Phase 1 (Pipeline Hardening) sesuai PROGRESS.md.

## RAG Enhancement Plan (NEW 2026-05-21)

**Plan file:** `C:\Users\drclassy\.claude\plans\https-developers-openai-com-cookbook-exa-ancient-biscuit.md`

Three-phase RAG enhancement plan for `@sentra/pustaka`, `@sentra/cermin`, `@the-abyss/document-ingestion`:

- **Phase 1 (Tasks 1–5): Pipeline Hardening** — Fix sequential embedding bottleneck (~85–93% faster); add batch upsert, retry, circuit breaker, real token counting
- **Phase 2 (Tasks 6–9): Trust & Evaluation** — Fix dry-run eval output, add Recall@K/MRR/MAP, enhance compliance guard (MRN, DOB, ICD), enrich citations with approval_status
- **Phase 3 (Tasks 10–13): Literature Auto-Pipeline** — JATS XML provider, literature-connector (harvest→registry auto-approval), OpenAI File Search backend, HybridBrainEngine cloud extension

**Execution order is mandatory:** Phase 1 → Phase 2 → Phase 3.

**Codex instructions:** Use `superpowers:executing-plans` or `superpowers:subagent-driven-development`. Follow plan step by step. Run Vitest after each task. Commit after each task passes. Working dir: `D:\Devops\abyss-monorepo`.

**Key packages touched:**
- `packages/sentra/sentra-cermin/` — crown-jewel
- `packages/sentra/sentra-pustaka/` — crown-jewel
- `packages/platform/document-ingestion/`

**Session 2026-05-21:** UNICOM verification + 2 fixes committed (`f9daf5c`). RAG plan unchanged — no code written yet.
- **Merge COMPLETE:** `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar` → `master` (`e3868a5`). 12 conflicts resolved, 8 ESLint fixes applied. Branch deleted.
- `.agent/` is the operational SSOT; `AGENTS.md` is the public rulebook.
- `.agent/` has been simplified to knowledge files only. Tooling now belongs in
  `tooling/governance/agent/`.

## Read First

Use the current simplified SSOT order:

1. `.agent/README.md`
2. `.agent/HANDOFF.md`
3. `.agent/CONTEXT.md` when touching repo boundaries or protected areas
4. `.agent/PROGRESS.md` for milestone status
5. `.agent/DECISIONS.md` for durable decisions and lessons

Do not expect the old generated `DIGEST.md`, root `LESSONS.md`, or
`SESSION_STATE.md` files to exist. Their old content was superseded or archived
as part of the SSOT simplification.

## Current Technical State

- Root `pnpm typecheck -- --pretty false` passes.
- Root `pnpm build` passes.
- Root `pnpm test` passes.
- Root `verify-local.ps1` passes end-to-end.
- `pnpm exec eslint --print-config eslint.config.mjs` passes.
- Normal pre-commit hook passed on recent hygiene commits through `ad42434`.
- Global verification blockers from the stabilization chain are cleared.
- Tooling test health is green after making the `literature-worker` test avoid a
  localhost-only assumption on this workstation.
- Agent session stop governance now has a hard SSOT continuity gate: if file
  edits happened since the previous session stop, at least one active continuity
  file (`.agent/HANDOFF.md`, `.agent/PROGRESS.md`, or `.agent/DECISIONS.md`)
  must be updated before handoff.
- `packages/integration-bridge/` has been renamed to `packages/integration/`;
  the package name remains `@the-abyss/integration-bridge`.
- Do not push yet. Finish dirty tree classification and app import review first.

## Completed In This Stabilization Chain

- `apps/academic/academic-solutions` build got past the missing
  `@/hooks/use-mobile` blocker.
- `@the-abyss/orchestrator` got past stale/missing Prisma exports by making
  database Prisma generation explicit before dependent builds.
- `@the-abyss/daf-website` Windows local build got past Next standalone symlink
  EPERM by making standalone output opt-in with `NEXT_STANDALONE=true`.
- `packages/shared/sentra-ui/src/index.ts` export conflicts were fixed by
  preserving direct exports and adding namespace aliases.
- `tooling/abyss-cli/src/index.ts` unused `__filename` / `__dirname` setup was
  removed.
- Governance/editor rule updates were committed.
- Workspace/build package config alignment was committed without including the
  lockfile.
- CLI cleanup was committed.
- `sentra-ui` compatibility shim was committed.
- `packages/sentra/sentra-nada/src/engine/early-warning.ts` unused internal
  `input` parameter was removed after explicit approval.
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`
  unused imports were removed after explicit approval.
- Typecheck fixture and app-local Prisma client typing fixes were completed.
- ESLint and typecheck gates were restored.
- `apps/community/classy-memory` recovered from the `tooling/quality` removal by
  moving dashboard button verification to an app-local
  `verify-dashboard-buttons.mjs` and clearing local lint blockers.
- `apps/community/classy-transformer` root-blocking test syntax regression in
  `__tests__/llm/user-api-keys.test.ts` was fixed.
- `apps/healthcare/sentra-assist` stale tests were aligned to the current
  clinical alert semantics so the app no longer blocks root `pnpm test`.

## Completed Commits

- `60698fa` `fix(sentra): stabilize typecheck fixtures`
- `0210c86` `fix(intelligenceboard): use app-local prisma client types`
- `b4464bf` `fix(sentra): remove typecheck-blocking unused declarations`
- `69168bf` `fix(tooling): restore eslint and typecheck gates`
- `d89e7b8` `docs(agent): simplify SSOT and preserve archives`
- `87c310e` `chore(governance): migrate agent governance tooling`
- `ef5b6e4` `chore(repo): ignore local generated artifacts`
- `2623924` `chore(governance): remove migrated legacy agent rules`
- `39dd191` `docs(agent): add durable agent history`
- `d4a6e05` `docs(agent): add sanitized audit session`
- `379202a` `docs(governance): update editor agent rules`
- `c2ec0e8` `chore(workspace): align build and package config`
- `57079b9` `chore(cli): remove unused esm path helpers`
- `ad42434` `fix(ui): preserve direct exports with namespace aliases`
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
- `d7c53be` `docs(repo): add retained planning and governance docs`
- `76d71d9` `refactor(terraform): narrow root config to environment entrypoints`

## Current Dirty Tree Review State

- Ignored/local artifact coverage was added and committed.
- Most generated artifacts were removed. `node_modules.bak-recovered/` still
  physically exists but is ignored and blocked by Windows access denial; do not
  force-delete it in normal review missions.
- Legacy tracked deletions were reviewed and committed as migrated cleanup:
  old `.agents/skills`, root `.clinerules`, and old Kilo plan file.
- Durable `.agent/reports` and `.agent/sessions` history was reviewed and
  committed.
- `.agent/sessions/2026-04-15-audit-scan.md` was sanitized and committed after
  the pre-commit secret and PHI scans passed.
- Remaining `.agent` untracked items are intentionally not committed yet:
  repeated `ssot-daily/*-backup/` folders, later small generated
  `ssot-daily/*.md` runs, `ssot-suggestions/`, and noisy session logs
  `2026-05-16.md` / `2026-05-17.md`.
- Repo-local `.codex/` was backed up and removed under
  `ABYSS-CODEX-LOCAL-DEPRECATION-001`; live governance references now need to
  point to global Codex at `C:\Users\drclassy\.codex` plus repo authority in
  `AGENTS.md`, `.agent/`, and `tooling/governance/agent/`.
- `CLAUDE.md`, `.claude/settings.json`, `.cursor/rules/00-core.mdc`, `.roomodes`,
  and `.roo/rules-sentra-*/01-rules.md` were aligned to the same active SSOT
  read pattern. Runtime proof now exists for Codex and Claude Code; Cursor CLI
  is blocked by missing auth, and Roo remains unproved from terminal because no
  local headless entrypoint was confirmed in this session.
- `.kilo/kilo.jsonc` now needs to preserve the same overlay order explicitly:
  global Codex `AGENTS.md`, then repo `AGENTS.md`, then `.agent/README.md`,
  then `.agent/HANDOFF.md`, so Kilo does not stop at the global baseline.
- `tooling/governance/agent/healthcheck.js` now needs to validate that Kilo
  overlay order automatically when `.kilo/kilo.jsonc` exists on the local
  workstation.
- Dirty-tree closure no longer uses deferred buckets. Every dirty or untracked
  item must be classified as `KEEP_AND_COMMIT`, `FIX_AND_COMMIT`,
  `MOVE_OUT_OF_REPO`, or `DELETE_OR_RESTORE`.
- `.cursor/rules/design.mdc` and `apps/corporate/ferdiiskandar/**` are not
  active dirty-tree items in the current closure mission.
- Untracked `.agent` reports/sessions must be curated and committed or moved
  out of the active repo; do not leave them as unresolved work.

## Important Changed Files From This Chain

- Governance/editor docs and rules committed in `379202a`.
- Workspace/package config committed in `c2ec0e8`.
- CLI cleanup committed in `57079b9`.
- `sentra-ui` compatibility shim committed in `ad42434`.
- `.vscode/settings.json`
  - Workspace Cursor layout hardening added: hide secondary sidebar by default,
    disable title-bar layout control, and prevent automatic maximized panel
    opens during agent-heavy sessions.
- `apps/community/daf-website` dependency alignment was tested locally but is
  not a commit candidate now because the app path is ignored/untracked.
- `packages/sentra/sentra-nada/src/engine/early-warning.ts`
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`
- `apps/community/classy-memory/package.json`
- `apps/community/classy-memory/verify-dashboard-buttons.mjs`
- `apps/community/classy-memory/src/components/Lander.tsx`
- `apps/community/classy-memory/src/components/landing/CapabilitiesSection.tsx`
- `apps/community/classy-memory/src/components/landing/MemoryArchitectureFlow.tsx`
- `apps/community/classy-memory/src/components/BentoDashboard.tsx`
- `apps/community/classy-memory/src/components/zones/OverviewZone.tsx`
- `apps/community/classy-memory/src/components/ui/3d-gallery-photography.tsx`
- `apps/community/classy-transformer/__tests__/llm/user-api-keys.test.ts`
- `apps/healthcare/sentra-assist/components/clinical/buildAlerts.extended.test.ts`
- `apps/healthcare/sentra-assist/lib/clinical/vital-autocomplete.test.ts`

Note: `apps/community/daf-website/next.config.ts` may not appear in root git
diff because parts of `apps/` are ignored by the current repo rules.

## Remaining Follow-Up

1. Commit or package the current root-green follow-up fixes:
   - `apps/community/classy-memory`
   - `apps/community/classy-transformer`
   - `apps/healthcare/sentra-assist`
2. Decide the remaining high-risk non-`.agent` dirty items separately:
   - `packages/shared/design-token/github/workflows/ui-lint.yml`
   This is still intentionally left out because it changes CI/CD behavior.
3. `apps/corporate/ferdiiskandar/AGENTS.md`
   - Governance healthcheck still reports stale references.
   - Treat as governance cleanup, not product rewrite.
4. Re-run dirty tree classification after the hygiene commits.
5. Verify the post-deprecation governance path after live references are
   migrated, without restoring repo-local `.codex/` unless a real blocker is
   proven.
6. Review `apps/corporate/ferdiiskandar/**` app import only after the dirty tree
   classification is refreshed.
7. Classify untracked `.agent` reports/sessions immediately during dirty-tree
   closure; curate and commit valid continuity records or move them out of the
   active repo.
8. Verify the hardened session-stop gate and refreshed SessionStart/PostToolUse
   coverage in one real agent stop cycle before treating it as fully
   operational across tools.
9. Full parity proof is now partial:
   - Claude Code: done
   - Cursor Agent CLI: blocked until CLI auth exists
   - Roo Code: blocked until a real extension runtime session is used

## Guardrails

- Do not delete, clean, reset, move, or treat `.agent/` as junk.
- Do not touch `packages/sentra/**` automatically.
- Treat `packages/sentra/**` as crown-jewel / review-first territory.
- Diagnose first, report, then wait for Chief approval before crown-jewel edits.
- Do not change schemas, providers, auth behavior, deployment config, or
  architecture unless explicitly scoped.
- Do not run destructive Git commands.
- Keep each fix one file or one issue at a time.
- Do not claim build, typecheck, or tests passed without fresh verification.

## Suggested Next Action

Commit or package the current root-green app fixes first, then refresh dirty
tree classification before picking the next cluster:

```powershell
git status --short
git diff --stat
git diff --name-status
git ls-files --others --exclude-standard .cursor
```

Do not push yet. Do not touch `apps/corporate/ferdiiskandar/.env.local`,
`node_modules.bak-recovered/**`, restore repo-local `.codex/`, or touch
`.cursor/rules/design.mdc` without a targeted mission.

Verification before any next commit:

```powershell
pnpm typecheck -- --pretty false
pnpm build
git diff --stat
```
