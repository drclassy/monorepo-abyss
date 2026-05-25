# AGENTS.md - apps/

## Scope

Read the root [`AGENTS.md`](../AGENTS.md) first. Root instructions win on any
conflict.

`apps/` is not a homogeneous application layer. It is a portfolio workspace
containing independent product islands, future standalone repositories,
monorepo-bound client surfaces, internal operator tools, prototypes, and
products that may consume monorepo crown-jewel capabilities.

Before editing any app, Codex or any agent must classify the app boundary and
report the preflight described in
[`_governance/APP_BOUNDARY_PREFLIGHT.md`](./_governance/APP_BOUNDARY_PREFLIGHT.md).

## Required Governance Reads

For app work, read these files after root `AGENTS.md`:

1. This file.
2. [`_governance/APP_CLASSIFICATION.md`](./_governance/APP_CLASSIFICATION.md).
3. [`_governance/CROWN_JEWEL_ACCESS_TIERS.md`](./_governance/CROWN_JEWEL_ACCESS_TIERS.md).
4. [`_governance/APP_BOUNDARY_PREFLIGHT.md`](./_governance/APP_BOUNDARY_PREFLIGHT.md).
5. [`_governance/OWNER_DECISION_MATRIX.md`](./_governance/OWNER_DECISION_MATRIX.md),
   if the target app is listed there.
6. The nearest domain or app-level `AGENTS.md`.

## Default Boundary Rules

- Product independence and crown-jewel consumption are separate questions.
- Independent apps may consume crown-jewel capabilities only through declared
  contracts, SDK/API clients, or service facades.
- Apps must not import sibling apps.
- Apps must not import crown-jewel `src`, `internal`, or private implementation
  paths.
- Apps must not own, fork, copy, or silently reimplement diagnosis, clinical
  reasoning, RAG, OCR, or document-intelligence algorithms.
- Core packages must not import `apps/*`.
- Direct writes from apps to core crown-jewel databases require an explicit
  owner decision.
- ASSIST and AADI are treated as monorepo-bound client surfaces for now. They
  may consume diagnosis or clinical capabilities through approved facades, but
  the algorithm remains monorepo-owned.

## Allowed Access Shape

```text
app -> contracts / SDK / API / service facade -> crown-jewel core
```

## Forbidden Access Shapes

```text
app -> crown-jewel/src/internal/*
app copies/forks diagnosis/RAG/OCR/document-intelligence algorithms
core package imports apps/*
```

## Non-Scope For This Governance Layer

This file does not enforce lint rules, refactor imports, move apps, create
manifests, or change product source code.
