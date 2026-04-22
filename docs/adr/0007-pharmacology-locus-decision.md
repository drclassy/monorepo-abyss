# ADR 0007: Pharmacology Locus Decision

- Status: Accepted
- Date: 2026-04-22
- Deciders: Chief, Codex/Dexton
- Related: `docs/superpowers/plans/2026-04-20-symphony-canonicalization.md`, `.agent/reports/2026-04-20-symphony-coverage-audit.md`

## Context

Phase 7 closes the pharmacology/reference architecture question behind coverage gaps #11-#15:

- `dosage-database.ts`
- `ddi-checker.ts` (173K interaction pairs)
- `epidemiology-weights.ts`
- `pharmacotherapy-reasoner.ts`
- `traffic-light.ts`

The question is not whether these assets matter, but where they should live so that:

- `@the-abyss/symphony` stays a lean clinical reasoning engine
- frequently updated reference datasets keep provenance and licensing boundaries
- Dashboard and Assist can share the same deterministic reference logic
- safety escalation logic remains clinically authoritative

Latest best-practice notes that informed this ADR:

- FDA keeps current drug-interaction labeling guidance under a dedicated, living guidance surface, reinforcing that interaction knowledge changes over time and needs provenance rather than hard-coded static assumptions. Source: FDA Drug Interactions guidance hub, accessed 2026-04-22: `https://www.fda.gov/drugs/drug-interactions-labeling/drug-interactions-relevant-regulatory-guidance-and-policy-documents`
- DailyMed describes itself as the NLM source for the most recent labeling in current use, which supports treating dosage/interaction knowledge as versioned reference content, not embedding it deep inside core engine logic. Source: DailyMed, accessed 2026-04-22: `https://dailymed.nlm.nih.gov/`
- ISMP continues to maintain a dedicated high-alert medication list, supporting separation between raw medication-reference knowledge and the escalation rules that consume it. Source: ISMP High-Alert Medications list, accessed 2026-04-22: `https://www.ismp.org/system/files/resources/2024-01/ISMP_HighAlert_AcuteCare_List_010924_MS5760.pdf`

## Decision

Adopt a split locus:

1. Create sibling shared package `@the-abyss/clinical-references`
2. Keep `traffic-light` in `@the-abyss/symphony`

### Assets assigned to `@the-abyss/clinical-references`

- DDI checker
- Dosage database FKTP
- Epidemiology weights Puskesmas
- Pharmacotherapy reasoner

These are reference-heavy or data-heavy assets with higher update cadence, provenance burden, and likely licensing review needs.

### Asset assigned to `@the-abyss/symphony`

- Traffic-Light Safety Gate

Traffic-light is an escalation and decision-safety layer, not merely reference content. It combines clinical state, uncertainty, and pharmacology outputs into a final safety posture. That makes it part of the canonical clinical engine, even if it consumes data from `@the-abyss/clinical-references`.

## Rationale

### Why not keep all pharmacology inside SYMPHONY?

- It would bloat the core engine with large mutable reference data
- It would mix stable reasoning logic with fast-changing label/reference content
- It would make provenance, licensing, and refresh cadence harder to govern
- It would widen the dependency surface for all SYMPHONY consumers, even those that do not need pharmacology features

### Why not keep traffic-light in the sibling package too?

- Traffic-light is an escalation gate, not just a lookup
- Its job is to synthesize pharmacology warnings with diagnosis confidence, red flags, and acute-on-chronic logic
- Keeping it in SYMPHONY preserves a single canonical safety-escalation authority

## Architectural Rules

1. `@the-abyss/clinical-references` MUST NOT depend on `@the-abyss/symphony`
2. `@the-abyss/symphony` MAY depend on `@the-abyss/clinical-references` via narrow deterministic interfaces
3. Dashboard and Assist MAY consume `@the-abyss/clinical-references` directly for read-only explanation or UI needs, but MUST NOT reimplement core reference logic
4. Traffic-light logic MUST stay in SYMPHONY and consume normalized outputs, not raw giant datasets
5. No raw 173K DDI blob should be dropped into SYMPHONY proper

## Data Ownership Decision

Short term:

- Do not commit large third-party data artifacts until license and attribution review is complete
- Allow `@the-abyss/clinical-references` to start with contracts, loaders, adapters, and small test fixtures

Medium term:

- Store normalized versioned reference artifacts in the sibling package only if licensing allows repository distribution
- If licensing does not allow raw redistribution, keep only schema/loader code and require controlled ingestion from approved source artifacts

## Migration Roadmap

### Phase 7b — `@the-abyss/clinical-references` scaffold

- Create package scaffold
- Define public contracts for:
  - DDI severity/result
  - dosage recommendation/result
  - epidemiology prior weights
  - pharmacotherapy recommendation/result
- Add provenance and attribution manifest
- Add fixture-based tests with tiny synthetic datasets only

### Phase 7c — SYMPHONY traffic-light canonicalization

- Keep rule engine in SYMPHONY
- Replace Assist-local traffic-light inputs with normalized outputs from `@the-abyss/clinical-references`
- Preserve escalation-only semantics: `GREEN -> YELLOW -> RED`, never downgrade

## Consequences

Positive:

- Clear separation between reference data and clinical reasoning
- Better licensing/provenance governance
- Smaller SYMPHONY core and cleaner dependency graph
- Easier multi-host reuse by Dashboard and Assist

Tradeoffs:

- One extra package boundary to maintain
- Need explicit contract design between references and SYMPHONY
- Traffic-light implementation must carefully avoid leaking package responsibilities

## Outcome

Phase 7 decision is complete with this ADR.

Next implementation track after approval:

- scaffold `@the-abyss/clinical-references`
- then canonicalize traffic-light into SYMPHONY on top of that package
