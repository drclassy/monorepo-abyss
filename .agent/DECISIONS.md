# DECISIONS.md — The Abyss (Monorepo Root)
<!-- Append-only. NEVER delete or edit existing entries. -->

---

### [2026-04-10] AGENTS.md as cross-tool source of truth
**Context:** Multiple AI tools (Claude Code, Cursor, Codex, Windsurf) need consistent instructions.
**Decision:** AGENTS.md at root = single source of truth. Division AGENTS.md = scoped additions only. Sub-app AGENTS.md = thin bridge.
**Rejected alternatives:** CLAUDE.md only, .cursor/rules/ only.
**Rationale:** AGENTS.md is Linux Foundation standard; widest tool support; prevents rule duplication.
**Consequences:** Root AGENTS.md must stay lean; division files add domain rules only; never duplicate root content.

### [2026-04-10] Single session log protocol
**Context:** Two parallel session log systems existed (.agent/sessions/ and an external audit folder) with no bridge.
**Decision:** `.agent/sessions/` is the single source of truth for agent session logs. The external audit folder has been deprecated.
**Rationale:** One system is simpler and less error-prone. `.agent/sessions/` serves both context recovery and lightweight audit needs.
**Consequences:** Every coding session updates `.agent/sessions/YYYY-MM-DD.md` only.

### [2026-04-10] .claude/ folder at monorepo root
**Context:** Claude Code settings.json, subagents, commands, and skills need a home.
**Decision:** Store all Claude Code configuration in a tracked `.claude/` directory at the root.
**Rationale:** Ensures all team members (and future agent sessions) share the same prompt engineering and tool configuration.

---
<!-- Agent: append new decisions below this line -->

### [2026-04-21] Vertex AI & Healthcare AI Infrastructure Standards
**Context:** Establishing a robust, HIPAA-ready AI infrastructure for Sentra/Melinda Hospital within the Abyss monorepo.
**Decision:** 
1. **Library Standardization:** Use `@google-cloud/vertexai` (GenAI), `@google-cloud/vision` (OCR), and `google-auth-library` (IAM Auth).
2. **Authentication:** Mandatory Service Account (ADC) via `google-auth-library` for all healthcare workloads; bare API keys are forbidden.
3. **Architecture:** Shared AI logic in `packages/ai-core`, vector operations in `packages/vector-store`.
**Rationale:** Ensures international compliance (HIPAA/GDPR), enterprise-grade security, and seamless multi-region scalability.
**Consequences:** Requires IAM role management for Service Accounts; prevents credential leaks in code/env.
**Decision:** .claude/ at monorepo root with agents/, commands/, skills/ subdirectories.
**Rationale:** Claude Code reads .claude/ from project root; enables subagent delegation and custom commands.
**Consequences:** settings.json needed; subagent definitions in agents/*.md; slash commands in commands/*.md.

### [2026-04-13] Three-layer enforcement architecture
**Context:** Single CLAUDE.md or single .cursor/rules file insufficient to enforce agent behavior across all tools.
**Decision:** Three-layer system — Level 1: .cursor/rules/00-constitution.mdc (IDE gate), Level 2: CLAUDE.md (CLI gate), Level 3: AGENTS.md (supreme authority).
**Rationale:** Each tool has a different entry point; all three must enforce identical JET Protocol and GUARD 1 to prevent any bypass path.
**Consequences:** All three files must be kept in sync when JET Protocol or GUARD 1 is updated.

### [2026-04-13] CQRS mandatory for orchestrator only
**Context:** CQRS adds complexity — applying it universally would slow development across all apps.
**Decision:** CQRS pattern is mandatory only for apps/platform/orchestrator/ (Saga Engine). Other NestJS apps use standard REST pattern.
**Rationale:** Orchestrator manages complex sagas and event sourcing — CQRS is architecturally necessary. Healthcare apps are CRUD-heavy and do not benefit from the overhead.
**Consequences:** orchestrator/ must have Commands/, Queries/, and Events/ directories. Other apps are exempt.

### [2026-04-13] packages/database as exclusive DB access layer
**Context:** Individual apps were making direct Prisma/ORM calls, causing schema drift and duplicated query logic.
**Decision:** All database operations must route through packages/database. No direct ORM calls in application code.
**Rationale:** Centralizes schema management, enables shared query optimization, enforces PHI/PII handling at a single layer.
**Consequences:** packages/database must expose typed repository interfaces; apps import from @abyss/database only.

---
<!-- Agent: append new decisions below this line -->

### [2026-04-19] pnpm-workspace.yaml must include apps/**
**Context:** Audit session revealed `apps/**` was missing from `pnpm-workspace.yaml`. pnpm reads THIS file (not `package.json#workspaces`) to register workspace members. All apps were not registered via pnpm.
**Decision:** `pnpm-workspace.yaml` must always declare `apps/**`, `packages/**`, and `tooling/*` as the three entries.
**Consequences:** After any change to this file, `pnpm install` must be re-run to regenerate lockfile. Chief must run this manually per STANDARD.md.

### [2026-04-19] apps/coorporate renamed to apps/corporate
**Context:** Typo in directory name (double 'o') since project inception. Affected readability and potential path references.
**Decision:** Directory renamed to `apps/corporate`. Package name `@the-abyss/ferdiiskandar` was unaffected.
**Consequences:** All future references must use `apps/corporate`. AGENTS.md §4 and CONTEXT.md updated.

### [2026-04-19] packages/artificial-core renamed to packages/ai-core
**Context:** Directory name `artificial-core` conflicted with all documentation which referenced `ai-core`. Package `name` field was already `@the-abyss/ai-core`.
**Decision:** Directory renamed to `packages/ai-core` to align with package name and all documentation.
**Rejected alternatives:** Renaming package name to match directory — would break imports.
**Consequences:** Zero import breaks (package name unchanged). CODEOWNERS was already correct.

### [2026-04-19] Terraform must use modular structure for Healthcare platform
**Context:** Single `main.tf` is insufficient for a multi-division Healthcare platform with PHI workloads and multiple environments.
**Decision:** Terraform organized into `modules/` (compute, database, networking, security) and `environments/` (dev, staging, prod). Healthcare module enables PHI-hardening flags.
**Consequences:** `terraform apply` remains Chief-only per AGENTS.md §3. Modules are scaffolds — provider config must be added by Chief before any apply.

### [2026-04-19] flows/definitions/ organized into domain subdirectories
**Context:** `flows/definitions/` was empty. Flat structure would become unmanageable as flows grow.
**Decision:** Subdirectories per domain: `healthcare/`, `platform/`, `academic/`. Each domain owns its flow definitions.
**Consequences:** CI validation glob in `ci.yml` must be updated from `flows/definitions/*.json` to `flows/definitions/**/*.json` to catch all flows. (Pending — tracked in HANDOFF.md Priority 2.)

### [2026-04-13] Progressive Risk-Based Governance
**Context:** J5 "WAIT FOR GO" hard gate for all tasks created excessive friction. Agents were blocked on trivial tasks like typo fixes and file reads, overwhelming Chief with approval requests.
**Decision:** Implement Task Classification (Class A/B/C) with differentiated gates: Class A auto-approves, Class B uses checkpoint self-logging, Class C retains hard J5 protection.
**Rationale:** Not all tasks carry equal risk. Micro tasks should not require manual approval, but high-risk operations (DB, infrastructure, PHI) must remain strictly gated.
**Consequences:** AGENTS.md §2.1 now defines classification heuristics. `.agent/SESSION_STATE.md` tracks per-session GO status. Agent velocity increases while safety controls are preserved for critical operations.

### [2026-04-14] S1 & S2 — Bypass Orchestrator & Direct Agent Execution
**Tanggal:** 2026-04-14
**Keputusan:** Tidak menggunakan Orchestrator untuk tugas saat ini. Pekerjaan (termasuk referralink) langsung diserahkan ke Cursor, Codex, dan Claude.
**Alasan:** Sesuai instruksi Chief, eksekusi difokuskan langsung ke agent spesifik tanpa overhead Orchestrator untuk fase ini.
**Action:** Jen (Governor) membuat TASKS.json. Cursor, Codex, dan Claude diizinkan memulai eksekusi task P0 mereka.

### [2026-04-19] Vector Index — KnowledgeBase HNSW Index
**Tanggal:** 2026-04-19
**Status:** PENDING — membutuhkan keputusan dan eksekusi Chief
**Masalah:** `KnowledgeBase` hanya memiliki B-tree index pada `id`. Tidak ada vector index pada kolom `embedding`. Tanpa HNSW/IVFFlat index, setiap `VectorStore.query()` melakukan full sequential scan — O(n) terhadap seluruh tabel.
**Dampak:** Untuk ingest 1.5GB PDF (estimasi 50k–200k chunks), query latency akan tidak akeptabel di production.
**Keputusan yang diperlukan:** Pilih index type — HNSW (lebih cepat query, lebih lambat build) vs IVFFlat (lebih cepat build, sedikit lebih lambat query). Rekomendasi: HNSW untuk production healthcare RAG.
**Migrasi yang perlu dijalankan Chief (Class C):**
```sql
CREATE INDEX kb_embedding_hnsw_idx
ON "KnowledgeBase"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 256);
```
**Parameter rationale:** `m=24` (vs default 16) meningkatkan recall untuk data medis. `ef_construction=256` (vs minimum 64) meningkatkan recall index build ~98%+ dengan trade-off build time 2-3x lebih lambat — acceptable untuk one-time ingest. `ef_search=100` diset di query runtime (sudah diimplementasi di store.ts).

### [2026-04-20] ChatGPT Memory digunakan khusus untuk sesi Codex, SSOT tetap `.agent/`
**Context:** Chief mengizinkan penggunaan OpenAI ChatGPT Memory untuk membantu kontinuitas kerja, tetapi monorepo butuh sumber kebenaran yang audit-able dan lintas-agent.
**Decision:** Gunakan ChatGPT Memory hanya untuk preferensi kerja yang stabil pada sesi Codex (mis. format output, preferensi verifikasi), bukan sebagai SSOT. SSOT tetap: `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, `.agent/HANDOFF.md`, `.agent/LESSONS.md`, `.agent/DECISIONS.md`.
**Guardrails:** Jangan pernah menyimpan secret/token, PHI/PII, atau detail sensitif sebagai memory. Untuk diskusi sensitif gunakan Temporary Chat (tidak membaca/menulis memory).
**Consequences:** Setiap perubahan aturan kerja jangka panjang harus ditulis ke `.agent/DECISIONS.md`/`.agent/LESSONS.md`, bukan mengandalkan memory produk.

### [2026-04-20] Symptom Signals NLP canonicalized into SYMPHONY (Phase 1 complete)
**Context:** Coverage audit Gap #8 — Assist `symptom-signals.ts` was a clinical-intelligence evaluator living outside SYMPHONY. Dashboard needed canonical Indonesian symptom extraction from free-text anamnesis so downstream Phase 2 (Pattern Engine) and Phase 3 (Clinical Patterns Evaluator) can consume a single source of truth.
**Decision:** Ported as `packages/symphony/src/engine/symptom-signals.ts` — pure TypeScript, zero runtime dependencies, 19 signal matchers (fever, dyspnea, chest_pain, headache, vomit, seizure, altered_consciousness, bleeding, pallor, weakness, dizziness, syncope, diaphoresis, rash_or_angioedema, allergen_exposure, abdominal_pain, kussmaul_breathing, polyuria, neurologic_focal_deficit), 3-token left-window negation with prefixes [`tidak ada`, `tidak`, `tanpa`, `bukan`, `belum`]. `tidak sadar` handled naturally without special flag because `isNegatedAt` only scans tokens strictly LEFT of matchIndex. `pusing` intentionally co-signals headache AND dizziness (no mutex).
**Approach:** TDD, one matcher per commit, foundation of 57 pre-existing tests committed as a dedicated baseline (`9644530`) before any Phase 1 work. Lint debt inherited from foundation was resolved in two dedicated cleanup commits (`1afd058` auto-fix import order, `387d9b5` manual non-null/unused-var with explicit `throw` guards — no optional chaining, no silent failure paths).
**Consequences:** Phase 2 (pattern-engine) and Phase 3 (clinical-patterns evaluator) can now consume canonical symptom signals without reaching into Assist source. Dashboard may optionally switch from local symptom extraction to SYMPHONY's — **not started in this phase**. No Dashboard production import replacement. Adapter parity harness continues unchanged. 84/84 tests GREEN, lint PASS, typecheck PASS. Gap #8 closed.
**Reviewed by:** Chief (GO granted 2026-04-20 for Phase 1 only; Phase 2 requires fresh brainstorm + write-plan cycle before execution).

### [2026-04-22] Action Protocols canonicalized into SYMPHONY (Phase 4 local complete)
**Context:** Coverage audit marked 9 ABCDE Action Protocols as high-priority clinical gaps. Phase 3 already carried `actionProtocolId` hints on patterns, but there was no canonical SYMPHONY registry or alert-level payload for consumers.
**Decision:** Added `packages/symphony/src/engine/action-protocols.ts` as the canonical registry for 9 `PROTO_*` templates (`RESP_FAILURE`, `SHOCK`, `SEPSIS`, `ANAPHYLAXIS`, `ACS`, `STROKE`, `DKA_HHS`, `HYPOGLYCEMIA`, `CARDIAC_ARREST`). Public contract widened with `SymphonyActionProtocol*` types plus additive `SymphonyAlert.actionProtocolId` and `SymphonyAlert.actionProtocol`. Both `evaluateClinicalPatterns()` and `adaptAssistPatternToSymphonyAlert()` now hydrate canonical protocol payloads through the same registry.
**Rationale:** Keeps SYMPHONY as the single clinical source of truth while preserving Phase 3 parity semantics. Consumers receive structured, typed action guidance without re-implementing protocol text or hard-coding `PROTO_*` lookups.
**Consequences:** `SYMPHONY_CONTRACT_VERSION` bumped from `0.2.0` to `0.3.0`. Verification on 2026-04-22: `pnpm --filter @the-abyss/symphony test` PASS (210/210), `typecheck` PASS, `lint` PASS. Gate taxonomy remains deferred to Phase 5; local gates `GATE_11_ACS`, `GATE_12_STROKE`, `GATE_13_ANEMIA_BLEED` are unchanged.

### [2026-04-22] Gate taxonomy reconciled by additive promotion (Phase 5 local complete)
**Context:** Phase 3 still depended on package-local gates `GATE_11_ACS`, `GATE_12_STROKE`, `GATE_13_ANEMIA_BLEED`, which kept disease slices outside the public `SymphonySafetyGate` contract and prevented canonical `gate` emission on pattern alerts.
**Decision:** Chosen path = additive promotion. `SymphonySafetyGate` now includes all three disease slices, while existing mechanism-named gates remain untouched. `clinical-patterns-definitions.ts` no longer uses a local gate union/workaround, and both `evaluateClinicalPatterns()` plus `adaptAssistPatternToSymphonyAlert()` now emit canonical `gate` values.
**Rationale:** This preserves backwards compatibility, matches the existing 70 CP registry, avoids a large consumer rename, and satisfies the taxonomy gap without reopening Phase 3 parity architecture.
**Consequences:** `SYMPHONY_CONTRACT_VERSION` bumped from `0.3.0` to `0.4.0`. Verification on 2026-04-22: `pnpm --filter @the-abyss/symphony test` PASS (210/210), `typecheck` PASS, `lint` PASS, and Dashboard `pnpm run test:symphony:route-parity` PASS 76/76 with `routeParityStatus=partial` and `productionImportReplacementAllowed=false`.

### [2026-04-22] Phase 6 canonicalized with additive trajectory detail + single classifier module
**Context:** Phase 6 needed to close prediction/classifier gaps without reopening Phase 3 route parity or violating the package-session constraint against multiple new files. Dashboard already had deterministic prediction and classifier helpers, but SYMPHONY only exposed coarse linear TTC and no canonical classifier surface.
**Decision:** Added treatment-response detection and quadratic TTC detail directly into `packages/symphony/src/engine/trajectory.ts`, preserving existing `timeToCriticalEstimate` while adding `timeToCriticalDetail` and `treatmentResponse`. Canonicalized chronic-disease, hypertension, glucose, and AVPU/GCS helpers into one new module `packages/symphony/src/engine/classifiers.ts` instead of separate classifier + mapper files.
**Rationale:** This keeps the change additive, avoids backward-incompatible rewrites of existing trajectory consumers, honors the one-new-file session discipline, and creates a single deterministic export surface for downstream Dashboard/Assist adoption.
**Consequences:** `SYMPHONY_CONTRACT_VERSION` bumped from `0.4.0` to `0.5.0`. Verification on 2026-04-22: `pnpm --filter @the-abyss/symphony test` PASS (213/213), `typecheck` PASS, `lint` PASS, and Dashboard `pnpm run test:symphony:route-parity` PASS 76/76 with `routeParityStatus=partial` and `productionImportReplacementAllowed=false`.
