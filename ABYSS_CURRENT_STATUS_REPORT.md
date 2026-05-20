# ABYSS Current Status Report

Audit date: 2026-05-20  
Repository root: `D:\Devops\abyss-monorepo`  
Audit mode: read-only inspection plus selected verification commands

## 1. Executive engineering snapshot

ABYSS is currently a large `pnpm` + Turborepo monorepo with a real, buildable
active workspace, but it is also in a partially migrated and internally
inconsistent state.

- `PARTIAL`: workspace reality is split between three truths:
  - `pnpm build` currently sees 37 packages in active scope.
  - `.gitignore` still contains a polyrepo-style exclusion for most `apps/`.
  - `README.md` and docs indexes still contain some stale or partially migrated
    references.
- `PASS`: root `pnpm typecheck -- --pretty false` passed on this checkout during
  this audit.
- `PASS`: root `pnpm build` passed on this checkout during this audit.
- `FAIL`: root `pnpm test` failed because `@the-abyss/unicom` test startup could
  not resolve `localhost` (`getaddrinfo ENOENT localhost`).
- `PASS`: no manifest-declared internal dependency cycle was detected in the
  audited package graph.
- `HIGH RISK`: the accepted package-boundary ADR says `packages/platform/*` must
  not depend on `packages/sentra/*`, but `@the-abyss/orchestrator` currently
  depends on `@sentra/nada`.

## 2. Repository structure overview

Top-level directories observed:

- `.agent/` operational SSOT and audit continuity surface
- `apps/` application surfaces
- `docs/` active documentation tree
- `flows/` LangFlow definitions
- `infrastructure/` deployment and Terraform assets
- `packages/` shared, platform, clinical, tooling, and Sentra packages
- `platform/` platform applications and runtimes
- `tooling/` repo tooling, VSIX tooling, governance, and utilities

Current structural facts:

- `PASS`: `.agent/README.md`, `.agent/HANDOFF.md`, `.agent/CONTEXT.md`, and
  `.agent/PROGRESS.md` exist and define active repo continuity.
- `PASS`: `pnpm-workspace.yaml` defines a real multi-area workspace across
  `apps/`, `packages/*` category folders, `platform/**`, and `tooling/**`.
- `PARTIAL`: some folder surfaces exist physically but are not clearly aligned
  with current workspace truth:
  - `packages/library/medical/`
  - `platform/symphony/`
  - `apps/healthcare/primary-healthcare/website/`
- `UNKNOWN`: those surfaces may be intentionally outside the active workspace,
  leftovers from earlier structure, or waiting for reintegration.

## 3. Package/module inventory

### 3.1 Active workspace packages observed in `pnpm build`

Applications and platform apps:

| Area          | Packages detected in active build scope                                                                                        | Status |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Academic      | `@the-abyss/academic-solutions`, `@the-abyss/clinical-simulator`, `@the-abyss/evaluation-engine`                               | ACTIVE |
| Community     | `@the-abyss/classy-memory`, `@the-abyss/classy-transformer`, `@the-abyss/classy-transformer-website`, `@the-abyss/daf-website` | ACTIVE |
| Corporate     | `@the-abyss/ferdiiskandar`                                                                                                     | ACTIVE |
| Healthcare    | `@classy/intelligenceboard`, `@the-abyss/referralink`, `@the-abyss/sentra-assist`, `@the-abyss/sentra-main`                    | ACTIVE |
| Platform apps | `@the-abyss/orchestrator`, `@the-abyss/sentra-portal`                                                                          | ACTIVE |

Shared/internal packages:

| Area                | Packages detected in active build scope                                                                                                      | Status |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Clinical            | `@the-abyss/clinical-references`                                                                                                             | ACTIVE |
| Platform packages   | `@the-abyss/database`, `@the-abyss/document-ingestion`, `@the-abyss/langflow-client`, `@the-abyss/literature-harvester`, `@the-abyss/unicom` | ACTIVE |
| Sentra crown jewels | `@sentra/bentara`, `@sentra/cermin`, `@sentra/nada`, `@sentra/pustaka`, `@sentra/sandi`                                                      | ACTIVE |
| Shared              | `@the-abyss/design-token`, `@sentra/design-token`, `@sentra/ui`, `@the-abyss/ui`, `@the-abyss/shared-types`                                  | ACTIVE |
| Tooling packages    | `@the-abyss/config-eslint`, `@the-abyss/config-typescript`                                                                                   | ACTIVE |

Repo tooling and support packages:

| Area          | Packages detected in active build scope                                                                                   | Status |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ |
| CLI / tooling | `@the-abyss/cli`, `@the-abyss/literature-worker`, `classy-handbook-launcher`, `classy-librarian-console`, `sentra-prompt` | ACTIVE |

### 3.2 Present on disk but not clearly active in current workspace scope

| Path / package                                                                | Evidence                                                                        | Status                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| `apps/healthcare/primary-healthcare/website` / `@the-abyss/puskesmas-website` | physical `package.json` exists, but it did not appear in `pnpm build` scope     | PRESENT BUT OUTSIDE ACTIVE WORKSPACE |
| `packages/library/medical/literature-harvests`                                | physical folder exists, no active package manifest found in workspace inventory | UNKNOWN                              |
| `platform/symphony`                                                           | physical folder exists, no package manifest found                               | UNKNOWN                              |
| `tooling/handbook-statusbar-vsix`                                             | physical `package.json` exists, explicitly excluded in `pnpm-workspace.yaml`    | PRESENT BUT EXCLUDED                 |

### 3.3 Modules or surfaces referenced by docs but missing physically

| Surface                                                              | Evidence                                         | Status              |
| -------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `apps/healthcare/aby-dashboard`                                      | referenced in `README.md`, physical path absent  | STALE DOC REFERENCE |
| `apps/prototype/edge-ai-prototype`                                   | referenced in `README.md`, physical path absent  | STALE DOC REFERENCE |
| `apps/prototype/ghost-protocol` and `apps/prototype/ghost-protocols` | referenced in `README.md`, physical paths absent | STALE DOC REFERENCE |

## 4. Completed work detected

This section records only what is directly evidenced by files or commands.

- `PASS`: root workspace remains operational enough to complete a full
  `pnpm build`.
- `PASS`: root TypeScript gate remains operational enough to complete
  `pnpm typecheck -- --pretty false`.
- `PASS`: `.agent/` minimal SSOT operating model is present and documented in
  `.agent/README.md` and `.agent/HANDOFF.md`.
- `PASS`: current docs tree still exposes index entrypoints at `docs/README.md`,
  `docs/guides/README.md`, and `docs/specs/README.md`, even though some linked
  content is drifting.
- `PASS`: current package taxonomy exists physically under:
  - `packages/sentra/*`
  - `packages/platform/*`
  - `packages/clinical/*`
  - `packages/shared/*`
  - `packages/tooling/*`
- `PASS`: crown-jewel engine packages are present with real source/test
  surfaces:
  - `@sentra/nada`
  - `@sentra/pustaka`
  - `@sentra/sandi`
  - `@sentra/cermin`
  - `@sentra/bentara`
- `PASS`: manifest dependency graph inspection found no declared internal
  cycles.
- `PASS`: handoff/progress evidence shows repo stabilization work has already
  restored root build and typecheck gates before this audit, and this audit
  re-confirmed those two gates live.

## 5. Partially completed or unclear work

| Item                                                 | Evidence                                                                                                                                                                                                        | Status  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Integration package relocation                       | old tracked path `packages/integration-bridge/**` is deleted in git diff; new `packages/integration/**` exists physically and is untracked; `pnpm-workspace.yaml` still points at `packages/integration-bridge` | PARTIAL |
| Docs renumbering / renaming                          | `docs/specs/README.md` still references missing old filenames such as `docs/specs/002-aadiv2-instructions.md`; new numbered files like `docs/specs/002-aadi-v2.md` exist                                        | PARTIAL |
| Guides migration                                     | `docs/guides/README.md` points to numbered guide files that now exist, but git diff still shows deletion of old guide filenames and addition of new numbered files as untracked                                 | PARTIAL |
| App scope policy                                     | `.gitignore` still describes most `apps/` as polyrepo-split and ignored, but `pnpm build` actively builds many `apps/` packages from this checkout                                                              | PARTIAL |
| Primary healthcare website inclusion                 | `@the-abyss/puskesmas-website` has real build/test scripts but is not in active workspace scope                                                                                                                 | PARTIAL |
| Working tree stabilization                           | `git diff --stat` shows 261 changed files with 24,000+ net deletions across docs, rules, packages, portal, orchestrator, and `.agent` artifacts                                                                 | PARTIAL |
| Governance cleanup in `apps/corporate/ferdiiskandar` | `.agent/HANDOFF.md` explicitly marks app import/governance review there as HOLD                                                                                                                                 | PARTIAL |

## 6. Active risks

| Severity | Risk                                                                     | Evidence                                                                                                                                                                                                                      | Why it matters                                                                                            |
| -------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| HIGH     | Forbidden platform-to-sentra coupling                                    | ADR 0008 says `packages/platform/* -> packages/sentra/*` is forbidden; `platform/orchestrator/package.json` depends on `@sentra/nada`                                                                                         | This is a direct boundary violation against the accepted taxonomy rulebook                                |
| HIGH     | Monorepo truth is split across workspace config, ignore policy, and docs | `.gitignore` still says most `apps/` are polyrepo-split; `pnpm build` still builds many `apps/`; README still describes additional app surfaces                                                                               | Team and agent actions can be based on contradictory assumptions about what is actually part of this repo |
| HIGH     | Integration package path drift                                           | `packages/integration-bridge` is still the configured workspace path, but only `packages/integration` exists physically                                                                                                       | This can break fresh installs, onboarding, reproducibility, or future workspace edits                     |
| MEDIUM   | Documentation index drift                                                | `docs/specs/README.md` still points to missing old filenames while new numbered files exist                                                                                                                                   | Engineers may follow outdated spec paths or conclude canonical specs are missing                          |
| MEDIUM   | Nested app inclusion is inconsistent                                     | `apps/community/classy-transformer/website` is explicitly whitelisted into workspace, but `apps/healthcare/primary-healthcare/website` is not                                                                                 | Similar app structures are treated differently without a clearly documented rule                          |
| MEDIUM   | Root tests are not currently green                                       | `pnpm test` failed at `@the-abyss/unicom#test` with `getaddrinfo ENOENT localhost`                                                                                                                                            | Repo is not at a fully verified green baseline                                                            |
| LOW      | Build warnings are accumulating in otherwise passing packages            | `@the-abyss/unicom` and `@the-abyss/document-ingestion` warn about `exports.types` order; `@the-abyss/referralink` emits CSS and chunk-size warnings; `@the-abyss/academic-solutions` warns baseline browser mapping is stale | Not immediate blockers, but they create noise and may hide real regressions later                         |
| LOW      | Duplicate local VSIX naming may cause confusion                          | both `tooling/handbook/package.json` and `tooling/handbook-statusbar-vsix/package.json` use `classy-handbook-launcher`                                                                                                        | Low-level maintainability and packaging ambiguity, especially because one surface is excluded             |

Direct cycle check result:

- `PASS`: no manifest-declared internal package cycle was detected in the
  audited graph.

## 7. Build/typecheck/test command inventory

### 7.1 Root command surface detected from `package.json`

| Command                                                     | Source              | Status    |
| ----------------------------------------------------------- | ------------------- | --------- |
| `pnpm build`                                                | root `package.json` | AVAILABLE |
| `pnpm dev`                                                  | root `package.json` | AVAILABLE |
| `pnpm lint`                                                 | root `package.json` | AVAILABLE |
| `pnpm test`                                                 | root `package.json` | AVAILABLE |
| `pnpm test:ui`                                              | root `package.json` | AVAILABLE |
| `pnpm typecheck`                                            | root `package.json` | AVAILABLE |
| `pnpm db:generate` / `db:push` / `db:migrate` / `db:studio` | root `package.json` | AVAILABLE |
| `pnpm flows:test`                                           | root `package.json` | AVAILABLE |
| `pnpm governance:agents-check`                              | root `package.json` | AVAILABLE |

### 7.2 Package-level build/typecheck/test coverage

| Package                                 | Build | Typecheck/check | Test | Scope note                                 |
| --------------------------------------- | ----- | --------------- | ---- | ------------------------------------------ |
| `@the-abyss/academic-solutions`         | Yes   | Yes             | No   | active workspace                           |
| `@the-abyss/clinical-simulator`         | Yes   | No              | No   | active workspace                           |
| `@the-abyss/evaluation-engine`          | Yes   | Yes             | No   | active workspace                           |
| `@the-abyss/classy-memory`              | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/classy-transformer`         | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/classy-transformer-website` | Yes   | Yes (`check`)   | Yes  | active workspace                           |
| `@the-abyss/daf-website`                | Yes   | No              | No   | active workspace                           |
| `@the-abyss/ferdiiskandar`              | Yes   | Yes             | Yes  | active workspace                           |
| `@classy/intelligenceboard`             | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/puskesmas-website`          | Yes   | No              | Yes  | present but outside active workspace scope |
| `@the-abyss/referralink`                | Yes   | No              | No   | active workspace                           |
| `@the-abyss/sentra-assist`              | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/sentra-main`                | Yes   | No              | No   | active workspace                           |
| `@the-abyss/clinical-references`        | No    | Yes             | Yes  | active workspace                           |
| `@the-abyss/integration-bridge`         | Yes   | No              | No   | path currently drifting                    |
| `@the-abyss/database`                   | Yes   | Yes             | No   | active workspace                           |
| `@the-abyss/document-ingestion`         | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/langflow-client`            | No    | Yes             | Yes  | active workspace                           |
| `@the-abyss/literature-harvester`       | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/unicom`                     | Yes   | Yes             | Yes  | active workspace, currently test blocker   |
| `@sentra/bentara`                       | No    | Yes             | Yes  | active workspace                           |
| `@sentra/cermin`                        | No    | Yes             | Yes  | active workspace                           |
| `@sentra/nada`                          | No    | Yes             | Yes  | active workspace                           |
| `@sentra/pustaka`                       | No    | Yes             | Yes  | active workspace                           |
| `@sentra/sandi`                         | No    | Yes             | Yes  | active workspace                           |
| `@the-abyss/design-token`               | No    | Yes             | No   | active workspace shell wrapper             |
| `@sentra/design-token`                  | No    | Yes             | No   | active workspace subpackage                |
| `@sentra/ui`                            | No    | Yes             | No   | active workspace subpackage                |
| `@the-abyss/ui`                         | Yes   | Yes             | No   | active workspace                           |
| `@the-abyss/shared-types`               | No    | Yes             | No   | active workspace                           |
| `@the-abyss/config-eslint`              | No    | No              | No   | active workspace tooling package           |
| `@the-abyss/config-typescript`          | No    | No              | No   | active workspace tooling package           |
| `@the-abyss/orchestrator`               | Yes   | Yes             | Yes  | active workspace                           |
| `@the-abyss/sentra-portal`              | Yes   | No              | No   | active workspace                           |
| `@the-abyss/cli`                        | Yes   | Yes             | No   | active workspace                           |
| `@the-abyss/literature-worker`          | Yes   | Yes             | Yes  | active workspace                           |
| `classy-handbook-launcher`              | No    | No              | No   | one active surface, one excluded duplicate |
| `classy-librarian-console`              | No    | No              | No   | active workspace tooling surface           |
| `sentra-prompt`                         | No    | Yes             | No   | active workspace tooling surface           |

### 7.3 Commands inspected

| Command or surface inspected                                                       | Result | Notes                                                          |
| ---------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| root `package.json` scripts                                                        | PASS   | root build/typecheck/test/db/governance command surface exists |
| `pnpm-workspace.yaml`                                                              | PASS   | workspace patterns loaded successfully                         |
| `turbo.json`                                                                       | PASS   | build/test/lint task graph loaded successfully                 |
| package manifests across `apps/`, `packages/`, `platform/`, `tooling/`             | PASS   | inventory extracted successfully                               |
| `.gitignore`                                                                       | PASS   | ignore-policy evidence loaded successfully                     |
| `.agent/README.md`, `.agent/HANDOFF.md`, `.agent/CONTEXT.md`, `.agent/PROGRESS.md` | PASS   | continuity and recent state evidence loaded successfully       |

### 7.4 Commands actually run

| Command                                             | Result  | Notes                                                                                     |
| --------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `git status --short`                                | PASS    | dirty tree confirmed                                                                      |
| `git diff --stat`                                   | PASS    | large in-progress migration/change set confirmed                                          |
| `git diff --name-status`                            | PASS    | path-level change classification confirmed                                                |
| `git ls-files --others --exclude-standard ...`      | PASS    | untracked docs, `.agent`, integration, and tooling surfaces confirmed                     |
| `pnpm -r list --depth 0`                            | PASS    | active workspace scope enumerated successfully                                            |
| `pnpm typecheck -- --pretty false`                  | PASS    | root typecheck passed                                                                     |
| `pnpm build`                                        | PASS    | root build passed with warnings in some packages                                          |
| `pnpm test`                                         | FAIL    | failed at `@the-abyss/unicom#test` with `getaddrinfo ENOENT localhost`                    |
| `C:\Users\drclassy\.codex\scripts\verify-local.ps1` | NOT RUN | component commands were run individually to preserve per-command evidence for this report |

## 8. Recommended next engineering tasks

Recommended next tasks are ordered by risk reduction, not by business priority.

1. Decide the repo truth: monorepo active workspace or polyrepo-split `apps/`
   policy, then align `.gitignore`, `pnpm-workspace.yaml`, and `README.md` to
   one model.
2. Resolve the `packages/integration-bridge` versus `packages/integration` path
   drift and make workspace membership explicit.
3. Fix the `@the-abyss/unicom` test startup failure so root `pnpm test` can pass
   again.
4. Review whether `@the-abyss/orchestrator -> @sentra/nada` is an approved
   exception or an actual taxonomy violation, then document or refactor
   accordingly.
5. Finish docs/spec renumbering so active indexes only reference files that
   actually exist.
6. Decide whether `@the-abyss/puskesmas-website` should join the active
   workspace or remain intentionally outside it.

## 9. Unknowns that require human confirmation

These cannot be settled from repository evidence alone.

- Is the intended source of truth still a single active monorepo, or is the repo
  supposed to keep most `apps/` as ignored polyrepo remnants?
- Is `packages/integration` the approved final location for
  `@the-abyss/integration-bridge`, or is the path move still experimental?
- Is `@the-abyss/orchestrator` allowed to depend on `@sentra/nada` as a
  deliberate exception, or should that be treated as an architecture violation?
- Should `@the-abyss/puskesmas-website` be promoted into the active workspace,
  or is its exclusion intentional?
- Are the missing prototype surfaces (`edge-ai-prototype`, `ghost-protocol`,
  `ghost-protocols`, `aby-dashboard`) intentionally removed, or is `README.md`
  stale?
- Should `platform/symphony/` and `packages/library/medical/` remain as
  non-package folders, or are they awaiting formal package/workspace treatment?

## 10. Suggested update for `SENTRA_CURRENT_STATE.md`

`SENTRA_CURRENT_STATE.md` has now been created from this audit baseline.

Recommended document role split:

- `ABYSS_CURRENT_STATUS_REPORT.md` = full audit record with evidence, inventory,
  and verification detail
- `SENTRA_CURRENT_STATE.md` = short executive current-state summary derived from
  this report
