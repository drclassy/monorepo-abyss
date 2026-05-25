# Crown-Jewel Access Tiers

## Purpose

This document defines how apps may consume ABYSS / Sentra crown-jewel
capabilities.

Crown jewels include proprietary diagnosis, clinical reasoning, RAG, OCR,
document-intelligence, and related core algorithms owned by the monorepo.

Product independence does not prohibit crown-jewel usage. It only prohibits
silent dependency on internal monorepo paths, algorithm forks, and app ownership
of crown-jewel logic without explicit classification.

## Approved Access Shape

```text
app -> contracts / SDK / API / service facade -> crown-jewel core
```

## Forbidden Access Shapes

```text
app -> crown-jewel/src/internal/*
app copies/forks diagnosis/RAG/OCR/document-intelligence algorithms
core package imports apps/*
```

## Tier Model

### `CJ-0 none`

The app has no crown-jewel access.

Allowed:

- app-local logic
- shared UI and shared primitive types
- public content and product workflow

Forbidden:

- importing crown-jewel packages
- importing crown-jewel internals
- copying diagnosis, RAG, OCR, document-intelligence, or clinical reasoning
  algorithms

### `CJ-1 contract-only`

The app may depend on approved contracts, schemas, or public types.

Allowed:

- `@sentra/contracts` when it exists and is approved
- stable public DTOs or schemas
- documented public interfaces

Forbidden:

- SDK runtime calls unless classified as `CJ-2`
- service orchestration unless classified as `CJ-3`
- direct internal source imports

### `CJ-2 sdk-api-client`

The app may consume crown-jewel capability through an approved SDK or API
client.

Allowed:

- typed SDK/client calls
- API boundaries
- public package entrypoints designed for app consumption

Forbidden:

- direct imports from `src`, `internal`, private modules, or implementation
  files
- direct writes to core databases without owner decision
- app-owned forks of crown-jewel algorithms

### `CJ-3 service-facade`

The app may consume crown-jewel capability through an approved service facade.

Allowed:

- diagnosis, clinical, RAG, OCR, or document-intelligence capability through a
  facade owned outside the app
- app UI and workflow orchestration around facade responses
- audited service calls with clear human-review boundaries where clinical risk
  exists

Forbidden:

- moving the algorithm into the app
- copying service internals into app code
- bypassing the facade with internal source imports

ASSIST and AADI are treated as `CJ-3` monorepo-bound client surfaces for now.
They may consume diagnosis or clinical capabilities through approved facades,
but the algorithm remains monorepo-owned.

### `CJ-4 internal-core-access`

The app has explicit owner-approved access to internal crown-jewel core.

Allowed only when:

- the owner decision names the app, files, and reason
- the scope is narrow and review-first
- verification proves the boundary remains controlled

This tier is exceptional and must not be inferred from existing imports.

### `CJ-5 crown-jewel-owner`

The package or surface owns a crown-jewel capability.

Default expectation:

- this usually belongs in `packages/sentra/**`, not `apps/**`
- owner decision must explicitly classify the owner
- apps should not become `CJ-5` by accident

## Default Forbidden Rules

- Apps may not import sibling apps.
- Apps may not import `packages/sentra/**/src/**`.
- Apps may not import crown-jewel `internal` paths.
- Apps may not own, fork, copy, or silently reimplement diagnosis, clinical
  reasoning, RAG, OCR, or document-intelligence algorithms.
- Core packages may not import `apps/*`.
- Apps may not directly write to core crown-jewel databases without explicit
  owner decision.

## CROWN_JEWEL Review Rule

Any app work that touches crown-jewel capability must identify:

- product classification
- crown-jewel access tier
- approved access mode
- forbidden imports
- whether the app owns crown-jewel logic
- verification command
