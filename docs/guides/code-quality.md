# Code Quality Standards — The Abyss

Standar kualitas kode yang ditegakkan di seluruh monorepo.

## TypeScript Strict Mode

Root `tsconfig.json` mengaktifkan strict mode penuh:

- `strict: true` — semua strict checks aktif
- `noUnusedLocals: true` — variabel tidak terpakai = error
- `noUnusedParameters: true` — parameter tidak terpakai = error
- `noFallthroughCasesInSwitch: true` — switch tanpa break = error

**Aturan:** Tidak ada `any` type. Gunakan `unknown` lalu type-narrow.

```typescript
// SALAH
function process(data: any) { ... }

// BENAR
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}
```

## ESLint

Config dari `@the-abyss/config-eslint` dengan 3 preset:

| Preset | Untuk | Import |
|--------|-------|--------|
| `base` | Semua TypeScript | `@the-abyss/config-eslint/base` |
| `react` | React/Next.js apps | `@the-abyss/config-eslint/react` |
| `node` | Node.js services | `@the-abyss/config-eslint/node` |

Rules utama:
- `no-explicit-any` — error
- `consistent-type-imports` — enforce `import type`
- `import-x/order` — auto-sort imports
- Domain boundary rules — cegah cross-domain imports

```bash
pnpm lint           # Lint semua workspace
```

## Prettier

Config di root `.prettierrc`:
- 2 spaces, no semicolons, single quotes
- 100 char print width (120 untuk JSON, 80 untuk MD)
- Trailing comma: es5
- End of line: LF

```bash
pnpm format         # Auto-format semua files
pnpm format:check   # Check tanpa modifikasi
```

## lint-staged

Pre-commit hooks via lint-staged:
- `*.{ts,tsx}` → eslint --fix + prettier --write
- `*.{json,md,yml}` → prettier --write

## Domain Boundaries

Cross-domain imports dilarang:

```typescript
// Di apps/academic/...
import { patient } from '../../apps/healthcare/...'  // ESLint ERROR

// Gunakan shared packages sebagai gantinya:
import type { Patient } from '@the-abyss/shared-types'  // OK
```

## Commit Convention

Format: `type(scope): description`

```
feat(healthcare): add patient intake form
fix(database): resolve migration conflict
chore(ci): update Node.js version in workflow
docs(adr): add ADR-0007 for caching strategy
```

Branch naming: `feat/*`, `fix/*`, `chore/*`, `docs/*`
