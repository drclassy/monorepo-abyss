# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. -->
<!-- Last updated: 2026-04-20 22:15 · Agent: Claude · Session: jalur-b-takeover-close -->

---

## Authority Reminder
**AGENTS.md is supreme authority.** This file is operational context only.
Before acting: read CONTEXT.md → PROGRESS.md → this file → LESSONS.md → DECISIONS.md.

---

## Quick Orient (for new thread)

**Branch:** `abyss-core` at `d770d72` · **37 commits ahead of `origin/abyss-core`** · **NOT PUSHED**
**Working tree:** Avvcenna rebrand in-progress (Chief owns) + misc drift — do NOT touch
**Primary mission:** SYMPHONY Canonicalization Migration (7 phases, Chief-locked order)
**Phase 1 done** (2026-04-20, `a587b41`) · Phase 2 = next

---

## Primary Mission: SYMPHONY Canonicalization

**Hierarchy (locked):** SYMPHONY = canonical parent · Dashboard + Assist = consumers/hosts

**Phase Plan:**
| # | Scope | Status |
|---|---|---|
| 1 | Symptom Signals NLP (19 matchers, 3-token negation) | ✅ `a587b41` |
| 2 | Pattern Engine generic evaluator | ⬜ next |
| 3 | Clinical Patterns Evaluator (70 CP native SYMPHONY) | ⬜ |
| 4 | Action Protocols (ABCDE) | ⬜ |
| 5 | Gate taxonomy reconciliation (ACS/Stroke/Anemia-Bleed) | ⬜ |
| 6 | Prediction + classifier refinements | ⬜ |
| 7 | Pharmacology decision surface (SYMPHONY vs @the-abyss/clinical-references) | ⬜ |

**Baseline reports** (commit `93e6f94`):
- `.agent/reports/2026-04-20-symphony-alignment.md` — Class A read-only verification
- `.agent/reports/2026-04-20-symphony-coverage-audit.md` — coverage gap inventory

**Contract version:** `SYMPHONY_CONTRACT_VERSION = '0.1.4'` at `packages/shared-types/src/symphony.ts:1` (bumped post-Phase-1, commit `8150fd7`).

**Phase 2 entry point:** belum di-brainstorm. Saat Chief siap, gunakan `/avcn-brainstorm` dengan baseline reports di atas sebagai input.

---

## This Session's Commits (2026-04-20, not pushed)

**Housekeeping (Phase 1 follow-ups):**
- `8150fd7` chore(symphony): bump contract version to 0.1.4
- `93e6f94` docs(agent): sync state + alignment reports
- `6b21430` docs(agent): archive MASTER_CONTEXT_2026-04-19

**Cursor parallel work (reverted):**
- `8431e3d`, `a7bd65c`, `2548e9b` — Cursor docs automation attempts (bugged)
- `f471402`, `52704f4`, `e959d95` — revert commits

**Jalur B takeover (Claude, 5 commits):**
- `dc777da` feat(docs): TSDoc markdown generator *(removed in d770d72)*
- `bdbbc21` feat(docs): functional feature docs generator
- `f11e6c7` feat(docs): release notes generator placeholder
- `2890972` feat(ci): docs automation workflow (PR-not-push)
- `d770d72` chore(docs): drop TSDoc generator (deferred)

**Final active scripts:** `scripts/generate-functional-docs.js`, `scripts/generate-release-notes.js`
**Workflow:** `.github/workflows/generate-documentation.yml` (PR-not-push pattern, no TSDoc step)

---

## Known Entanglements (DO NOT TOUCH in new thread)

1. **Avvcenna rebrand in working tree** — Chief's in-progress work. Files include `pnpm-lock.yaml` (`claudesy-*` → `avvcenna-*` rename), `apps/community/avvcenna-memory/**`, dan misc package.json renames. Rebrand spec: `docs/superpowers/specs/2026-04-19-avvcenna-rebranding-design.md`. **Wait for Chief to commit rebrand before adding `@microsoft/tsdoc` formal devDep.**

2. **Orphan `@microsoft/tsdoc` in `pnpm-lock.yaml`** — 6 entries (0.14.2 + 0.16.0), leftover dari Cursor `pnpm add` yang tidak ikut di-revert. Tidak declared di package.json manapun. Left as-is per Opsi 2 decision (tsdoc deferred).

3. **2 pre-existing stashes** (bukan Claude punya):
   - `stash@{0}`: "On abyss-core: pre-rescue stale claudesy progress log"
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

1. **Push `abyss-core`** → `git push origin abyss-core` (37 commits, feature branch, aman)
2. **Commit Avvcenna rebrand** (Chief's in-progress work) — separate thread/agent
3. **Phase 2 brainstorm** — Pattern Engine generic evaluator (use baseline reports as input)
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
