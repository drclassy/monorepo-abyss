# App Classification

## Purpose

This document defines product classification for apps in `apps/`.

Product classification answers:

- What kind of product or surface is this app?
- Can it become a standalone repository later?
- Is it a client, operator surface, prototype, or independent product?

Product classification does not by itself answer how the app may consume
crown-jewel capabilities. Crown-jewel access is defined separately in
[`CROWN_JEWEL_ACCESS_TIERS.md`](./CROWN_JEWEL_ACCESS_TIERS.md).

## Required Classification Fields

Every app boundary preflight must identify:

- product classification
- future standalone repo status
- crown-jewel access tier
- approved access mode
- whether the app owns crown-jewel logic
- allowed imports
- forbidden imports
- verification command

## Product Classifications

### `standalone-product-app`

An app intended to stand as an independent product or future standalone
repository.

Default expectations:

- future standalone repo status is usually `Yes`
- default crown-jewel access is `CJ-0 none`
- app owns product UI, product workflow, and app-local orchestration
- app does not own crown-jewel algorithms

Important: standalone does not mean the app can never consume crown-jewel
capability. It means any consumption must use declared boundaries such as
contracts, SDK/API clients, or service facades.

### `standalone-product-with-crown-jewel-consumption`

An independent product that may consume monorepo crown-jewel capability through
approved boundaries.

Default expectations:

- future standalone repo status is usually `Yes`
- crown-jewel access is usually `CJ-1`, `CJ-2`, or `CJ-3`
- access mode must be declared
- internal crown-jewel imports remain forbidden
- app must not fork or copy crown-jewel algorithms

### `monorepo-bound-client-app`

A client surface that depends on monorepo-owned core capabilities and is not
currently treated as a standalone repo candidate.

Default expectations:

- future standalone repo status is usually `No / not now`
- crown-jewel access is usually `CJ-2` or `CJ-3`
- app does not own diagnosis, clinical reasoning, RAG, OCR, or
  document-intelligence algorithms
- app may consume approved service facades or clients

ASSIST and AADI are treated as monorepo-bound client surfaces for now unless an
owner decision reclassifies them.

### `internal-operator-app`

An internal dashboard, operator console, admin surface, or control room.

Default expectations:

- future standalone repo status may be `TBD`
- crown-jewel access may be `CJ-1`, `CJ-2`, or `CJ-3`
- app may observe or operate workflows
- app does not automatically gain internal core access
- direct database access must be documented before structural changes

### `prototype-or-deprecated-app`

An incubator, experiment, archive-like surface, or deprecated app.

Default expectations:

- future standalone repo status is usually `TBD` or `No / not now`
- crown-jewel access should be minimal
- app should not become an architecture reference without owner approval
- production code should not depend on prototype-only paths

## Future standalone repo status

Use one of:

| Status         | Meaning                                                          |
| -------------- | ---------------------------------------------------------------- |
| `Yes`          | The app is intended or likely to become a standalone repository. |
| `No / not now` | The app should remain monorepo-bound for now.                    |
| `TBD`          | The owner decision or repo evidence is not yet clear.            |

## Evidence Rule

Before changing app structure, Codex must verify repo evidence:

- package name and workspace filter
- existing imports
- `@sentra/*` imports
- crown-jewel `src` or `internal` imports
- direct database access
- intended future standalone strategy

If this document or an appendix conflicts with repo evidence, repo evidence wins
temporarily. Codex must report the conflict and request owner decision before
structural changes.
