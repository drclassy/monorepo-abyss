# AGENTS.md — packages

<!-- Shared libraries bridge. Per-package norms live next to each package. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../AGENTS.md) first. **Root wins** on any conflict.

This folder holds **shared** libraries consumed by `apps/*`. Follow
**contract-first** design: prefer `shared-types` and existing schemas before
inventing new types.

---

## Packages in this workspace

| Package / folder      | Role                                           |
| --------------------- | ---------------------------------------------- |
| `config-eslint/`      | Shared ESLint config                           |
| `config-typescript/`  | Shared TypeScript config                       |
| `database/`           | `@the-abyss/database` (Prisma)                 |
| `design-token/`       | Design tokens                                  |
| `literature-harvester/` | `@the-abyss/literature-harvester`           |
| `fhir-engine/`        | `@the-abyss/fhir-engine` (compliance-critical) |
| `integration-bridge/` | `@the-abyss/integration-bridge`                |
| `sentra-ui/`          | `@the-abyss/sentra-ui`                         |
| `shared-types/`       | `@the-abyss/shared-types` (contract layer)     |
| `vector-store/`       | `@the-abyss/vector-store`                      |

Root [`AGENTS.md`](../AGENTS.md) §4 also names packages such as
`langflow-client`, `iskandar-gatekeeper`, and `literature-harvester` — keep
them listed here whenever those folders exist in `packages/`.

---

## Conventions

- **Breaking changes:** follow root [`AGENTS.md`](../AGENTS.md) (packages
  section + hierarchy) — impact analysis and consumer builds.
- **Never** commit secrets or PHI in package code or fixtures.
- **Healthcare / FHIR:** treat `fhir-engine` and related boundaries as
  compliance-critical per root directory map.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
