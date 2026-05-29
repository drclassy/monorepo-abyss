---
name: app-boundary-preflight
description:
  Classify app boundary before editing anything under apps/. Use when working on
  apps, app imports, or crown-jewel consumption from an app.
---

# App Boundary Preflight

`apps/` is a portfolio of independent product islands — not one homogeneous
layer.

## Required reads (in order)

1. Root `AGENTS.md`
2. `apps/AGENTS.md`
3. `apps/_governance/APP_BOUNDARY_PREFLIGHT.md`
4. `apps/_governance/APP_CLASSIFICATION.md`
5. Nearest app-level `AGENTS.md` if present

## Report before implementing

```text
App boundary preflight:
- Target app path:
- Classification:
- Crown-jewel access tier (if any):
- Allowed integration shape:
- Forbidden paths confirmed:
```

## Hard rules

- Apps must not import sibling apps.
- Apps must not import crown-jewel `src`, `internal`, or private implementation
  paths.
- Allowed: `app → contracts / SDK / API / service facade → crown-jewel core`
- Direct crown-jewel edits require explicit Chief GO (`packages/sentra/**` is
  review-first).

Do not implement until preflight is written and boundary is clear.
