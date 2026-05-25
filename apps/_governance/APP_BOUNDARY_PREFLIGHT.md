# App Boundary Preflight

## Purpose

Before Codex or any agent edits an app, it must report the app boundary.

This protects product independence, future standalone repo extraction, and
monorepo-owned crown-jewel capabilities.

This document is governance only. It does not refactor imports, enforce lint
rules, create manifests, or change product source code.

## Required Preflight Report

Use this format before implementation inside `apps/`:

| Field                   | Required content                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Target path             | Exact app path to be touched                                                         |
| Target app              | App id or package/workspace name                                                     |
| Domain                  | `healthcare`, `community`, `corporate`, `academic`, or `prototype`                   |
| Product classification  | One value from `APP_CLASSIFICATION.md`                                               |
| Future standalone repo  | `Yes`, `No / not now`, or `TBD`                                                      |
| Crown-jewel access tier | One value from `CJ-0` through `CJ-5`                                                 |
| Crown-jewel access mode | `none`, `contracts`, `SDK/API client`, `service facade`, or approved exception       |
| Owns crown-jewel logic? | `Yes`, `No`, or `TBD`; default is `No`                                               |
| Allowed imports         | App-local imports, shared primitives, contracts, clients, or facades allowed by tier |
| Forbidden imports       | Sibling apps, crown-jewel internals, copied algorithms, reverse core-to-app imports  |
| Verification command    | Smallest relevant command for the target app                                         |

## Required Evidence Checks

Before implementation, Codex must verify:

- `package.json` name
- pnpm workspace filter or app path
- existing imports
- whether the app imports `@sentra/*`
- whether the app imports `src` or `internal` paths
- whether core packages import `apps/*`
- whether the app has direct database access
- whether the app is intended for future standalone extraction

## Conflict Rule

If appendix guidance and repo evidence conflict, repo evidence wins temporarily.

Codex must report the conflict and request owner decision before structural
changes.

Example:

If Appendix A says `referralink` is `CJ-0`, but `rg` finds a direct
`@sentra/diagnosis-core` import, Codex must not refactor immediately. Codex must
report a boundary violation candidate and propose either migration to `CJ-2` or
`CJ-3`, or removal of the dependency.

## Approved Access Modes

| Access mode        | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| `none`             | No crown-jewel dependency.                                 |
| `contracts`        | Types, schemas, DTOs, or public contracts only.            |
| `SDK/API client`   | App consumes a public SDK or API client.                   |
| `service facade`   | App consumes capability through an approved service layer. |
| approved exception | Owner-approved narrow exception with explicit scope.       |

## Forbidden Dependency Shapes

```text
app -> crown-jewel/src/internal/*
app copies/forks diagnosis/RAG/OCR/document-intelligence algorithms
core package imports apps/*
```

## Appendix A - Initial App Classification Candidates

This appendix is provisional.

It is non-enforcing.

It is not final enforcement authority.

Final authority will later be `app.boundary.json` per app or a confirmed owner
decision.

If [`OWNER_DECISION_MATRIX.md`](./OWNER_DECISION_MATRIX.md) lists the target
app, that owner decision supersedes this provisional appendix.

Before implementation, Codex must verify imports, `package.json`, workspace
filter, direct database access, and intended repo strategy.

No source-code changes are allowed in this mission based on this appendix.

| App                  | Current evidence                                                                                   | Proposed class                                                               | Crown-jewel tier                               | Future repo                         | Owns crown-jewel logic? | Confidence | Catatan                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- | ----------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `sentra-assist`      | `apps/healthcare/sentra-assist` exists                                                             | `monorepo-bound-client-app`                                                  | `CJ-3 service-facade`                          | `No / not now`                      | No                      | High       | Client diagnosis/clinical workflow. Algorithm remains monorepo-owned.                                            |
| `aadi`               | Concept/public surface found in `apps/corporate/ferdiiskandar` content; no concrete app path found | `monorepo-bound-client-app` candidate                                        | `CJ-3 service-facade` candidate                | `No / not now` until owner decision | No                      | Medium     | Client clinical reasoning/diagnosis surface. Not an algorithm owner. Find actual app path before implementation. |
| `intelligenceboard`  | `apps/healthcare/intelligenceboard` exists                                                         | `internal-operator-app` or `standalone-product-with-crown-jewel-consumption` | `CJ-2 sdk-api-client` or `CJ-3 service-facade` | `TBD`                               | No                      | Medium-Low | Needs audit: internal dashboard or standalone product.                                                           |
| `referralink`        | `apps/healthcare/referralink` exists                                                               | `standalone-product-app` default                                             | `CJ-0 none` or `CJ-1 contract-only`            | `Yes`                               | No                      | Medium     | Do not access crown-jewel capability unless via contract/API.                                                    |
| `classy-transformer` | `apps/community/classy-transformer` exists                                                         | `standalone-product-with-crown-jewel-consumption`                            | `CJ-2 sdk-api-client`                          | `Yes`                               | No                      | Medium-Low | May consume OCR/document intelligence via SDK/API. Must not import internals or fork algorithms.                 |
| `ferdiiskandar`      | `apps/corporate/ferdiiskandar` exists                                                              | `standalone-product-app`                                                     | `CJ-0 none`                                    | `Yes`                               | No                      | Medium     | Personal/brand site. Default isolated.                                                                           |
