# Agent Integration Instruction — Sentra Design System

## Objective

Integrate the Sentra AI 2026 brand identity into the Abyss monorepo as two
shell-level packages:

1. `packages/design-token` — source of truth for brand tokens.
2. `packages/sentra-ui` — reusable React UI primitives built on top of those
   tokens.

## Non-Negotiable Boundaries

- Do not modify Crown Jewel engines.
- Do not introduce dependencies on clinical logic, SATUSEHAT, BPJS, EMR
  connectors, or internal AI engines.
- These packages are shell-level UI/design infrastructure only.
- Keep packages safe for broader engineering access.

## Implementation Steps

1. Copy `packages/design-token` and `packages/sentra-ui` into the monorepo
   `packages/` directory.
2. Confirm root workspace includes `packages/**`.
3. Run `pnpm install`.
4. Import CSS variables in the target app root:

```ts
import '@sentra/design-token/css'
import '@sentra/ui/styles'
```

5. Add Tailwind preset to app Tailwind config.
6. Replace ad-hoc logo usage with `SentraLogo` or `SentraMark`.
7. Replace repeated CTA/card patterns with `SentraButton`, `SentraCard`,
   `SentraBadge`, and `SentraPanel` where appropriate.

## Verification Checklist

- `pnpm --filter @sentra/design-token typecheck` passes.
- `pnpm --filter @sentra/ui typecheck` passes.
- Target app builds.
- Logo appears correctly on dark and light surfaces.
- CSS variables are visible in browser devtools.
- No package imports from Crown Jewel engines.
