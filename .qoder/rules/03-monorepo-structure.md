# Rule: Monorepo Structure

**Apply: Always**

## Top-level layout

```
sentra/
├── apps/              # Deployable applications (one per deployment target)
├── packages/          # Reusable libraries (no I/O at module import time)
├── services/          # Long-running backend services
├── prototypes/        # Throwaway experiments — NOT production
├── infra/             # Terraform, k8s manifests, CI configs
├── docs/              # Architecture docs, ADRs, runbooks
├── scripts/           # One-off operational scripts (PowerShell, Bash, Python)
├── .qoder/            # AI agent configuration
└── tests/             # Cross-package integration tests
```

## Dependency direction (strict)

```
apps  ──────►  packages  ◄─────  services
                  ▲
                  │ (consumes)
              prototypes
```

- `apps/` may import from `packages/`. Never the reverse.
- `services/` may import from `packages/`. Never the reverse.
- `apps/` and `services/` **may not** import from each other. They communicate
  over HTTP / gRPC / queues.
- `prototypes/` may import from `packages/` but **packages may never import from
  prototypes**. Prototypes are deletable at any time.

When you detect a violation, propose a refactor rather than implementing across
the boundary.

## Package conventions

Every `packages/<name>/` contains:

```
packages/<name>/
├── pyproject.toml          # or package.json
├── README.md               # What this package does in 3 sentences
├── src/<name>/             # Source
│   └── __init__.py         # Public API only
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/synthetic/ # Synthetic data only
└── AGENTS.md               # Package-specific rules (optional)
```

**Public API rule:** anything not exported from `__init__.py` is private.
Importing from a submodule directly is a violation.

## Naming the right place for new code

Ask in this order:

1. Is this a deployable thing with a UI or HTTP surface? → `apps/` or
   `services/`.
2. Is this reusable logic with no I/O at import time? → `packages/`.
3. Is this an experiment to learn something? → `prototypes/`.
4. Is this build / deploy / infra? → `infra/` or `scripts/`.

If the answer is "I don't know," start in `prototypes/` and promote later. Never
start in `packages/clinical-core/` for an exploratory idea.

## Cross-package types

Shared types live in `packages/shared-types/`. Generate TypeScript from Python
(`pydantic-to-typescript`) so a single source of truth produces both languages.
Hand-maintained duplicate types are a violation.

## Versioning

- Each `packages/<name>/` has its own version in `pyproject.toml` /
  `package.json`.
- Apps consume packages via workspace references (`workspace:*` in pnpm,
  editable installs in uv).
- Breaking changes to a package require a major bump and a migration note in
  `docs/migrations/`.

## When asked to add a new top-level folder

Stop and ask. Top-level folder additions need an ADR (Architecture Decision
Record) in `docs/adr/`. The five folders above cover almost all real cases.
