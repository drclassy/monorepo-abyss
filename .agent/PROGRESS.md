# PROGRESS.md — The Abyss (Monorepo Root)
<!-- Agent MUST update at every session end or completed JET phase. -->
<!-- Full history: .agent/PROGRESS.archive.md -->
<!-- Last updated: 2026-04-18 -->

---

## Current Status

|Field|Value|
|-------|-------|
| **Last updated** | 2026-04-20 |
| **Active branch** | `abyss-core` → `origin` (Avvicenna GitHub, PRIVATE) |
| **Active JET phase** | GO granted — Chief authorized all classes (A/B/C) |
| **Next major initiative** | Incident recovery lock active; verify SYMPHONY canonical alignment over Dashboard + Assist consumers before new implementation |

---

## 🚨 Incident Status — 2026-04-20

- Codex/Dexton direction drift contained: `packages/database` must not be used as healthcare DB migration target.
- No destructive DB action confirmed: no reset, drop, successful migration, HNSW index, or ingest.
- Correct hierarchy locked: `SYMPHONY` is canonical parent; Dashboard and Assist are consumers/hosts.
- Next work must begin with PLAN -> CLAIM -> FILE -> TEST verification against `.agent/MASTER_CONTEXT_2026-04-19.md`.

## ✅ Done (cumulative — detail in PROGRESS.archive.md)

### Vector Store

- [x] `packages/vector-store` database boundary hardened: `VectorStore` now requires caller-owned Prisma-compatible database injection instead of importing `@the-abyss/database` directly.
- [x] `VectorStoreDatabaseClient` contract added to keep healthcare DB ownership independent.
- [x] `ingest-medical-pdf.ts` converted from auto-running placeholder into an injectable utility with chunking, empty-text skip, retry/backoff, and progress logging. Operational execution remains blocked until an app-level IntelligenceBoard KnowledgeBase migration plan is approved.
- [x] Vector-store tests rewritten around mocked embedding + mocked DB; package-local `tsconfig.json` added so typecheck no longer scans unrelated packages.
- [x] Verification 2026-04-20: `pnpm --filter @the-abyss/vector-store lint` PASS; `pnpm --filter @the-abyss/vector-store typecheck` PASS; `pnpm --filter @the-abyss/vector-store test` PASS 5/5.

### Governance & Infrastructure

- [x] Root `AGENTS.md` — supreme authority, JET + NestJS §5
- [x] Root `CLAUDE.md` — Claude Code CLI entry point
- [x] `.cursor/rules/` — modular 2026+ format (index, constitution, guards, backend, frontend, quality)
- [x] `.agent/` 5-file structure + `SESSION_STATE.md` + `PROTOCOL.md`
- [x] `.claude/` folder structure (agents/, commands/, skills/)
- [x] JET Workflow + Task Classification (A/B/C) across all enforcement layers
- [x] Repository governance: `repository/STANDARD.md`, `CHECKLIST.md`, `validate.ps1`
- [x] Remote migration: `origin` → Avvicenna GitHub (2026-04-17)

### Platform

- [x] Orchestrator CQRS scaffold — commands/, queries/ barrel exports (B4-A)
- [x] Orchestrator Phase A — Saga persistence, SagaExecution model, SagaRepository
- [x] Orchestrator Phase C — Health check endpoint, ApiKeyGuard, Swagger
- [x] Orchestrator test suite — 25 tests, 100% pass (6 files)

### Packages

- [x] `iskandar-gatekeeper` — auth hardening (B3-B): timing-safe, algorithm confusion prevention
- [x] All 12 packages — JSDoc + README (P2-10)
- [x] `packages/notebooklm` — scaffold added
- [x] ESLint + Prettier pass across all packages

### CI/CD

- [x] Security scan workflow (TruffleHog, fixed base SHA)
- [x] Auto-fix workflow (format + lint, PR creation)
- [x] `.gitignore` hardened (149 lines, secret patterns)

### Cursor/IDE

- [x] `settings.json` optimized (107 keys, 2026 best practice)
- [x] `.cursor/rules/` JET deduplication — `index.mdc` slimmed to pointer-only
- [x] `01-guard-context-init.mdc` trimmed (removed non-actionable Part 4)
- [x] `avicenna-plus-dark-1.3.1-patched.vsix` — status bar white, icons brighter, sidebar darker

---

## 🔄 In Progress (active sprint)

- [ ] **Polyrepo restructuring** — Class C, GO active (Chief authorized 2026-04-18)
  - 11 project repos to create from `apps/`
  - `packages/*` to publish as npm private via GitHub Packages
  - Reference: `HANDOFF.md §Polyrepo`
- [ ] **Orchestrator Phase B** — LangFlow client wiring to sagas (GO active)
- [ ] `.claude/agents/` — subagent definitions for Claude Code
- [ ] `.claude/commands/` — custom slash commands

## ⏳ Awaiting Other Agents

- [ ] **B4-B** — Saga production wiring diagnosis (Kilo)
- [ ] **B4-C** — Referral saga production wiring (Kilo)

## 🚫 Blockers

- RAG/KnowledgeBase remains blocked: must be added via app-level IntelligenceBoard schema/migration plan, not via `packages/database`; no DB writes without fresh Chief GO.

---

## Recent Sessions (last 2 weeks)

|Date|Agent|Summary|
|------|-------|---------|
| 2026-04-20 | Codex/Dexton | vector-store DI boundary + ingest utility hardening; lint/typecheck/test green; recovery corrected DB target back to IntelligenceBoard app-level schema |
| 2026-04-19 | Claude | vector-store refactor: Gemini REST → Vertex AI IAM, VectorStoreConfig fixed, 2 bugs patched (LIMIT cast, index.ts exports), HNSW best-practice params documented |
| 2026-04-19 | Claude | Monorepo audit + efficiency pass — 7 issues fixed, 20 files changed, CEO playbook created |
| 2026-04-18 | Claude | Cursor rules optimization, PROGRESS archive, HANDOFF refresh, GO granted |
| 2026-04-18 | Avvcenna+ | `.cursor/rules/` refactor to 2026+ modular format |
| 2026-04-17 | Avvcenna+ | Remote migration to Avvicenna GitHub |
| 2026-04-15 | Multiple | Orchestrator tests, ESLint/Prettier pass, CI/CD workflows, pre-push audit |
| 2026-04-14 | Gemini | Sentra Portal rebranding + AI Flows enhancement |
| 2026-04-13 | Claude | 14-project evaluation sweep, auth hardening, package docs |

---

## Next Steps for Next Session

1. Execute GUARD 1 — read all five `.agent/` files plus `MASTER_CONTEXT_2026-04-19.md`
2. Restate hierarchy before work: `SYMPHONY -> Dashboard + Assist`
3. Run read-only alignment verification: PLAN -> CLAIM -> FILE -> TEST
4. Do not run DB/Prisma/SQL; RAG DB work requires fresh Chief GO and app-level IntelligenceBoard migration plan
5. Only after alignment is verified, continue the next Chief-selected SYMPHONY/shared-package task

- SYMPHONY alignment Class A report created: .agent/reports/2026-04-20-symphony-alignment.md
- SYMPHONY coverage gap audit created: .agent/reports/2026-04-20-symphony-coverage-audit.md
- SYMPHONY canonicalization plan (7-phase, Phase 1 detailed): docs/superpowers/plans/2026-04-20-symphony-canonicalization.md
- SYMPHONY canonicalization Phase 1 complete (2026-04-20): symptom-signals NLP with 19 signals + 3-token negation window, 27 symptom-signal tests + 84/84 full suite GREEN, lint PASS, typecheck PASS. Closes Gap #8 of 2026-04-20 coverage audit.## 2026-04-20 16:56 — `9644530` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): capture canonical engine foundation
- **Files changed**: 17 file(s)

```
packages/shared-types/src/index.ts
packages/shared-types/src/platform-api.ts
packages/shared-types/src/symphony.ts
packages/symphony/src/__tests__/anaphylaxis.test.ts
packages/symphony/src/__tests__/assist-patterns-parity.test.ts
packages/symphony/src/__tests__/hybrid-decisioning.test.ts
packages/symphony/src/__tests__/parity-fixtures.test.ts
packages/symphony/src/__tests__/pe-suspect.test.ts
packages/symphony/src/__tests__/trajectory.test.ts
packages/symphony/src/adapters/assist-patterns-parity.ts
packages/symphony/src/engine/anaphylaxis.ts
packages/symphony/src/engine/assess.ts
packages/symphony/src/engine/hybrid-decisioning.ts
packages/symphony/src/engine/parity-fixtures.ts
packages/symphony/src/engine/pe-suspect.ts
packages/symphony/src/engine/trajectory.ts
packages/symphony/src/index.ts
```

---
## 2026-04-20 16:57 — `6542652` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add Indonesian symptom signals parser
- **Files changed**: 3 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
packages/symphony/src/index.ts
```

---
## 2026-04-20 16:59 — `00571c3` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): fever matcher + negation window for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:00 — `9327162` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): dyspnea matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:00 — `2091dbc` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): chest_pain matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:01 — `f6e304a` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): headache matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:01 — `9cd0d9f` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): vomit matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:02 — `3601d8c` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): seizure matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:03 — `47f12d0` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): altered_consciousness matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:04 — `da0e4d2` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): bleeding matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:04 — `a6796b4` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): pallor matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:05 — `7cea633` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): weakness matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:05 — `595d327` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): dizziness matcher + pusing co-signal with headache
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:06 — `c811dfb` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): syncope matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:06 — `9eb09bd` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): diaphoresis matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:07 — `3dcf08e` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): rash_or_angioedema matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:08 — `e363be8` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): allergen_exposure matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:08 — `4819ef0` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): abdominal_pain matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:09 — `42b4593` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): kussmaul_breathing matcher for symptom-signals
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:09 — `bb59883` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): polyuria + neurologic_focal_deficit matchers
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/symptom-signals.test.ts
packages/symphony/src/engine/symptom-signals.ts
```

---
## 2026-04-20 17:18 — `1afd058` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(symphony): fix import order lint debt
- **Files changed**: 3 file(s)

```
packages/symphony/src/engine/assess.ts
packages/symphony/src/engine/early-warning.ts
packages/symphony/src/engine/parity-fixtures.ts
```

---
## 2026-04-20 17:22 — `387d9b5` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(symphony): remove unsafe lint debt in parity fixtures
- **Files changed**: 3 file(s)

```
packages/symphony/src/__tests__/assist-patterns-parity.test.ts
packages/symphony/src/__tests__/parity-fixtures.test.ts
packages/symphony/src/engine/parity-fixtures.ts
```

---
## 2026-04-20 17:25 — `a587b41` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(agent): Phase 1 symptom-signals NLP canonicalization complete
- **Files changed**: 3 file(s)

```
.agent/DECISIONS.md
.agent/PROGRESS.md
.agent/sessions/2026-04-20.md
```

---
## 2026-04-20 20:59 — `8150fd7` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(symphony): bump contract version to 0.1.4 post Phase 1 surface
- **Files changed**: 1 file(s)

```
packages/shared-types/src/symphony.ts
```

---
