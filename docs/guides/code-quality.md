---
id: code-quality
type: guide
status: active
owner: sentra-engineering
tags: [quality, typescript, linting]
---

# Code quality standards in The Abyss

Code quality standards enforced across the monorepo.

## TypeScript strict mode

The root `tsconfig.json` enables full strict mode:

- `strict: true` — all strict checks enabled
- `noUnusedLocals: true` — unused variables are errors
- `noUnusedParameters: true` — unused parameters are errors
- `noFallthroughCasesInSwitch: true` — switch fallthrough is an error

**Rule:** No `any` type. Use `unknown` and type-narrow instead.

```typescript
// Wrong
function process(data: any) { ... }

// Correct
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}
```

## ESLint

Config from `@the-abyss/config-eslint` with three presets:

| Preset | For | Import |
|--------|-----|--------|
| `base` | All TypeScript | `@the-abyss/config-eslint/base` |
| `react` | React/Next.js apps | `@the-abyss/config-eslint/react` |
| `node` | Node.js services | `@the-abyss/config-eslint/node` |

Key rules:
- `no-explicit-any` — error
- `consistent-type-imports` — enforce `import type`
- `import-x/order` — auto-sort imports
- Domain boundary rules — prevents cross-domain imports

```bash
pnpm lint           # Lint all workspaces
```

## Prettier

Config in the root `.prettierrc`:
- 2 spaces, no semicolons, single quotes
- 100 char print width (120 for JSON, 80 for MD)
- Trailing comma: es5
- End of line: LF

```bash
pnpm format         # Auto-format all files
pnpm format:check   # Check without modification
```

## lint-staged

Pre-commit hooks via lint-staged:
- `*.{ts,tsx}` → eslint --fix + prettier --write
- `*.{json,md,yml}` → prettier --write

## Domain boundaries

Cross-domain imports are forbidden:

```typescript
// In apps/academic/...
import { patient } from '../../apps/healthcare/...'  // ESLint ERROR

// Use shared packages instead:
import type { Patient } from '@the-abyss/shared-types'  // OK
```

## Commit convention

Format: `type(scope): description`

```
feat(healthcare): add patient intake form
fix(database): resolve migration conflict
chore(ci): update Node.js version in workflow
docs(adr): add ADR-0007 for caching strategy
```

Branch naming: `feat/*`, `fix/*`, `chore/*`, `docs/*`
