# Sentra Context Capsule v0.1 Implementation Plan

> **For agentic workers:** execute this plan task-by-task with small, reviewable changes. Keep scope bounded to the single local HTML artifact described in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md). Do not expand this mission into a web app, scanner, sync service, or package workspace feature.

**Goal:** Build a reliable local single-file context composition tool named `sentra-context-engine.html` that Chief can open directly via `file://`, use to select context blocks and exactly one agent role, and copy a clean markdown context capsule in seconds.

**Architecture:** The implementation stays inside one self-contained HTML file with three explicit layers in the same artifact: a design-token CSS layer, a data-definition JavaScript layer, and a deterministic interaction/composer layer. Context blocks, preset mappings, agent roles, metadata, warning states, and composer output must all be driven from static in-file objects so the tool remains maintainable, editable by hand, and independent from any server, build pipeline, package manager, or external runtime.

**Tech Stack:** HTML, CSS, vanilla JavaScript, browser-native clipboard API with fallback, inline SVG/icons only if needed, local file execution in Chrome, no dependencies.

---

## Baseline Documents (MUST READ before implementing)

1. [`AGENTS.md`](../../../AGENTS.md)
2. [`.agent/README.md`](../../../.agent/README.md)
3. [`.agent/CONTEXT.md`](../../../.agent/CONTEXT.md)
4. [`.agent/PROGRESS.md`](../../../.agent/PROGRESS.md)
5. [`.agent/HANDOFF.md`](../../../.agent/HANDOFF.md)
6. [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)
7. [`docs/guides/implementation-plans/009-2026-04-29-cds-hooks-formalization-implementation.md`](./009-2026-04-29-cds-hooks-formalization-implementation.md)
8. [`docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md`](./008-2026-04-29-fhir-engine-resource-validation-implementation.md)
9. [`docs/guides/implementation-plans/006-2026-04-27-aadi-v2-implementation.md`](./006-2026-04-27-aadi-v2-implementation.md)
10. [`docs/handbook/classy-cursor.html`](../../handbook/classy-cursor.html)

---

## Scope Check

### In scope

- Build one standalone local HTML tool matching the product intent in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).
- Render the required header, metadata panel, preset buttons, context block grid, role selector, composer, and action area.
- Encode the eight required context blocks, three agent roles, and five preset capsule modes as static JavaScript data objects.
- Implement deterministic select/deselect behavior, single-role enforcement, live composer generation, copy-to-clipboard with fallback, clear/reset, and freshness warning logic.
- Pass the acceptance criteria and manual tests defined in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).

### Explicitly out of scope

- No filesystem watcher.
- No Node.js scanner.
- No automatic sync with `genesis-tracker`.
- No MCP.
- No RAG.
- No PDF export.
- No markdown file export.
- No authentication.
- No cloud sync.
- No multi-project support.
- No live connection to Claude Code.

These out-of-scope items come directly from [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md) and must not be backfilled opportunistically during v0.1 implementation.

---

## Delivery Boundary Note

The implementation target path in the spec is outside the current repo workspace:

```txt
D:\Devop\clausytorium\Genesis Framework\sentra-context-engine.html
```

This plan is repo-local documentation only. The actual implementation mission must explicitly confirm that writing outside the current workspace is authorized and technically available. If that boundary is not available in the execution session, the mission should stop and report the delivery blocker rather than silently redirecting the artifact to another location.

---

## Best-Practice Notes

- Favor reliability over cleverness. The tool is a local composition utility, not an agent runtime.
- Keep all dynamic behavior deterministic and data-driven; never derive final composer output by scraping the DOM.
- Prefer explicit arrays and maps for blocks, roles, and presets over inferred relationships.
- Treat browser-local behavior as the primary execution environment; clipboard fallback and no-network posture are not optional polish, they are core functionality.
- Keep the visual system warm, dark, and operationally calm, borrowing layout discipline from [`docs/handbook/classy-cursor.html`](../../handbook/classy-cursor.html) while remaining faithful to the tokens specified in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).

---

## Non-Negotiable Constraints

- Implement as exactly one self-contained HTML file.
- Do not introduce React, Next.js, Vite, npm, pnpm install steps, CDN usage, external font loading, backend code, database code, or build tooling.
- Do not read, copy, include, summarize, or expose `.env`, credentials, keys, PHI, PII, tokens, or other sensitive files listed in the spec.
- Do not rely on external network access at render time.
- Do not modify unrelated project files.
- Do not create the optional notes file unless implementation details genuinely require it.
- Do not assume `genesis-tracker.html` exists locally in the repo; use it only as a visual direction signal, not as an implementation dependency.
- Preserve accessibility minimums: real buttons, visible focus states, `aria-pressed`, labeled composer, and non-color-only selection cues.
- Copy All must be blocked when no role is selected.
- Block order in the composer must remain stable.

---

## Spec Coverage Gate

Before closing the implementation mission, confirm each requirement family below is explicitly satisfied:

- [ ] Product title and subtitle match the spec.
- [ ] Metadata panel shows last scan, generated by, project root, context status, and stale warning when relevant.
- [ ] All 8 context blocks are visible and data-driven.
- [ ] All 3 agent roles are visible and single-select.
- [ ] All 5 preset capsule modes exist and select the correct block bundles.
- [ ] Composer output follows the exact markdown structure defined in the spec.
- [ ] Copy All uses clipboard API first and fallback second.
- [ ] Clear resets blocks, preset, role, composer, and visual state.
- [ ] Freshness logic handles fresh, stale, and invalid timestamp cases.
- [ ] Interaction states match the required border, opacity, and role-button active styling.
- [ ] Accessibility minimums are present.
- [ ] Responsive layout works for desktop, laptop, and side-by-side usage.
- [ ] No secrets or sensitive content are embedded.
- [ ] No unrelated files are modified.

---

## Verification Gate

Before closing any task group in this plan:

- [ ] Open the artifact locally through Chrome using `file://`.
- [ ] Confirm no runtime console error for the changed behavior.
- [ ] Re-test the affected UI path manually.
- [ ] Confirm no network dependency was introduced.

Before final closeout:

- [ ] Run the full manual test sequence from [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).
- [ ] Re-check every acceptance criterion from [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).
- [ ] Produce the final report using the exact required format in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).
- [ ] Confirm the final artifact includes no sensitive values and no unrelated edits.

Note: because this mission targets a standalone local HTML file rather than a pnpm package, the primary verification is browser-manual validation. Repo-wide `pnpm` checks apply only if repo files are changed as part of the documentation or support workflow.

---

## Current Baseline

At the start of this plan:

- The full functional specification already exists in [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md).
- The UI structure, context content, preset logic, accessibility minimums, stale warning behavior, acceptance criteria, and manual tests are already spelled out.
- There is no confirmed final `sentra-context-engine.html` artifact yet.
- The closest in-repo visual reference is [`docs/handbook/classy-cursor.html`](../../handbook/classy-cursor.html), which provides useful dark-panel structure and static HTML patterns but must be simplified to fit this tool's reliability-first scope.
- The main execution risk is delivery location, not feature ambiguity.

---

## UI and Data Architecture

### Recommended internal structure inside the HTML file

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Sentra Context Capsule</title>
  <style>
    /* tokens */
    /* base */
    /* panels */
    /* block cards */
    /* role buttons */
    /* presets */
    /* composer */
    /* action buttons */
    /* responsive */
  </style>
</head>
<body>
  <main>
    <!-- header -->
    <!-- metadata -->
    <!-- presets -->
    <!-- blocks -->
    <!-- roles -->
    <!-- composer -->
    <!-- actions -->
  </main>

  <script>
    const METADATA = {}
    const CONTEXT_BLOCKS = []
    const AGENT_ROLES = []
    const PRESETS = []

    function renderBlocks() {}
    function renderRoles() {}
    function renderPresets() {}
    function toggleBlock(id) {}
    function selectRole(id) {}
    function applyPreset(id) {}
    function buildComposerText() {}
    function updateComposer() {}
    function copyAll() {}
    function clearAll() {}
    function checkFreshness() {}
    function init() {}

    init()
  </script>
</body>
</html>
```

### Data ownership rules

- `METADATA` owns `lastScan`, `generatedBy`, `projectRoot`, and derived freshness state.
- `CONTEXT_BLOCKS` owns the eight required blocks with stable `defaultOrder`.
- `AGENT_ROLES` owns the three role cards and their full role content.
- `PRESETS` owns only block selection bundles and presentation copy; it must not auto-select a role.
- Runtime state should be kept in one explicit object, for example selected block IDs, selected role ID, active preset ID, and transient status flags.

### Composer generation rules

- The composer must always be rebuilt from canonical state.
- Selected blocks must be sorted by `defaultOrder`, not by click order.
- Inactive blocks must never appear in output.
- The selected role must appear exactly once.
- The required response format footer must always be appended once a valid role is selected.

---

## Task 1: Skeleton and Semantic Page Contract

**Purpose:** Create a stable local HTML shell with all required top-level sections before any behavior is added.

**Files:**
- Create: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Add the document shell, `<title>`, `<main>`, and all required page sections.
- [ ] Insert the visible product title, subtitle, and metadata placeholders.
- [ ] Add semantic headings and labels so screen-reader structure exists from the start.
- [ ] Reserve a visible message area for warnings and clipboard status.
- [ ] Ensure the composer is implemented as a labeled `<textarea>` or similarly appropriate editable/readable field.

**Expected result:** The page loads locally and already reflects the complete structural contract of the tool, even before interactivity is wired up.

---

## Task 2: Design Tokens, Panels, and Responsive Visual System

**Purpose:** Apply the Sentra dark-tool aesthetic and interaction states in a way that supports clarity and reliable local use.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Define root tokens for background, panel, text, border, accent, Audrey bronze, and teal.
- [ ] Implement a warm dark shell with distinct panels and readable contrast.
- [ ] Style block cards with the required dashed inactive state and solid active state.
- [ ] Style role buttons with the required radio-like active state.
- [ ] Style preset buttons clearly, without making them visually identical to role buttons.
- [ ] Implement visible focus states for all interactive controls.
- [ ] Apply the required responsive grid behavior for block cards.
- [ ] Ensure the composer meets the minimum height requirement.

**Expected result:** The page already looks like a Sentra operational utility and remains usable in desktop and split-screen scenarios.

---

## Task 3: Static Context Data and Rendering Functions

**Purpose:** Convert the full spec content into explicit in-file data structures and render from those structures only.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Add `METADATA` with the static values allowed for v0.1.
- [ ] Add the 8 required context block objects with `id`, `title`, `shortDescription`, `content`, and `defaultOrder`.
- [ ] Add the 3 required agent role objects with unique IDs and full content.
- [ ] Add the 5 preset objects with deterministic block ID bundles.
- [ ] Implement [`renderBlocks()`](../../specs/006-context-capsule-v1.md), [`renderRoles()`](../../specs/006-context-capsule-v1.md), and [`renderPresets()`](../../specs/006-context-capsule-v1.md) as pure renderers from data.
- [ ] Keep the markup generation readable enough for manual maintenance in a single-file environment.

**Expected result:** All content in the page becomes centralized and maintainable without repeated hardcoded HTML fragments.

---

## Task 4: Selection State, Preset Logic, and Live Composer

**Purpose:** Make the tool operational by connecting user selections to deterministic markdown generation.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Add a single runtime state object for block selection, role selection, preset selection, warning state, and copy state.
- [ ] Implement [`toggleBlock()`](../../specs/006-context-capsule-v1.md) for click-to-select and click-to-deselect behavior.
- [ ] Implement [`selectRole()`](../../specs/006-context-capsule-v1.md) as a radio-style single-select action.
- [ ] Implement [`applyPreset()`](../../specs/006-context-capsule-v1.md) so presets only affect block selection and preset highlighting.
- [ ] Implement [`buildComposerText()`](../../specs/006-context-capsule-v1.md) to output the exact markdown structure required by the spec.
- [ ] Implement [`updateComposer()`](../../specs/006-context-capsule-v1.md) so the composer updates live after every relevant state change.
- [ ] Keep block order stable using `defaultOrder`.

**Expected result:** Chief can select blocks, choose one role, and immediately see the correct context capsule output appear in the composer.

---

## Task 5: Copy Flow, Clear Flow, Freshness Logic, and Status Messaging

**Purpose:** Harden the local-browser experience so the tool remains dependable even under clipboard restrictions or stale metadata.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Implement [`copyAll()`](../../specs/006-context-capsule-v1.md) with `navigator.clipboard.writeText()` as the first path.
- [ ] Add the textarea-selection fallback using `document.execCommand("copy")` if the primary path fails.
- [ ] Block Copy All when no role is selected and show the exact required warning string.
- [ ] Add a two-second copied-success state on the button.
- [ ] Implement [`clearAll()`](../../specs/006-context-capsule-v1.md) to fully reset block, role, preset, composer, and warning state.
- [ ] Implement [`checkFreshness()`](../../specs/006-context-capsule-v1.md) to handle fresh, stale, and invalid timestamp cases.
- [ ] Keep status messages visible and non-ambiguous.

**Expected result:** The final utility behaves predictably in local Chrome even if clipboard permissions vary and even if metadata becomes stale.

---

## Task 6: Accessibility and Polish Pass

**Purpose:** Ensure the finished tool is not only functional but also operable and understandable under the minimum accessibility bar defined in the spec.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Confirm all interactive elements are real buttons or explicitly accessible button-like controls.
- [ ] Add `aria-pressed` to selected preset, block, and role surfaces where appropriate.
- [ ] Ensure the selected state uses visible text markers such as `✓ Active`, not color alone.
- [ ] Confirm keyboard focus remains visible on all controls.
- [ ] Ensure the composer has a visible and programmatic label.
- [ ] Re-check responsive behavior in a side-by-side window scenario.

**Expected result:** The tool remains simple while meeting the minimum accessibility and operability expectations laid out by the spec.

---

## Task 7: Manual Verification and Final Mission Report

**Purpose:** Close the mission with evidence that the utility works exactly as specified.

**Files:**
- Modify: implementation target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)
- Optional only if truly required: notes target defined by [`docs/specs/006-context-capsule-v1.md`](../../specs/006-context-capsule-v1.md)

- [ ] Execute the eight manual tests defined in the spec.
- [ ] Sweep the full acceptance checklist line-by-line.
- [ ] Confirm no sensitive content or unrelated path leakage is present in the artifact.
- [ ] Produce the final report in the exact format required by the spec.
- [ ] If any limitation remains, classify it honestly as `WARN` rather than hiding it.

**Expected result:** The mission closes with trustworthy evidence, not just a visually complete file.

---

## Manual Verification Matrix

| Verification area | Expected result |
|---|---|
| Open file | Loads directly in Chrome via `file://` |
| Visual shell | Dark Sentra UI with clear panels and readable text |
| Context blocks | 8 blocks visible and individually toggleable |
| Active/inactive state | Dashed inactive border, solid active border |
| Role selector | Only one role active at a time |
| Presets | Each preset selects the exact expected block bundle |
| Composer | Live updates using clean markdown and stable block order |
| Copy | Full composer copied successfully, with visible success state |
| Copy fallback | Manual fallback path exists if clipboard API is blocked |
| Clear | Resets blocks, role, preset, composer, and statuses |
| Freshness | Warns if older than 24 hours or timestamp parsing fails |
| Accessibility | Buttons, labels, focus states, and non-color selection markers present |
| Security | No sensitive content embedded |

---

## Risk Register

1. **Delivery location risk**
   The final artifact path is outside the workspace. Mitigation: confirm write scope before implementation begins.

2. **Clipboard restriction risk**
   Browser local-file environments can limit clipboard API access. Mitigation: keep the fallback path mandatory and clearly messaged.

3. **Composer drift risk**
   Manual click order can accidentally influence output order if implementation is naive. Mitigation: always sort selected blocks by `defaultOrder` before composing output.

4. **Design overreach risk**
   Borrowing too much from richer handbook pages could bloat the utility. Mitigation: reuse layout discipline only, not extra feature density.

5. **Stale metadata risk**
   Static metadata can quickly become outdated. Mitigation: centralize metadata and make stale warning behavior explicit.

6. **Accessibility drift risk**
   Card-based UIs easily over-rely on color. Mitigation: add text markers, labels, and `aria-pressed`.

7. **Scope creep risk**
   The spec explicitly rejects watcher/scanner/sync behavior. Mitigation: treat every automation idea beyond manual composition as out-of-scope unless separately approved.

---

## Exit Criteria

This plan is successfully executed only when:

- The final artifact exists at the target path defined by the spec.
- The file opens directly in Chrome using `file://`.
- No external network request is required.
- All required UI sections are present.
- All 8 context blocks, 3 roles, and 5 presets behave correctly.
- The composer updates live and outputs clean markdown in the required structure.
- Copy All, fallback copy, Clear, and stale warning logic all work.
- Accessibility minimums are present.
- No secrets or sensitive content are included.
- No unrelated files are modified.
- The final report is produced in the exact required format.

---

## Expected Final Position

If this plan is executed correctly, Chief ends up with one local HTML utility that is:

- fast to open,
- easy to understand,
- safe to run offline,
- reliable under local browser constraints,
- easy to refresh manually when context changes,
- and precise enough to brief Claude Code, Cursor, or Taskmaster without extra cleanup.

The correct v0.1 end state is not intelligence. The correct v0.1 end state is dependable context composition.
