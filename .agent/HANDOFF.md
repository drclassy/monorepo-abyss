# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. -->
<!-- Last updated: 2026-04-29 · Agent: GPT-5.4 · Session: consumer-trial-readiness-reset -->

---

## Authority Reminder
**AGENTS.md is supreme authority.** This file is operational context only.
Before acting: read CONTEXT.md → PROGRESS.md → this file → LESSONS.md → DECISIONS.md.

---

## Quick Orient (for new thread)

**Branch:** `master` · repo topology sudah kembali tunggal, bersih, dan aktif di jalur `master`; engine close-out anchored on `255c50f`
**Working tree:** Classy rebrand in-progress (Chief owns) + misc drift — do NOT touch
**Cursor IDE (2026-04-28):** User-level + profile `Classy` sudah di-hardten per audit plan — Claude Code bypass permission dimatikan, wrapper dihapus, overlap extension dikurangi; detail di `.agent/sessions/2026-04-28.md`.
**Primary mission:**
1. **Consumer Trial Readiness** — move from core-engine completion into operational rollout preparation.
2. **Dashboard / ASSIST readiness** — prepare consumer adoption in the correct order: Dashboard first, ASSIST second.
3. **Shadow telemetry + limited trial** — lock observability and controlled rollout criteria before broader adoption.
4. **Retrieval lane is supporting only** — RAG packages may support grounding/retrieval, but must not become parallel clinical engines.
5. **Legacy lock:** `packages/ai-core` has been retired locally on 2026-04-25; do not recreate or depend on it again.

**Session addendum (2026-04-29):**
- Current working thread is the Google / Vertex / Gemini exit cleanup.
- Keep that effort separated from broader consumer trial readiness work.
- Do not start runtime removal or package rewrites until Chief gives explicit `GO` for the technical cutover.

**Session addendum (2026-04-30):**
- Cursor rules now include an always-on Chief directive bridge at `.cursor/rules/05-chief-directive-mode.mdc`.
- Future Cursor sessions should front-load latest official notes when relevant, respond in Bahasa Indonesia to Chief, and stop for explicit `GO` before implementation.
- AGENTS.md corrected (2026-04-30 19:06) to clarify `packages/database` scope: it is platform-level only; healthcare apps own their databases (see `.agent/DECISIONS.md` 2026-04-27).

---

## Active Task

**Consumer Trial Readiness**

`@the-abyss/symphony` is now considered complete for the planned AADI V2 core reasoning scope. The next lane is operational: prepare consumers, validate telemetry posture, and define a controlled limited-trial envelope. Do not reopen foundation-build framing unless Chief explicitly changes scope.

### Closed core deliverables
- Clinical facts, syndrome classification, diagnosis packs, native differential, reasoning arbiter, explainability, and clinical disposition are all closed in `@the-abyss/symphony`.
- `assess.ts` integration, shadow comparison, and parity verification are closed.
- Orchestrator now uses `assessSymphonyInput()` as the platform thin-client path.
- FHIR Bundle interop promotion lane is formalized with `@the-abyss/fhir-engine` as bounded structural validation home.
- CDS Hooks is formalized and intentionally remains in `packages/symphony`.
- Hardening patch `882775a` closed PHI-safe DLQ, removed silent `vertex-rag` fallback behavior, and tightened saga persistence typing.

### Verification baseline
- `@the-abyss/symphony` test → 373/373 PASS
- `@the-abyss/orchestrator` test → 46/46 PASS
- `@the-abyss/orchestrator` typecheck → PASS
- `@the-abyss/fhir-engine` test → 64/64 PASS
- `@the-abyss/vertex-rag` test → 5/5 PASS before retirement

### Priority lanes
1. **Dashboard readiness**
   - define adoption seam over current SYMPHONY outputs
   - confirm no legacy mock reasoning remains in the Dashboard path
   - prepare rollout checklist before turning on broader consumption
2. **ASSIST readiness**
   - start only after Dashboard readiness is explicit
   - treat ASSIST as the second consumer, not the proving ground
3. **Shadow telemetry**
   - define metrics/logs needed to observe parity, traffic-light behavior, alert semantics, and disposition drift
   - require operational visibility before broader rollout claims
4. **Limited trial**
   - define entry criteria, observation window, rollback posture, and success/failure thresholds
   - keep trial narrow and controlled; this is not general availability

---

## Boundary Lock

- `@the-abyss/symphony` remains the only canonical clinical reasoning engine.
- `@the-abyss/fhir-engine` remains the bounded structural validation home and FHIR Bundle assembly lane, not a reasoning package.
- CDS Hooks remains in `packages/symphony` because it is workflow-semantics-bound.
- `@the-abyss/sentra-rag`, `@the-abyss/vector-store`, and `@the-abyss/literature-harvester` stay retrieval-side only.
- Do not reframe rollout work as a reason to rebuild the engine foundation.

---

## Immediate Next Steps

1. Write or refresh the operational checklist for **Dashboard readiness**.
2. Define the **shadow telemetry** set required for consumer rollout confidence.
3. Prepare the **limited trial** envelope and rollback expectations.
4. Only after the first three are explicit, frame **ASSIST readiness** as the next consumer lane.

---

## Known Entanglements (DO NOT TOUCH)

1. **Classy rebrand in working tree** — Chief's in-progress. Do NOT commit rebrand files.
2. **2 pre-existing stashes** — bukan Claude punya. Do NOT `stash pop`.
3. **`packages/symphony/.agent/` misplaced hook session artifact** — historical bug residue. Leave as-is unless Chief explicitly orders archive/removal.
4. **Unrelated working tree drift** — `.env.example`, `.gitignore`, `AGENTS.md`, infra Terraform, dll. Do NOT `git add .` / `-A`.
5. **Push hold active** — Chief belum authorize push ke origin.

---

## Incident Context (active lock)

- **Lock:** `packages/database` bukan healthcare DB migration target.
- **Hierarchy lock:** SYMPHONY parent; Dashboard + Assist = consumers.
- **Operational phase lock:** current lane = consumer trial readiness, not foundation rebuild.
- **sentra-rag DB:** bukan `packages/database` — Neon connection langsung di `.env` lokal.

---

## Next Action Options (Chief choose)

1. **Dashboard readiness** — make the first consumer rollout-ready.
2. **Shadow telemetry definition** — lock the observability surface before rollout claims.
3. **Limited trial gating** — define the narrow operational trial envelope.
4. **ASSIST readiness** — prepare second-consumer adoption only after Dashboard and telemetry are stable.

---

## Do-Not-Touch Contract

- ❌ Tidak commit Classy rebrand working tree (Chief own)
- ❌ Tidak pop stash@{0} atau stash@{1}
- ❌ Tidak push ke remote tanpa Chief explicit GO
- ❌ Tidak touch `packages/database` sebagai healthcare target
- ❌ Tidak `git add .` / `-A`
- ❌ Tidak skip GUARD-1 / JET-5 / JET-7

---

**Fresh thread protocol:** Read CONTEXT → PROGRESS → this file → LESSONS → DECISIONS. Output CONTEXT LOADED confirmation. Wait for Chief instruction.


---
## 2026-04-25 Architecture Alignment Addendum

**New clarity from package review:**

- `@the-abyss/symphony` remains the only canonical clinical reasoning engine.
- `@the-abyss/clinical-references` remains the sibling reference layer.
- `@the-abyss/shared-types` remains the contract backbone.
- `@the-abyss/sentra-rag`, `@the-abyss/vector-store`, and `@the-abyss/literature-harvester` are retrieval-side packages only. They must not evolve into parallel clinical engines.

**Main risk now is not SYMPHONY itself.** Main risk is retrieval-boundary drift:

1. `sentra-rag` already owns local-first ingest/query orchestration.
2. `vector-store` should stay a storage/index abstraction, not another orchestrator.
3. `literature-harvester` stays acquisition-only and feeds corpus readiness, not diagnosis authority.

**Operational consequence for next agent:**

- Do **not** start Dashboard or ASSIST rewiring from any retrieval package.
- The next strategic task is no longer diagnosis-engine framing; it is **consumer trial readiness** on top of the now-closed engine.
- Only after readiness and telemetry are locked should consumer rewiring begin:
  1. Dashboard first
  2. ASSIST second
