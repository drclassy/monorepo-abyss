# ABYSS-REPO-STRUCTURE-001 — Mission HANDOFF

**Mission:** Package Taxonomy Migration  
**Mission Owner:** Chief / Dr. Ferdi Iskandar  
**Primary Executor:** Claude  
**Independent Verifier:** Codex  
**Branch:** `refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy`  
**Date:** 2026-04-30  
**Status:** ✅ GO — Execution in progress

---

## 1. Problem Statement

The monorepo currently places all packages at a flat level under `packages/`:

```
packages/
  sentra-nada/          ← Crown Jewel
  sentra-pustaka/       ← Crown Jewel
  sentra-sandi/         ← Crown Jewel
  sentra-bentara/       ← Crown Jewel
  sentra-cermin/        ← Crown Jewel
  database/             ← Platform infrastructure
  langflow-client/      ← Platform infrastructure
  document-ingestion/   ← Platform infrastructure
  literature-harvester/ ← Platform infrastructure
  clinical-references/  ← Clinical substrate
  shared-types/         ← Shared primitive
  sentra-ui/            ← Shared primitive
  design-token/         ← Shared primitive
  config-eslint/        ← Tooling
  config-typescript/    ← Tooling
  integration-bridge/   ← Unclassified (excluded from migration)
```

This flat layout gives no architectural signal. Humans and AI agents cannot distinguish crown-jewel IP from dev tooling at a glance. There is no enforced dependency direction.

---

## 2. Target Taxonomy

```
packages/
  sentra/               ← Proprietary Sentra crown-jewel capabilities
    sentra-nada/
    sentra-pustaka/
    sentra-sandi/
    sentra-bentara/
    sentra-cermin/

  platform/             ← Runtime infrastructure substrate
    database/
    langflow-client/
    document-ingestion/
    literature-harvester/

  clinical/             ← Clinical knowledge and safety substrate
    clinical-references/

  shared/               ← Low-level reusable primitives
    shared-types/
    sentra-ui/
    design-token/

  tooling/              ← Developer and build tooling
    config-eslint/
    config-typescript/

  integration-bridge/   ← EXCLUDED — keep flat / category TBD by Chief
```

**Group folders** (`sentra/`, `platform/`, `clinical/`, `shared/`, `tooling/`) are taxonomy folders only. They must NOT contain `package.json`.

---

## 3. Migration Rules (Non-Negotiable)

| Rule | Description |
|---|---|
| No package rename | `package.json` `name` field must not change |
| No logic change | No business, clinical, or runtime logic modified |
| Use `git mv` | Preserves git history — no copy-delete |
| No deep relative imports | All imports remain via package names (`@the-abyss/*`, `@sentra/*`) |
| No group-level package.json | Taxonomy folders must not be packages themselves |
| No silent fixes | Unexpected issues must be documented before patching |

---

## 4. Exact Folder Movement Table

| Source | Destination | Package Name | Status |
|---|---|---|---|
| `packages/sentra-nada` | `packages/sentra/sentra-nada` | `@sentra/nada` | PENDING |
| `packages/sentra-pustaka` | `packages/sentra/sentra-pustaka` | `@sentra/pustaka` | PENDING |
| `packages/sentra-sandi` | `packages/sentra/sentra-sandi` | `@sentra/sandi` | PENDING |
| `packages/sentra-bentara` | `packages/sentra/sentra-bentara` | `@sentra/bentara` | PENDING |
| `packages/sentra-cermin` | `packages/sentra/sentra-cermin` | `@sentra/cermin` | PENDING |
| `packages/database` | `packages/platform/database` | `@the-abyss/database` | PENDING |
| `packages/langflow-client` | `packages/platform/langflow-client` | `@the-abyss/langflow-client` | PENDING |
| `packages/document-ingestion` | `packages/platform/document-ingestion` | `@the-abyss/document-ingestion` | PENDING |
| `packages/literature-harvester` | `packages/platform/literature-harvester` | `@the-abyss/literature-harvester` | PENDING |
| `packages/clinical-references` | `packages/clinical/clinical-references` | `@the-abyss/clinical-references` | PENDING |
| `packages/shared-types` | `packages/shared/shared-types` | `@the-abyss/shared-types` | PENDING |
| `packages/sentra-ui` | `packages/shared/sentra-ui` | `@the-abyss/ui` | PENDING |
| `packages/design-token` | `packages/shared/design-token` | `@the-abyss/design-token` | PENDING |
| `packages/config-eslint` | `packages/tooling/config-eslint` | `@the-abyss/config-eslint` | PENDING |
| `packages/config-typescript` | `packages/tooling/config-typescript` | `@the-abyss/config-typescript` | PENDING |
| `packages/integration-bridge` | *(not moved)* | `@the-abyss/integration-bridge` | EXCLUDED |

**NOT PRESENT** (in mission doc target, already renamed in prior sessions):
`vector-store`, `fhir-engine`, `iskandar-gatekeeper`, `drug-safety`, `guideline-engine`, `generators`

---

## 5. Config Surfaces to Update

| File | Change Required |
|---|---|
| `pnpm-workspace.yaml` | Switch to specific globs per category |
| `tsconfig.json` (root) | Update all path aliases to new locations |
| `platform/orchestrator/tsconfig.json` | Update `extends` path to tooling/config-typescript |
| `.github/CODEOWNERS` | Update package paths |
| `.github/labeler.yml` | Update glob patterns |
| `eslint.config.mjs` | Verify import resolves post-install |
| `.agent/ARCHITECTURE.md` | Update path references + stale old names |
| `.agent/CONTEXT.md` | Update path references |
| `README.md` | Update architecture section |
| `docs/architecture/sentra-monorepo-diagram.md` | Update stale taxonomy names |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| pnpm workspace stops detecting packages | Medium | High | Specific globs in pnpm-workspace.yaml |
| tsconfig paths break TypeScript resolution | Medium | High | Explicit path update for every package |
| orchestrator `extends` path breaks | Low | Medium | Direct path update in Phase 3 |
| CODEOWNERS/labeler drift | Low | Low | Update in Phase 3, verified in Phase 7 |
| pnpm-lock.yaml regenerated | Certain | None | Expected side effect of `pnpm install` |
| Logic behavior change | Very Low | Critical | git mv only — no source edits |

---

## 7. Rollback Plan

**If no commits yet:**
```bash
git restore .
```

**If commits were made:**
```bash
git revert <migration-commit-sha>
```

**If branch is disposable:**
```bash
git checkout abyss-core
git branch -D refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy
```

Do not manually copy folders back — use git revert to preserve history.

---

## 8. Validation Commands

**After Phase 2 (structural move):**
```bash
# Group folders must have NO package.json at level 1:
find packages/sentra packages/platform packages/clinical packages/shared packages/tooling -maxdepth 1 -name package.json

# All 15 moved packages at level 2 (excluding integration-bridge):
find packages -maxdepth 3 -name package.json | grep -v integration-bridge

# No stale old flat paths:
grep -R "packages/sentra-nada\|packages/database\|packages/shared-types\|packages/config-eslint" . \
  --exclude-dir=node_modules --exclude-dir=.git -l
```

**After Phase 4 (validation):**
```bash
pnpm install
pnpm list --depth=0
pnpm turbo run build
pnpm turbo run lint
pnpm turbo run test
```

---

## 9. Proof-of-Verification Checklist

```
[ ] No package name (package.json `name`) changed
[ ] No source file content modified (only folder locations)
[ ] No group folder contains package.json
[ ] pnpm workspace detects all 15 moved packages
[ ] build passes
[ ] lint passes
[ ] tests pass
[ ] tsconfig paths resolve correctly
[ ] CODEOWNERS and labeler.yml updated
[ ] ADR 0008 created
[ ] Execution report created
[ ] Boundary rules prevent architectural inversion
[ ] Agent docs updated with taxonomy rule
[ ] Stale old names (fhir-engine, vector-store, etc.) cleaned from docs
```

---

## 10. Chief Approval

```
✅ GO — Dr. Ferdi Iskandar, 2026-04-30
```

---

## 11. Commit Log

| Commit | Description |
|---|---|
| `8143709` | PRE-FLIGHT: repair stale tsconfig paths |
| *(pending)* | HANDOFF + ADR |
| *(pending)* | git mv structural move |
| *(pending)* | workspace and config update |
| *(pending)* | boundary enforcement |
| *(pending)* | agent docs update |
| *(pending)* | execution report |
