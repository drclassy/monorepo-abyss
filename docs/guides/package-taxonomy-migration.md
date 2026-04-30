# ABYSS-REPO-STRUCTURE-001

# Package Taxonomy Migration Mission

**Mission Owner:** Chief / Dr. Ferdi Iskandar  
**Execution Agents:** Claude + Codex  
**Repository:** `the-abyss/`  
**Mission Type:** Controlled Monorepo Taxonomy Migration  
**Risk Level:** Medium–High  
**Execution Mode:** HANDOFF-first, GO-gated, cross-verified  
**Primary Objective:** Restructure `packages/` from a flat layout into a semantically governed taxonomy without changing package names, APIs, or runtime behavior.

---

## 0. Mission Summary

The current monorepo structure places strategic Sentra crown-jewel packages and ordinary infrastructure/tooling packages at the same visual level:

```txt
packages/
  sentra-nada/
  sentra-pustaka/
  sentra-sandi/
  sentra-bentara/
  sentra-cermin/
  database/
  shared-types/
  config-eslint/
  sentra-ui/
```

This creates weak architectural signaling. Humans and AI agents cannot immediately distinguish between:

- proprietary Sentra product capability,
- platform infrastructure,
- clinical knowledge substrate,
- low-level shared libraries,
- developer tooling.

This mission migrates the repository into a clearer taxonomy:

```txt
packages/
  sentra/
  platform/
  clinical/
  shared/
  tooling/
```

This is **not** a logic refactor. This is a **controlled folder taxonomy migration**.

---

## 1. Non-Negotiable Rules

The following rules are mandatory.

### 1.1 No Package Rename

Do **not** rename any `package.json` `name` field.

Example:

```json
{
  "name": "@the-abyss/database"
}
```

This package name must remain unchanged even if the physical path changes from:

```txt
packages/database
```

into:

```txt
packages/platform/database
```

### 1.2 No Logic Change

Do **not** modify business logic, clinical logic, database behavior, Langflow behavior, API contracts, runtime behavior, or UI behavior.

Allowed changes:

- folder location,
- workspace glob configuration,
- path alias configuration,
- lint/boundary config,
- CI/CD path references,
- Docker build paths,
- documentation references,
- generator output paths.

Not allowed:

- changing exported APIs,
- changing function names,
- changing database schema behavior,
- changing model logic,
- changing clinical rules,
- changing package names,
- changing public import specifiers unless absolutely required.

### 1.3 No Relative Deep Import Migration

Do **not** replace package imports with relative paths.

Correct:

```ts
import { db } from '@the-abyss/database';
```

Wrong:

```ts
import { db } from '../../platform/database/src';
```

### 1.4 Group Folders Are Not Packages

The following folders must **not** contain `package.json`:

```txt
packages/sentra/
packages/platform/
packages/clinical/
packages/shared/
packages/tooling/
```

They are taxonomy folders only.

### 1.5 No Silent Fixes

If either agent discovers an unexpected architectural inconsistency, hidden dependency, broken package boundary, or undocumented tool behavior, stop and document it in the mission report.

Do not silently patch unrelated issues.

### 1.6 GO-Gate Required

No execution starts until a valid HANDOFF file exists and Chief approval is present.

Required approval marker:

```txt
✅ GO
```

---

## 2. Agent Responsibilities

## 2.1 Claude Role — Primary Executor

Claude is responsible for performing the implementation.

Claude must:

1. create or update the HANDOFF document,
2. inventory the current package structure,
3. propose exact file moves before execution,
4. execute `git mv`-based folder migration,
5. update workspace and config files,
6. run validation commands,
7. produce an execution report,
8. hand off results to Codex for independent verification.

Claude must not proceed to the next phase if Codex blocks the previous phase.

## 2.2 Codex Role — Independent Reviewer / Verifier

Codex is responsible for independent crosscheck.

Codex must:

1. review Claude’s HANDOFF before execution,
2. verify the proposed taxonomy against the rules in this document,
3. review diffs after each phase,
4. run or request validation commands,
5. detect hidden path/config/tooling drift,
6. write a verification report,
7. approve, reject, or request revision for each phase.

Codex must not rewrite Claude’s implementation unless explicitly assigned by Chief.

## 2.3 Crosscheck Principle

Codex and Claude must work as a two-agent safety loop:

```txt
Claude proposes → Codex reviews → Chief GO → Claude executes → Codex verifies → continue
```

No phase is complete until both agents agree:

```txt
Claude Status: DONE
Codex Status: VERIFIED
```

---

## 3. Target Package Taxonomy

## 3.1 Final Structure

```txt
the-abyss/
  packages/
    sentra/
      sentra-nada/
      sentra-pustaka/
      sentra-sandi/
      sentra-bentara/
      sentra-cermin/

    platform/
      database/
      langflow-client/
      document-ingestion/
      literature-harvester/
      vector-store/

    clinical/
      clinical-references/
      fhir-engine/
      drug-safety/
      guideline-engine/

    shared/
      shared-types/
      sentra-ui/
      design-token/

    tooling/
      config-eslint/
      config-typescript/
      generators/
      iskandar-gatekeeper/
```

If a listed package does not exist, do not create it unless already part of the active repository plan. Document as `NOT PRESENT`.

If an unlisted package exists, classify it using the taxonomy below.

---

## 4. Taxonomy Rules

| Category | Folder | Definition | Examples |
|---|---|---|---|
| Sentra Crown Jewel | `packages/sentra/*` | Proprietary product capability, core Sentra domain logic, business-differentiating intelligence | `sentra-nada`, `sentra-pustaka`, `sentra-sandi`, `sentra-bentara`, `sentra-cermin` |
| Platform Substrate | `packages/platform/*` | Runtime infrastructure, persistence, orchestration, ingestion, vector/RAG infrastructure | `database`, `langflow-client`, `document-ingestion`, `literature-harvester`, `vector-store` |
| Clinical Substrate | `packages/clinical/*` | Clinical knowledge, clinical safety rules, guidelines, FHIR, pharmacotherapy, medical references | `clinical-references`, `fhir-engine`, `drug-safety`, `guideline-engine` |
| Shared Primitives | `packages/shared/*` | Low-level reusable types, UI primitives, tokens, common utilities | `shared-types`, `sentra-ui`, `design-token` |
| Tooling | `packages/tooling/*` | Build tooling, lint config, TypeScript config, generators, internal validation tools | `config-eslint`, `config-typescript`, `generators`, `iskandar-gatekeeper` |

---

## 5. Dependency Direction Rule

The intended dependency direction is:

```txt
apps
  ↓
packages/sentra
  ↓
packages/platform + packages/clinical
  ↓
packages/shared
```

Tooling is special-purpose and should not be imported by runtime packages unless explicitly justified.

### 5.1 Allowed Direction

```txt
apps/* → packages/sentra/*
apps/* → packages/platform/*
apps/* → packages/clinical/*
apps/* → packages/shared/*

packages/sentra/* → packages/platform/*
packages/sentra/* → packages/clinical/*
packages/sentra/* → packages/shared/*

packages/platform/* → packages/shared/*
packages/clinical/* → packages/shared/*

packages/tooling/* → packages/shared/*
```

### 5.2 Forbidden Direction

```txt
packages/shared/* → packages/platform/*
packages/shared/* → packages/clinical/*
packages/shared/* → packages/sentra/*

packages/platform/* → packages/sentra/*
packages/clinical/* → packages/sentra/*

packages/sentra/* → apps/*
packages/platform/* → apps/*
packages/clinical/* → apps/*
packages/shared/* → apps/*
```

### 5.3 Silent Drift Warning

The most dangerous failure is not a build error. The most dangerous failure is architectural inversion, for example:

```txt
packages/platform/database imports packages/sentra/sentra-nada
```

This must be blocked.

---

## 6. Mission Phases

# Phase 0 — Preflight Inventory

## Objective

Create a complete inventory of current package locations, package names, import usage, config references, CI/CD references, Docker references, and generator references.

## Claude Tasks

Run or inspect:

```bash
find packages -maxdepth 2 -name package.json -print
find packages -maxdepth 3 -name package.json -print
find . -name "package.json" -not -path "*/node_modules/*" -print
```

Search references:

```bash
grep -R "packages/database" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/shared-types" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-nada" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-pustaka" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-sandi" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-bentara" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-cermin" . --exclude-dir=node_modules --exclude-dir=.git || true
```

Also inspect:

```txt
pnpm-workspace.yaml
package.json
turbo.json
nx.json
tsconfig.json
tsconfig.base.json
eslint config files
.github/workflows/*
infrastructure/docker/*
docker-compose*.yml
tooling/*
.agents/*
apps/**/AGENTS.md
docs/**
```

## Codex Crosscheck

Claude must verify:

- every current package is inventoried,
- no package is missing from the taxonomy table,
- no unknown package is moved without classification,
- all config reference surfaces are identified.

## Phase 0 Exit Criteria

```txt
Claude Status: INVENTORY COMPLETE
Codex Status: INVENTORY VERIFIED
```

---

# Phase 1 — HANDOFF + ADR

## Objective

Create formal architecture memory before touching folder structure.

## Required Files

```txt
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-HANDOFF.md
docs/adr/000X-package-taxonomy-and-boundary-model.md
```

Use the next available ADR number.

## HANDOFF Must Include

1. problem statement,
2. current flat structure,
3. target taxonomy,
4. migration rules,
5. risk assessment,
6. rollback plan,
7. exact folder movement table,
8. validation commands,
9. proof-of-verification checklist,
10. Chief approval section.

## ADR Must Include

1. title: `Package Taxonomy and Boundary Model`,
2. status: `Accepted` only after Chief GO,
3. context,
4. decision,
5. taxonomy categories,
6. dependency direction rule,
7. consequences,
8. enforcement plan.

## Codex Crosscheck

Claude must verify:

- HANDOFF is complete,
- ADR captures the architectural rationale,
- risks are explicit,
- rollback plan exists,
- no execution is implied before GO.

## Phase 1 Exit Criteria

```txt
Claude Status: HANDOFF + ADR READY
Codex Status: HANDOFF + ADR VERIFIED
Chief Status: ✅ GO REQUIRED BEFORE PHASE 2
```

---

# Phase 2 — Structural Move Only

## Objective

Move package folders only. Do not change logic.

## Claude Tasks

Use `git mv`, not copy-delete, so history remains traceable.

Suggested move map:

```bash
mkdir -p packages/sentra packages/platform packages/clinical packages/shared packages/tooling

# Sentra crown jewels
git mv packages/sentra-nada packages/sentra/sentra-nada 2>/dev/null || true
git mv packages/sentra-pustaka packages/sentra/sentra-pustaka 2>/dev/null || true
git mv packages/sentra-sandi packages/sentra/sentra-sandi 2>/dev/null || true
git mv packages/sentra-bentara packages/sentra/sentra-bentara 2>/dev/null || true
git mv packages/sentra-cermin packages/sentra/sentra-cermin 2>/dev/null || true

# Platform substrate
git mv packages/database packages/platform/database 2>/dev/null || true
git mv packages/langflow-client packages/platform/langflow-client 2>/dev/null || true
git mv packages/document-ingestion packages/platform/document-ingestion 2>/dev/null || true
git mv packages/literature-harvester packages/platform/literature-harvester 2>/dev/null || true
git mv packages/vector-store packages/platform/vector-store 2>/dev/null || true

# Clinical substrate
git mv packages/clinical-references packages/clinical/clinical-references 2>/dev/null || true
git mv packages/fhir-engine packages/clinical/fhir-engine 2>/dev/null || true
git mv packages/drug-safety packages/clinical/drug-safety 2>/dev/null || true
git mv packages/guideline-engine packages/clinical/guideline-engine 2>/dev/null || true

# Shared primitives
git mv packages/shared-types packages/shared/shared-types 2>/dev/null || true
git mv packages/sentra-ui packages/shared/sentra-ui 2>/dev/null || true
git mv packages/design-token packages/shared/design-token 2>/dev/null || true

# Tooling
git mv packages/config-eslint packages/tooling/config-eslint 2>/dev/null || true
git mv packages/config-typescript packages/tooling/config-typescript 2>/dev/null || true
git mv packages/generators packages/tooling/generators 2>/dev/null || true
git mv packages/iskandar-gatekeeper packages/tooling/iskandar-gatekeeper 2>/dev/null || true
```

Important: if a package does not exist, document it as `NOT PRESENT`; do not fail the entire mission for missing future packages.

## Codex Crosscheck

Claude must verify:

- every moved package still has the same package name,
- no group folder contains `package.json`,
- no package disappeared,
- no package was duplicated,
- no source file content was changed during Phase 2.

Recommended checks:

```bash
find packages -maxdepth 2 -name package.json -print
find packages -maxdepth 3 -name package.json -print
find packages/sentra packages/platform packages/clinical packages/shared packages/tooling -maxdepth 1 -name package.json -print
```

The last command must return nothing.

## Phase 2 Exit Criteria

```txt
Claude Status: STRUCTURAL MOVE COMPLETE
Codex Status: STRUCTURAL MOVE VERIFIED
```

---

# Phase 3 — Workspace and Build Config Update

## Objective

Update monorepo discovery and build configuration so packages are correctly detected in nested taxonomy folders.

## Required Updates

### 3.1 `pnpm-workspace.yaml`

Avoid broad ambiguous glob if possible. Preferred:

```yaml
packages:
  - 'apps/*'
  - 'apps/*/*'
  - 'packages/sentra/*'
  - 'packages/platform/*'
  - 'packages/clinical/*'
  - 'packages/shared/*'
  - 'packages/tooling/*'
  - 'flows/*'
  - 'tooling/*'
```

If repository requires deeper app structure, document why.

### 3.2 TypeScript Paths

Update any root `tsconfig.json` or `tsconfig.base.json` paths if they point to old locations.

Example:

```json
{
  "compilerOptions": {
    "paths": {
      "@the-abyss/database": ["packages/platform/database/src/index.ts"],
      "@the-abyss/shared-types": ["packages/shared/shared-types/src/index.ts"]
    }
  }
}
```

Only include explicit paths if the repo already uses explicit paths. Do not introduce unnecessary path complexity.

### 3.3 Turbo / Nx / ESLint

Inspect and update:

```txt
turbo.json
nx.json
.eslintrc*
eslint.config.*
packages/tooling/config-eslint/*
```

Do not introduce boundary rules yet if that causes a large unrelated refactor. Boundary enforcement is Phase 5.

### 3.4 CI/CD

Update path references in:

```txt
.github/workflows/*.yml
.github/workflows/*.yaml
```

Search for old paths.

### 3.5 Docker and Infrastructure

Update path references in:

```txt
infrastructure/docker/*
docker-compose*.yml
Dockerfile*
infrastructure/kubernetes/*
infrastructure/argocd/*
```

### 3.6 Generators / CLI

Update package scaffolding destinations in:

```txt
tooling/*
packages/tooling/*
.agents/skills/*
```

## Codex Crosscheck

Claude must verify:

- workspace globs detect all packages,
- package names remain stable,
- no config still points to old package locations,
- no generator still creates packages at flat `packages/*` unless intentionally documented,
- no CI path filter was missed.

Search commands:

```bash
grep -R "packages/database" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/shared-types" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/sentra-nada" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/config-eslint" . --exclude-dir=node_modules --exclude-dir=.git || true
grep -R "packages/langflow-client" . --exclude-dir=node_modules --exclude-dir=.git || true
```

Any remaining old path must be classified as:

```txt
VALID HISTORICAL DOC REFERENCE
VALID MIGRATION NOTE
MUST FIX
```

## Phase 3 Exit Criteria

```txt
Claude Status: CONFIG UPDATED
Codex Status: CONFIG VERIFIED
```

---

# Phase 4 — Validation Pass 1

## Objective

Prove the taxonomy migration did not break workspace discovery, install, build, lint, or tests.

## Required Commands

Run from repo root:

```bash
pnpm install
pnpm list --depth=0
pnpm turbo run build
pnpm turbo run lint
pnpm turbo run test
```

If Nx is active:

```bash
pnpm nx graph
pnpm nx affected -t build
pnpm nx affected -t test
```

If package manager scripts differ, use repository-equivalent commands and document the substitution.

## Codex Crosscheck

Claude must verify command outputs and classify failures:

| Failure Type | Meaning | Action |
|---|---|---|
| Workspace discovery failure | Package not detected | Fix `pnpm-workspace.yaml` |
| TypeScript path failure | Alias/path drift | Fix tsconfig paths |
| Build graph failure | Turbo/Nx graph issue | Fix build config |
| Lint failure from old path | Boundary/config drift | Fix lint config |
| Test failure from logic behavior | Unexpected logic impact | Stop and investigate |

## Phase 4 Exit Criteria

```txt
Claude Status: VALIDATION PASS 1 COMPLETE
Codex Status: VALIDATION PASS 1 VERIFIED
```

---

# Phase 5 — Boundary Enforcement

## Objective

Add or update architectural dependency enforcement to prevent taxonomy drift.

## Enforcement Targets

Minimum boundaries:

```txt
shared cannot import platform, clinical, sentra, apps
platform cannot import sentra or apps
clinical cannot import sentra or apps
sentra cannot import apps
tooling cannot be imported by runtime packages unless explicitly allowed
```

## Preferred Nx Tag Model

If Nx is active, use tags similar to:

```json
{
  "tags": ["scope:sentra", "type:domain"]
}
```

Suggested tags:

```txt
scope:sentra
scope:platform
scope:clinical
scope:shared
scope:tooling
scope:app

type:domain
type:runtime
type:knowledge
type:primitive
type:tooling
type:app
```

Suggested constraints:

```txt
scope:app can depend on scope:sentra, scope:platform, scope:clinical, scope:shared
scope:sentra can depend on scope:platform, scope:clinical, scope:shared
scope:platform can depend on scope:shared
scope:clinical can depend on scope:shared and selected scope:platform if justified
scope:shared can depend only on scope:shared
scope:tooling can depend on scope:shared and selected tooling dependencies
```

## ESLint Enforcement

If Nx is not fully active, implement ESLint import restrictions through existing config package.

Minimum forbidden patterns:

```txt
packages/shared/* importing packages/platform/*
packages/shared/* importing packages/clinical/*
packages/shared/* importing packages/sentra/*
packages/platform/* importing packages/sentra/*
packages/clinical/* importing packages/sentra/*
packages/* importing apps/*
```

## Codex Crosscheck

Claude must verify:

- boundary rules match intended direction,
- no current valid package is falsely blocked,
- invalid dependency examples are blocked,
- enforcement runs in CI or lint.

## Phase 5 Exit Criteria

```txt
Claude Status: BOUNDARY ENFORCEMENT COMPLETE
Codex Status: BOUNDARY ENFORCEMENT VERIFIED
```

---

# Phase 6 — Agent Steering and Documentation Update

## Objective

Update human and AI-facing documentation so future agents understand the new taxonomy.

## Required Updates

Inspect and update:

```txt
README.md
.agents/AGENTS.md
apps/**/AGENTS.md
docs/dev/*
docs/governance/*
docs/architecture/*
docs/templates/HANDOFF.md
tooling/generators/*
.agents/skills/*
```

Documentation must explain:

1. package taxonomy,
2. category definitions,
3. dependency direction,
4. where to create new packages,
5. what is forbidden,
6. how to validate package placement.

## Required New Section for Agent Docs

Add a section similar to:

```md
## Package Taxonomy Rule

Agents must not create new packages directly under `packages/*`.

Allowed package locations:

- `packages/sentra/*` for proprietary Sentra crown-jewel capabilities
- `packages/platform/*` for runtime infrastructure
- `packages/clinical/*` for clinical knowledge and safety substrate
- `packages/shared/*` for low-level primitives
- `packages/tooling/*` for developer/build tooling

If classification is unclear, stop and request Chief decision before creating the package.
```

## Codex Crosscheck

Claude must verify:

- agent docs no longer mention obsolete flat package structure as active architecture,
- generator instructions point to new taxonomy,
- future package creation rule is explicit,
- unclear classification path is documented.

## Phase 6 Exit Criteria

```txt
Claude Status: DOCS + AGENT STEERING UPDATED
Codex Status: DOCS + AGENT STEERING VERIFIED
```

---

# Phase 7 — Validation Pass 2 and Final Proof

## Objective

Run final validation after boundaries and docs are updated.

## Required Commands

```bash
pnpm install
pnpm turbo run build
pnpm turbo run lint
pnpm turbo run test
```

If Nx is active:

```bash
pnpm nx affected -t build
pnpm nx affected -t lint
pnpm nx affected -t test
```

Additional checks:

```bash
find packages/sentra packages/platform packages/clinical packages/shared packages/tooling -maxdepth 1 -name package.json -print
find packages -maxdepth 2 -name package.json -print
find packages -maxdepth 3 -name package.json -print
```

The group-folder package check must return no `package.json` files at the group folder level.

## Final Report Required

Claude must produce:

```txt
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-EXECUTION-REPORT.md
```

Codex must produce:

```txt
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-VERIFICATION-REPORT.md
```

## Execution Report Must Include

1. packages moved,
2. packages not present,
3. config files updated,
4. CI/CD files updated,
5. Docker/infrastructure files updated,
6. docs/agent files updated,
7. validation command outputs,
8. known issues,
9. rollback instructions,
10. final status.

## Verification Report Must Include

1. independent taxonomy verification,
2. package name stability verification,
3. workspace detection verification,
4. old-path reference audit,
5. boundary enforcement verification,
6. command output review,
7. final risk classification,
8. final recommendation.

## Phase 7 Exit Criteria

```txt
Claude Status: FINAL REPORT COMPLETE
Codex Status: FINAL VERIFICATION COMPLETE
Chief Status: READY FOR REVIEW
```

---

## 7. Rollback Plan

If migration fails and cannot be fixed safely, use git rollback.

Preferred:

```bash
git status
git restore .
```

If commits were already made:

```bash
git revert <migration-commit-sha>
```

If branch is disposable:

```bash
git checkout main
git branch -D refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy
```

Do not manually copy folders back unless git history is already damaged.

---

## 8. Suggested Branch and Commit Strategy

Branch:

```bash
git checkout -b refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy
```

Suggested commits:

```txt
[ABYSS-REPO-STRUCTURE-001] docs: add package taxonomy handoff and ADR
[ABYSS-REPO-STRUCTURE-001] refactor: move packages into taxonomy folders
[ABYSS-REPO-STRUCTURE-001] chore: update workspace and build configuration
[ABYSS-REPO-STRUCTURE-001] chore: enforce package boundary rules
[ABYSS-REPO-STRUCTURE-001] docs: update agent steering and developer guidance
[ABYSS-REPO-STRUCTURE-001] test: add final migration verification report
```

Each commit message should include trailers:

```txt
Agent: Claude
Reviewer: Codex
Phase: ABYSS-REPO-STRUCTURE-001
Handoff: docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-HANDOFF.md
```

---

## 9. Acceptance Criteria

The mission is successful only if all criteria are met:

```txt
[ ] No package name changed
[ ] No public API changed
[ ] No runtime logic changed
[ ] No group folder contains package.json
[ ] pnpm workspace detects all packages
[ ] Build passes
[ ] Lint passes
[ ] Tests pass
[ ] CI/CD paths updated
[ ] Docker/infrastructure paths updated where relevant
[ ] Generators/CLI updated where relevant
[ ] Agent docs updated
[ ] ADR created
[ ] HANDOFF created and approved
[ ] Execution report created
[ ] Codex verification report created
[ ] Boundary rules prevent architectural inversion
```

---

## 10. Explicit Stop Conditions

Stop immediately and request Chief decision if any of the following occurs:

```txt
1. A package classification is unclear.
2. A package depends on a higher-level category in violation of dependency direction.
3. A test failure indicates behavior changed.
4. Package names need to change to make the build pass.
5. A generator or CLI assumes flat package layout in a complex way.
6. CI/CD deployment references are unclear.
7. Healthcare/clinical logic appears affected.
8. FHIR, audit, RAG, or document ingestion behavior changes unexpectedly.
9. Claude and Codex disagree on whether the migration is safe.
```

---

## 11. Final Instruction to Claude

Claude, your job is to execute this mission conservatively.

Do not optimize.  
Do not redesign.  
Do not rename packages.  
Do not change APIs.  
Do not change business logic.  
Do not change clinical logic.  
Do not bypass Codex review.  
Do not proceed without GO approval.

Your success condition is not elegance. Your success condition is **safe taxonomy migration with zero behavior change**.

---

## 12. Final Instruction to Codex

Codex, your job is to distrust the migration until proven safe.

Check every package.  
Check every config surface.  
Check every old path.  
Check every dependency direction.  
Check every validation output.  
Check whether the migration accidentally changes behavior.  
Check whether future agents will understand the new taxonomy.

Your success condition is not speed. Your success condition is **independent verification that no silent architectural drift was introduced**.

---

## 13. Mission Decision

This migration is approved conceptually by Chief as an accepted risk, but execution remains GO-gated.

Proceed only after the HANDOFF is created and Chief writes:

```txt
✅ GO
```

Final target state:

```txt
packages/
  sentra/      # Crown jewel Sentra capabilities
  platform/    # Runtime infrastructure substrate
  clinical/    # Clinical knowledge and safety substrate
  shared/      # Low-level reusable primitives
  tooling/     # Developer/build tooling
```

Mission principle:

```txt
Folder taxonomy gives clarity.
Boundary rules give enforcement.
CI gives proof.
HANDOFF gives intent.
Codex crosscheck gives safety.
Chief GO gives authority.
```

