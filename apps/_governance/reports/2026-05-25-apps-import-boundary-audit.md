# ABYSS-APPS-GOV-002 Apps Import Boundary Audit Report

Date: 2026-05-25  
Mode: Audit-only  
Scope: `apps/**` import boundaries, app inventory, crown-jewel consumption,
sibling app coupling, direct database access, and extraction risk.

## Executive Summary

Overall status: PARTIAL. The `apps/` workspace is structurally a portfolio
workspace, but several apps are already coupled to monorepo services, direct
databases, or local clinical/CDSS logic.

Biggest boundary risk: healthcare apps contain app-local clinical/CDSS/diagnosis
logic, especially `apps/healthcare/intelligenceboard`,
`apps/healthcare/sentra-assist`, and `apps/healthcare/referralink`. This does
not prove a violation by itself, but it conflicts with the desired direction
that apps should not silently own or fork crown-jewel algorithms.

Biggest extraction risk: direct database access exists in multiple apps
(`intelligenceboard`, `classy-transformer`, `classy-transformer/website`,
`daf-website`, `referralink`) and should be documented before any future
standalone extraction.

Good news: no direct `@sentra/*src`, `@sentra/*internal`, `src/internal`, or
sibling `apps/*` import candidates were found by the required scans.

Most important next action: create owner-reviewed `app.boundary.json` manifests
for known high-risk apps before any import refactor or lint enforcement.

## App Inventory

Workspace patterns from `pnpm-workspace.yaml`: `apps/*`, `apps/*/*`, plus
explicit `apps/community/classy-transformer/website`.

| App path                                                  | Package name                            | Workspace-visible?      | Initial audit classification                                             | Boundary notes                                                                                                                         |
| --------------------------------------------------------- | --------------------------------------- | ----------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/academic/academic-solutions`                        | `@the-abyss/academic-solutions`         | Yes                     | standalone-product-app candidate                                         | No crown-jewel or DB package dependency found in package scan.                                                                         |
| `apps/academic/clinical-simulator`                        | `@the-abyss/clinical-simulator`         | Yes                     | standalone-product-with-crown-jewel-consumption candidate                | Uses `@the-abyss/langflow-client` and `@the-abyss/ui`; clinical education domain, no `@sentra/*` import found.                         |
| `apps/academic/evaluation-engine`                         | `@the-abyss/evaluation-engine`          | Yes                     | internal-operator-app candidate                                          | Depends on `@the-abyss/database` and `@the-abyss/shared-types`; direct platform database dependency needs owner-approved boundary.     |
| `apps/community/classy-memory`                            | `@the-abyss/classy-memory`              | Yes                     | standalone-product-app candidate                                         | No crown-jewel or DB package dependency found in package scan.                                                                         |
| `apps/community/classy-transformer`                       | `@the-abyss/classy-transformer`         | Yes                     | standalone-product-with-crown-jewel-consumption candidate                | Uses `@sentra/design-token`, Prisma, Supabase, OpenAI, pg; no Sentra clinical/RAG core import found.                                   |
| `apps/community/classy-transformer/website`               | `@the-abyss/classy-transformer-website` | Yes                     | standalone-product-app or companion-site candidate                       | Uses Drizzle/MySQL; nested app needs owner decision before extraction.                                                                 |
| `apps/community/classy-transformer/website/blueprint/app` | `my-app`                                | Not clearly intended    | POSSIBLE_ORPHAN or prototype candidate                                   | Package name is generic; nested under blueprint. Review before relying on it.                                                          |
| `apps/community/daf-website`                              | `@the-abyss/daf-website`                | Yes                     | standalone-product-app candidate                                         | Uses local Prisma database; not crown-jewel by current evidence.                                                                       |
| `apps/corporate/ferdiiskandar`                            | `@the-abyss/ferdiiskandar`              | Yes                     | standalone-product-app candidate                                         | Uses `@sentra/design-token`; AADI appears as content/public profile, not app implementation.                                           |
| `apps/healthcare/intelligenceboard`                       | `@classy/intelligenceboard`             | Yes                     | internal-operator-app or standalone-product-with-crown-jewel-consumption | Uses `@sentra/nada`, `@the-abyss/shared-types`, Prisma/pg; contains local CDSS/clinical engine code. Needs owner decision.             |
| `apps/healthcare/primary-healthcare/website`              | `@the-abyss/puskesmas-website`          | Yes                     | standalone-product-app candidate                                         | Public clinic website; parent `primary-healthcare/database` exists without package manifest.                                           |
| `apps/healthcare/referralink`                             | `@the-abyss/referralink`                | Yes                     | standalone-product-with-crown-jewel-consumption candidate                | No `@sentra/*` import found, but contains diagnosis API/client code and direct DB/cloud data dependencies.                             |
| `apps/healthcare/sentra-assist`                           | `@the-abyss/sentra-assist`              | Yes                     | monorepo-bound-client-app                                                | Uses `@the-abyss/shared-types`; contains local `lib/iskandar-diagnosis-engine` and CDSS UI/handlers. Needs explicit boundary decision. |
| `apps/healthcare/sentra-main`                             | `@the-abyss/sentra-main`                | Yes                     | standalone-product-app or marketing/showcase app                         | Docs state it is marketing/showcase and not executable clinical decision logic.                                                        |
| `apps/healthcare/sidelab-project`                         | No `package.json` found                 | No JS workspace package | unknown / needs owner decision                                           | Python/data-heavy healthcare project with disease/diagnosis data. Treat as DO_NOT_TOUCH until classified.                              |
| `apps/prototype/sentra-rag-dashboard`                     | No `package.json` found                 | No JS workspace package | prototype-or-deprecated-app                                              | Prototype RAG dashboard folder; no workspace package. Needs owner decision before cleanup or wiring.                                   |

## Crown-Jewel Consumption Findings

| App                                 | Evidence                                                                                                                                                            | Finding                                                                                              | Recommendation                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `apps/healthcare/intelligenceboard` | `package.json` has `@sentra/nada`; `src/lib/cdss/symphony-safety-gates.ts` imports `@sentra/nada`; `scripts/test-symphony-route-parity.ts` requires `@sentra/nada`. | Active monorepo crown-jewel consumption through package import. Also has app-local CDSS engine code. | Treat as CJ-3 or CJ-4 candidate until owner confirms whether `@sentra/nada` is an approved facade or internal-core exception. |
| `apps/corporate/ferdiiskandar`      | `package.json` has `@sentra/design-token`; `app/globals.css` imports `@sentra/design-token/css`.                                                                    | Sentra design-token consumption only, not clinical crown-jewel.                                      | Acceptable shared design dependency; classify separately from clinical/RAG/OCR crown jewels.                                  |
| `apps/community/classy-transformer` | `package.json` has `@sentra/design-token`; `app/globals.css` imports `@sentra/design-token/css`.                                                                    | Sentra design-token consumption only.                                                                | Acceptable shared design dependency; does not prove document-intelligence crown-jewel access.                                 |
| `apps/healthcare/sentra-assist`     | `package.json` has `@the-abyss/shared-types`; clinical components import `@the-abyss/shared-types`.                                                                 | Shared type contract consumption.                                                                    | Keep as CJ-3 monorepo-bound client candidate; verify local CDSS engine ownership before edits.                                |
| `apps/academic/evaluation-engine`   | `package.json` has `@the-abyss/database` and `@the-abyss/shared-types`.                                                                                             | Platform DB/shared type consumption.                                                                 | Needs explicit approved access mode; not necessarily Sentra crown-jewel but extraction-relevant.                              |
| `apps/academic/clinical-simulator`  | `package.json` has `@the-abyss/langflow-client` and `@the-abyss/ui`.                                                                                                | Platform/client consumption.                                                                         | Likely acceptable, but should be captured in manifest.                                                                        |

## Forbidden Import Candidates

| Pattern                        | Result                          | Notes                                                                  |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| `from '@sentra/...src'`        | No matches                      | Required scan returned no candidates.                                  |
| `from '@sentra/...internal'`   | No matches                      | Required scan returned no candidates.                                  |
| `from '...src/internal'`       | No matches                      | Required scan returned no candidates.                                  |
| Sibling `apps/` imports        | No matches                      | Required scan returned no candidates.                                  |
| Core package imports from apps | Not part of this apps-only scan | Recommended next audit should scan `packages/**` for `apps/*` imports. |

## Direct Database Access Candidates

| App                                         | Evidence                                                                                                                                                                             | Risk                                                                                                   | Recommendation                                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `apps/healthcare/intelligenceboard`         | `@prisma/client`, `@prisma/adapter-pg`, `pg`, `prisma`; `src/lib/prisma.ts`; many API/lib imports from `@/lib/prisma`; generated Prisma type imports from `prisma/generated/prisma`. | High extraction and data-boundary risk; direct DB access is central to the app.                        | Classify as internal-operator-app or service-backed product before extraction. Require owner-approved DB boundary. |
| `apps/community/classy-transformer`         | `@prisma/client`, `prisma`, `pg`, `@supabase/*`; local `lib/db/prisma.ts`; Supabase clients.                                                                                         | Medium extraction risk; owns its own product DB/auth layer.                                            | Document as app-owned product database unless owner says it touches crown-jewel data.                              |
| `apps/community/classy-transformer/website` | `drizzle-orm`, `drizzle-kit`, `mysql2`; `api/queries/connection.ts`, `db/schema.ts`.                                                                                                 | Medium extraction risk; nested companion app has separate DB stack.                                    | Owner decision: keep as nested companion, merge, or future standalone.                                             |
| `apps/community/daf-website`                | `@prisma/client`, `prisma`; `lib/prisma.ts`; `prisma/schema.prisma`.                                                                                                                 | Low to medium extraction risk; app-local foundation website DB.                                        | Document as app-owned DB.                                                                                          |
| `apps/academic/evaluation-engine`           | `@the-abyss/database` dependency.                                                                                                                                                    | Medium platform-coupling risk.                                                                         | Replace direct DB dependency only in a future approved wiring mission; do not refactor now.                        |
| `apps/healthcare/referralink`               | `pg`, `@neondatabase/serverless`, `@vercel/postgres`, `@upstash/redis`, `@upstash/vector`; SQL/database folders.                                                                     | Medium to high extraction risk due healthcare workflow plus direct cloud DB/cache/vector dependencies. | Require manifest declaring app-owned DB/vector stores and clinical boundary.                                       |

## Sibling App Coupling Candidates

No direct sibling app import candidates were found by:

```powershell
rg -n "from ['\"]apps/|from ['\"].*apps/" apps
```

Operational coupling still appears in docs/runtime names, especially ASSIST to
IntelligenceBoard bridge concepts, but this is not direct source import
coupling.

## Clinical, Diagnosis, RAG, OCR, and Document-Intelligence Candidates

| App                                   | Evidence                                                                                                                                                                                                  | Boundary interpretation                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/healthcare/intelligenceboard`   | `src/lib/cdss/engine.ts`, `src/lib/cdss/hybrid.ts`, `src/lib/cdss/validation.ts`, `src/app/api/cdss/diagnose/route.ts`, `src/app/api/clinical/*`, `scripts/test-cdss*.ts`, `@sentra/nada` usage.          | Strongest candidate for current app-local crown-jewel ownership or internal-core access. Needs owner decision before any structural change. |
| `apps/healthcare/sentra-assist`       | `entrypoints/background.ts` imports `@/lib/iskandar-diagnosis-engine`; background handler says "Run REAL CDSS Engine"; `components/cdss/*`; `components/clinical/*`; README says connects to AADI engine. | Appendix says client surface, but repo evidence shows local CDSS engine code. Report as conflict candidate; do not refactor.                |
| `apps/healthcare/referralink`         | `api/diagnosis.ts`; `services/diagnosisApiClient.ts`; `services/cacheService.ts` includes diagnosis cache; README says AI-assisted referral.                                                              | Appendix default CJ-0/CJ-1 conflicts with diagnosis API evidence. Likely needs CJ-2/CJ-3 or explicit exception.                             |
| `apps/healthcare/sidelab-project`     | `data/penyakit.json` contains clinical/diagnosis fields and disease data; no package manifest.                                                                                                            | Unknown/prototype healthcare knowledge app. DO_NOT_TOUCH until classified.                                                                  |
| `apps/prototype/sentra-rag-dashboard` | Folder and README indicate prototype RAG dashboard; no package manifest found.                                                                                                                            | Prototype RAG surface; not workspace-wired as JS package.                                                                                   |
| `apps/healthcare/sentra-main`         | `docs/CLINICAL_LOGIC.md` states the site contains no executable clinical decision logic and only presents capabilities.                                                                                   | Marketing/showcase app; clinical content governance still required.                                                                         |

## Proposed Provisional Classification Updates

These updates are provisional and non-enforcing. Repo evidence wins temporarily
over Appendix A, but owner decision is required before structural changes.

| App                  | Appendix candidate                                        | Evidence-based provisional update                                                                                                                                                      | Conflict?                                 | Required owner decision                                                                     |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `sentra-assist`      | monorepo-bound-client-app, CJ-3, no crown-jewel ownership | Keep monorepo-bound-client-app, but mark "local CDSS engine conflict candidate" due `lib/iskandar-diagnosis-engine` and background CDSS execution.                                     | Yes                                       | Is local CDSS code allowed client-side, or should it move behind service facade?            |
| `aadi`               | monorepo-bound-client-app, CJ-3                           | No concrete app path found. AADI appears as concept/content and in IntelligenceBoard docs/API naming.                                                                                  | No path conflict, but unresolved identity | Which path owns AADI runtime, if any?                                                       |
| `intelligenceboard`  | internal-operator-app or standalone-with-CJ, CJ-2/CJ-3    | Elevate to CJ-3/CJ-4 candidate because it imports `@sentra/nada`, owns CDSS routes/engine code, and writes clinical/audit DB state.                                                    | Partial                                   | Is it an internal operator app, crown-jewel owner, or facade-backed product?                |
| `referralink`        | standalone-product-app default, CJ-0/CJ-1                 | Raise to standalone-product-with-crown-jewel-consumption candidate, CJ-2/CJ-3 candidate, due diagnosis API/client and healthcare AI workflow evidence.                                 | Yes                                       | Should referral diagnosis live behind an approved Sentra facade/API?                        |
| `classy-transformer` | standalone-product-with-CJ, CJ-2                          | Keep as CJ-1/CJ-2 candidate only if document-intelligence/OCR consumption is confirmed. Current evidence shows design-token plus app-owned DB/LLM stack, not Sentra OCR/RAG internals. | Minor                                     | Does this app consume Sentra document intelligence, or is it independent LLM product logic? |
| `ferdiiskandar`      | standalone-product-app, CJ-0                              | Keep CJ-0 for clinical crown jewels; `@sentra/design-token` is shared design infrastructure, not clinical crown-jewel.                                                                 | No                                        | Confirm design-token is allowed for future standalone extraction.                           |

## Apps Requiring Owner Decision

| App                                                       | Reason                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/healthcare/intelligenceboard`                       | Active `@sentra/nada`, CDSS engine/routes, clinical report/audit DB writes, and direct Prisma database access.         |
| `apps/healthcare/sentra-assist`                           | Intended client surface but contains local Iskandar/CDSS engine references.                                            |
| `apps/healthcare/referralink`                             | Provisional standalone CJ-0/CJ-1 conflicts with app-local diagnosis API/client evidence.                               |
| `apps/healthcare/sidelab-project`                         | Healthcare diagnosis data, no JS package manifest, unclear product status.                                             |
| `apps/prototype/sentra-rag-dashboard`                     | Prototype RAG dashboard, no package manifest, unclear future.                                                          |
| `apps/community/classy-transformer/website/blueprint/app` | Generic `my-app` package in blueprint folder; unclear if artifact, prototype, or template.                             |
| `apps/academic/evaluation-engine`                         | Direct `@the-abyss/database` dependency and evaluation domain; may be internal operator rather than future standalone. |

## Recommended Next Mission

`ABYSS-APPS-GOV-003 - Owner Decision and app.boundary.json Drafts`

Goal: create draft `app.boundary.json` manifests for `sentra-assist`,
`intelligenceboard`, `referralink`, `classy-transformer`, `ferdiiskandar`, and
`aadi` if/when its path is confirmed. This should remain documentation-only and
should not refactor imports, move code, add lint enforcement, or modify
crown-jewel packages.

Recommended manifest fields:

- `appId`
- `path`
- `packageName`
- `productClassification`
- `futureStandaloneRepo`
- `crownJewelTier`
- `approvedAccessMode`
- `ownsCrownJewelLogic`
- `allowedImports`
- `forbiddenImports`
- `databaseAccessMode`
- `ownerDecisionStatus`
- `lastVerified`

## Verification Evidence

Commands run:

```powershell
git status --short
git diff --stat
Get-ChildItem apps -Directory
Get-ChildItem apps -Directory -Recurse -Depth 2
Get-ChildItem apps -Recurse -Filter package.json | Select-Object FullName
git check-ignore -v apps\_governance\reports\2026-05-25-apps-import-boundary-audit.md
Get-Content pnpm-workspace.yaml
pnpm -r list --depth 0 --filter "./apps/**"
rg -n "@sentra/|@the-abyss/" apps
rg -n "from ['\"]@sentra/.*src|from ['\"]@sentra/.*internal|from ['\"].*src/internal" apps
rg -n "from ['\"]apps/|from ['\"].*apps/" apps
rg -n "@abyss/database|@sentra/database|@the-abyss/database|prisma|drizzle|supabase" apps
rg -n "diagnosis|clinical|rag|ocr|document-intelligence|AADI|ASSIST|assist|aadi" apps
```

Follow-up normalized scans excluded generated/vendor/cache artifacts such as
`node_modules`, `.next`, `.turbo`, `.wxt`, `.output`, `dist`,
`prisma/generated`, `*.tsbuildinfo`, and generated API docs.

Results:

- Report path is allowed by `.gitignore` due `!apps/_governance/**`.
- `pnpm-workspace.yaml` includes `apps/*`, `apps/*/*`, and
  `apps/community/classy-transformer/website`.
- App package inventory found 14 `package.json` files after generated/vendor
  exclusions.
- Direct forbidden internal import scans returned no matches.
- Sibling app import scan returned no matches.
- Crown-jewel/package scan found `@sentra/nada`, `@sentra/design-token`,
  `@the-abyss/shared-types`, `@the-abyss/database`,
  `@the-abyss/langflow-client`, and `@the-abyss/ui` usage.
- Database scan found direct DB/client access in `intelligenceboard`,
  `classy-transformer`, `classy-transformer/website`, `daf-website`,
  `evaluation-engine`, and `referralink`.
- Clinical/diagnosis scan found local clinical/CDSS/diagnosis candidates in
  `intelligenceboard`, `sentra-assist`, `referralink`, `sidelab-project`, and
  prototype RAG references.

Post-write verification:

```powershell
pnpm typecheck
pnpm build
git status --short
git diff --stat
```

Post-write results:

- `pnpm typecheck`: PASS. Ran root typecheck and generated Prisma client through
  the repo script.
- `pnpm build`: PASS. Turbo reported `24 successful, 24 total`.
- `pnpm build` warnings: existing warning noise included Referralink CSS
  pseudo-class warnings, large chunk warning, baseline-browser-mapping age
  warnings, missing `metadataBase` warning for `academic-solutions`, and
  IntelligenceBoard NFT trace warnings. These were not fixed in this audit-only
  mission.
- `git status --short`: shows this report under untracked `apps/_governance/`
  along with pre-existing unrelated dirty files.
- `git diff --stat`: tracked diff remains limited to pre-existing tracked
  changes and does not include this untracked report until staged.
