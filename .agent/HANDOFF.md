# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. -->
<!-- Last updated: 2026-04-22 16:54 · Agent: Claude · Session: symphony-phase-3-fixes -->

---

## Authority Reminder
**AGENTS.md is supreme authority.** This file is operational context only.
Before acting: read CONTEXT.md → PROGRESS.md → this file → LESSONS.md → DECISIONS.md.

---

## Quick Orient (for new thread)

**Branch:** `abyss-core` at `39db0cb` · **~45 commits ahead of `origin/abyss-core`** · **NOT PUSHED**
**Working tree:** Avvcenna rebrand in-progress (Chief owns) + misc drift — do NOT touch
**Primary mission:** SYMPHONY Canonicalization Migration (7 phases, Chief-locked order)
**Phases 1-3 done + quality-gated** · Phase 4 = next

---

## Primary Mission: SYMPHONY Canonicalization

**Hierarchy (locked):** SYMPHONY = canonical parent · Dashboard + Assist = consumers/hosts

**Phase Plan:**
| # | Scope | Status |
|---|---|---|
| 1 | Symptom Signals NLP (19 matchers, 3-token negation) | ✅ `a587b41` |
| 2 | Pattern Engine generic evaluator | ✅ `0a471bb` (contract v0.2.0) |
| 3 | Clinical Patterns Evaluator (70 CP native SYMPHONY) | ✅ `8fb9d1d` + `39db0cb` (208/208, quality-gated) |
| 4 | Action Protocols (ABCDE) | ⬜ next |
| 5 | Gate taxonomy reconciliation (ACS/Stroke/Anemia-Bleed) | ⬜ |
| 6 | Prediction + classifier refinements | ⬜ |
| 7 | Pharmacology decision surface (SYMPHONY vs @the-abyss/clinical-references) | ⬜ |

**Baseline reports** (commit `93e6f94`):
- `.agent/reports/2026-04-20-symphony-alignment.md` — Class A read-only verification
- `.agent/reports/2026-04-20-symphony-coverage-audit.md` — coverage gap inventory

**Contract version:** `SYMPHONY_CONTRACT_VERSION = '0.2.0'` at `packages/shared-types/src/symphony.ts` (bumped post-Phase-2, commit `0a471bb`).

**Phase 4 entry point:** Action Protocols ABCDE — attach `PROTO_*` IDs to clinical pattern evaluator output. Await Chief GO.

**Phase 3 quality gate closed:** `SymphonySymptomContext` (27 flags), `SymphonyEvaluablePattern` generic, zero `as unknown as` casts, deep-equal parity on 70 CPs.

---

## This Session's Commits (2026-04-22, not pushed)

**Phase 2 — Pattern Engine (4 commits):**
- `97ea8c2` feat(symphony): Phase 2 pattern engine — generic evaluator
- `0a68614` feat(symphony): Phase 2 pattern engine — integration fixtures
- `31e13ef` feat(shared-types): promote Phase 2 pattern engine types to public contract
- `0a471bb` chore(symphony): bump SYMPHONY_CONTRACT_VERSION to 0.2.0

**Phase 3 — Clinical Patterns Evaluator (2 commits):**
- `8fb9d1d` feat(symphony): Phase 3 — native clinical patterns evaluator (70 CP rules)
- `39db0cb` fix(symphony): Phase 3 completion — contract, gate boundary, parity gate
  - `SymphonySymptomContext` (27 flags) — consumers no longer need wild casts
  - `SymphonyEvaluablePattern` generic — `as unknown as` cast count = 0
  - `SymphonyLocalClinicalPattern` removed from public index — gate boundary sealed
  - Parity suite: deep-equal `{id, severity, title, source, acknowledged}` on all 70 CPs
  - `clinical-patterns-definitions.ts` — DRY converter + SYMPHONY_CLINICAL_PATTERNS registry
  - `clinical-patterns.ts` — evaluateClinicalPatterns() + clinicalPatternMatchToSymphonyAlert()
  - 2 test files: 85 unit + 72 parity = 208/208 green
  - Plan doc: `docs/superpowers/plans/2026-04-22-symphony-phase-3-clinical-patterns.md`

**Prior session scripts (still active):**
- `scripts/generate-functional-docs.js`, `scripts/generate-release-notes.js`
- `.github/workflows/generate-documentation.yml`

---

## Known Entanglements (DO NOT TOUCH in new thread)

1. **Avvcenna rebrand in working tree** — Chief's in-progress work. Files include `pnpm-lock.yaml` (`Avvcenna+-*` → `avvcenna-*` rename), `apps/community/avvcenna-memory/**`, dan misc package.json renames. Rebrand spec: `docs/superpowers/specs/2026-04-19-avvcenna-rebranding-design.md`. **Wait for Chief to commit rebrand before adding `@microsoft/tsdoc` formal devDep.**

2. **Orphan `@microsoft/tsdoc` in `pnpm-lock.yaml`** — 6 entries (0.14.2 + 0.16.0), leftover dari Cursor `pnpm add` yang tidak ikut di-revert. Tidak declared di package.json manapun. Left as-is per Opsi 2 decision (tsdoc deferred).

3. **2 pre-existing stashes** (bukan Claude punya):
   - `stash@{0}`: "On abyss-core: pre-rescue stale Avvcenna+ progress log"
   - `stash@{1}`: "WIP on abyss-core: a70d601 docs(readme): update GitHub URLs to Avvicenna account"
   Chief's work. Do NOT `stash pop` these without explicit instruction.

4. **`packages/symphony/.agent/sessions/2026-04-20.md`** — hook bug artifact (wrong location). Chief: leave as-is, fix hook separately.

5. **Many unrelated working tree drift** — `.env.example`, `.gitignore`, `AGENTS.md`, `packages/vector-store/**`, `infrastructure/terraform/**`, `tsconfig.json`, plus untracked `docs/superpowers/`, `docs/features/`, `docs/technical/` (generated artifacts), `.cursor/`, `.clinerules`, `.tdad/`, dll. Multiple parallel work streams. Do NOT blanket-commit.

---

## Decisions Reached This Session

- **Jalur A (SYMPHONY) vs Jalur B (Docs automation)** separated as parallel tracks on same branch. Post-Cursor failures, Claude took over Jalur B (Opsi B).
- **Opsi 2 locked:** `@microsoft/tsdoc` formal dependency add **deferred** sampai Avvcenna rebrand committed. Tidak bisa clean tsdoc-only commit sementara rebrand drift masih di working tree (pnpm resolves everything together).
- **TSDoc generator dropped entirely** (`d770d72`) — Chief decision setelah frustasi dengan dependency mess. Hanya functional-docs + release-notes generators tersisa.
- **Push hold active** — abyss-core is 37 commits ahead of origin tapi Chief belum authorize push. Feature branch, jadi push aman saat siap.

---

## Incident Context (still active lock)

From prior Codex session:
- **Lock:** `packages/database` is NOT healthcare DB migration target. Platform-level only. Healthcare apps own independent databases.
- **Hierarchy lock:** SYMPHONY parent; Dashboard + Assist = consumers.
- **No DB destructive actions** occurred (no reset, drop, migration apply, HNSW index, ingest).
- Full incident detail: `.agent/PROGRESS.archive.md`, prior HANDOFF.md versions di git history.

---

## Next Action Options (Chief choose)

1. **Phase 4 GO** — Action Protocols ABCDE, attach `PROTO_*` IDs to evaluator output
2. **Push `abyss-core`** → `git push origin abyss-core` (~44 commits, feature branch, aman)
3. **Commit Avvcenna rebrand** (Chief's in-progress work) — separate thread/agent
4. **Break / istirahat** — all state preserved locally

---

## Do-Not-Touch Contract

- ❌ Tidak commit Avvcenna rebrand working tree (Chief own)
- ❌ Tidak pop stash@{0} atau stash@{1} (Chief's pre-existing)
- ❌ Tidak push ke remote tanpa Chief explicit GO
- ❌ Tidak touch `packages/database` sebagai healthcare target (lock dari Codex incident)
- ❌ Tidak `git add .` / `-A` — selalu explicit file
- ❌ Tidak modify `.claude/settings.json` atau hook config
- ❌ Tidak skip GUARD-1 / JET-5 / JET-7

---

**Fresh thread protocol:** Read CONTEXT → PROGRESS → this file → LESSONS → DECISIONS. Output CONTEXT LOADED confirmation. Wait for Chief instruction. Do not assume direction from this handoff alone.
