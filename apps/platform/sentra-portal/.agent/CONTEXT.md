# CONTEXT.md — apps/platform/sentra-portal
<!-- Static. Update when stack or architecture changes. -->

## Project Identity

| Field | Value |
|-------|-------|
| Name | Sentra Portal |
| Package | `@the-abyss/sentra-portal` |
| Type | Next.js Clinical Dashboard + DevOps Portal |
| Path | `apps/platform/sentra-portal/` |
| Owner | Chief |

## Scope

Sentra Portal is the main clinical dashboard and DevOps portal for the Abyss monorepo.
It serves as the coordination UI for the Saga Engine (orchestrator).

## Tech Stack

- Next.js (App Router)
- React 19
- Biome (lint/format per package.json)
- Tailwind CSS

## Related Packages

- `@the-abyss/orchestrator` → `apps/platform/orchestrator/` (Saga Engine)
- `@the-abyss/shared-types` → `packages/shared-types/`
