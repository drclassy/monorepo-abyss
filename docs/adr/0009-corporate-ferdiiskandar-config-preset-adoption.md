# ADR 0009 — Corporate `@the-abyss/ferdiiskandar` Config Preset Adoption

**Date:** 2026-05-07
**Status:** Accepted
**Decider:** Dr. Ferdi Iskandar (Chief)
**Mission:** ABYSS-REPO-STRUCTURE-002

---

## Context

`@the-abyss/ferdiiskandar` was migrated into `apps/corporate/` on 2026-05-07
(see `.agent/DECISIONS.md` 2026-05-07 entry "ferdiiskandar migrated from
class-prototype into apps/corporate/"). The migration commit landed with the
source repo's standalone tooling configuration intact:

- `eslint.config.mjs` extends only `next/core-web-vitals` via `FlatCompat`,
  with no link to `@the-abyss/config-eslint`.
- `tsconfig.json` declares all compiler options inline; it does not extend
  `@the-abyss/config-typescript/tsconfig.json`.

This places ferdiiskandar outside the lint and TypeScript baseline that
`AGENTS.md` §8 declares as shared standards and that ADR 0008 reaffirms by
locating the presets at `packages/tooling/config-eslint` and
`packages/tooling/config-typescript`.

**Current adoption landscape across the monorepo:**

| Surface | Depends on `@the-abyss/config-*` | Actually extends/imports |
|---|---|---|
| Internal packages (sentra/platform/clinical/shared) | 13 packages declare devDep | 1 package (`@the-abyss/document-ingestion`) extends `tsconfig.json`; ESLint extension pattern not yet observed in monorepo flat configs |
| Apps (`apps/**`) | 0 | 0 |
| Tooling itself | self-references | n/a |

**Preset surface, summarized:**

`@the-abyss/config-eslint`
- `./base` — `@eslint/js` recommended + `typescript-eslint` strict +
  `import-x/order` and `import-x/no-duplicates` + `consistent-type-imports`
  (error level) + `no-explicit-any` (error level) + ignore globs for
  `dist`, `docs`, `node_modules`, `.next`, `.output`, `.turbo`, `coverage`.
- `./react` — `./base` plus `react.version: 'detect'` and
  `no-console: ['warn', { allow: ['warn', 'error'] }]`.
- `./node` — `./base` plus `no-console: 'off'`.
- `boundaries` export — domain restriction patterns for healthcare/academic/
  incubator/shared/platform/clinical/sentra and a tooling-import guard.

`@the-abyss/config-typescript`
- Single `tsconfig.json` exporting `target/module: ESNext`,
  `moduleResolution: node`, `esModuleInterop: true`, `strict: true`,
  `skipLibCheck: true`. Consumers extend and override.

**Why ferdiiskandar is the test case:**

ferdiiskandar is the first `apps/**` member to land cleanly in the polyrepo
shell with full verification (build/lint/typecheck/test green). It is a
Tier 3 Shell — no PHI, no clinical reasoning, no infra side effects. It is
also small (~30 source files). If preset adoption fails on this surface, it
will fail elsewhere; if it succeeds, ferdiiskandar becomes the reference
recipe for the next app.

---

## Decision

**Adopt `@the-abyss/config-eslint/react` and `@the-abyss/config-typescript`
in `@the-abyss/ferdiiskandar` as the canonical configuration source.**
Implementation is split across two phases to manage cascade risk:

### Phase A — Decision recorded (this ADR, 2026-05-07)

Adoption is declared. The standalone configuration in ferdiiskandar is
treated as a transitional state, not the long-term shape.

### Phase B — Implementation (separate Class B work item)

Apply the adoption recipe below in a dedicated commit that owns both the
configuration edits and any source code adjustments required by the new
rule set.

**ESLint adoption recipe** (`apps/corporate/ferdiiskandar/eslint.config.mjs`):

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import { react } from '@the-abyss/config-eslint/react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'docs/**',
      '.output/**',
      'dist/**',
      'coverage/**',
    ],
  },
  ...react,
  ...compat.extends('next/core-web-vitals'),
]
```

The `next/core-web-vitals` layer is preserved because `@the-abyss/config-eslint`
intentionally carries no Next.js-specific rules. The `react` preset adds
the strict TypeScript + import-x baseline; `next/core-web-vitals` keeps
the framework-specific checks (e.g. `next/no-html-link-for-pages`).

**TypeScript adoption recipe** (`apps/corporate/ferdiiskandar/tsconfig.json`):

```json
{
  "extends": "@the-abyss/config-typescript/tsconfig.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "target": "ES2022"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "tests/e2e/**"]
}
```

The override of `moduleResolution: bundler` is mandatory; the preset's
`node` value is incorrect for Next 15.5+. The `target: ES2022` override
is retained because Next's own type defs target ES2022. The
`@the-abyss/document-ingestion` tsconfig pattern (extend + override
`moduleResolution`) is the precedent.

**`package.json` additions** (devDependencies):

```json
{
  "@the-abyss/config-eslint": "workspace:*",
  "@the-abyss/config-typescript": "workspace:*"
}
```

### Phase B verification gate

Phase B is complete only when, run from the monorepo root:

```
pnpm install
pnpm --filter @the-abyss/ferdiiskandar typecheck
pnpm --filter @the-abyss/ferdiiskandar lint
pnpm --filter @the-abyss/ferdiiskandar build
pnpm --filter @the-abyss/ferdiiskandar test
```

…all exit 0. Anticipated remediation work in Phase B:

- `import-x/order` will likely flag the existing import ordering across
  ~30 source files. Expected fix: `pnpm --filter @the-abyss/ferdiiskandar
  lint --fix` plus manual review of any non-mechanical conflicts.
- `consistent-type-imports` will flag any `import { Foo }` that should be
  `import type { Foo }`. Expected fix: same lint --fix sweep.
- `no-explicit-any` is already enforced via the source's existing
  `eslint-config-next` integration; no incremental impact expected.
- The 5 `eslint-disable react-hooks/set-state-in-effect` comments added
  during the 2026-05-07 migration remain valid; the preset does not
  change React hooks rules.

### Out of Scope for this ADR

- Adoption in other `apps/**` (intelligenceboard, classy-transformer,
  sentra-assist, etc.). Each app has its own framework-specific rules
  (Vite, WXT, etc.) and needs its own analysis.
- Adoption in internal `packages/**`. Several already declare the dep but
  have not extended; that gap is a separate cleanup track.
- Modifications to the `@the-abyss/config-eslint` or
  `@the-abyss/config-typescript` packages themselves.
- Boundary rules — the preset's `boundaries` export is concerned with
  cross-domain `apps/healthcare/**` ↔ `apps/academic/**` etc., which is
  not relevant to a single corporate-domain app. ferdiiskandar does not
  need the boundaries layer.

---

## Rejected Alternatives

1. **Keep ferdiiskandar standalone indefinitely.** Rejected because it
   compounds the existing drift between `AGENTS.md` policy and actual
   repository state (the same gap that motivated ADR 0008's package
   taxonomy work).
2. **Adopt full preset immediately in the migration commit (2026-05-07).**
   Rejected because the migration commit was already large; mixing tooling
   adoption with code-shape lint sweeps would have prevented the bisect
   surface from staying clean.
3. **Cherry-pick individual rules from the preset into ferdiiskandar's
   standalone config.** Rejected because it produces drift by definition;
   the value of a preset is single-source-of-truth, and a cherry-pick
   immediately erodes that.
4. **Replace `next/core-web-vitals` with a Next-specific subset published
   in the monorepo.** Rejected because `next/core-web-vitals` is
   maintained by the Next.js team and tracks framework changes; replacing
   it would be a multi-ADR undertaking with low payoff for a single Tier 3
   site.
5. **Adopt only `@the-abyss/config-typescript`, not the ESLint preset.**
   Rejected because the preset's value is greatest in lint-time enforcement
   (`consistent-type-imports`, `import-x/order`); skipping ESLint defeats
   the larger consistency goal.

---

## Consequences

**Positive:**

- Establishes the first concrete `apps/**` reference for preset adoption.
  Subsequent corporate, academic, and healthcare apps inherit a working
  recipe rather than re-deriving the integration.
- Shared rule changes in `@the-abyss/config-eslint` propagate to
  ferdiiskandar via lockfile updates rather than manual config edits per
  app.
- `consistent-type-imports` enforcement at lint time reduces emitted bundle
  size for type-only imports (Next ≥ 13 already does the elision, but the
  rule keeps the codebase intentional).
- `boundaries` export is available for future use if `apps/corporate/**`
  ever spans multiple sub-apps with cross-import constraints.

**Negative / Trade-offs:**

- Phase B will produce a large lint --fix sweep commit. The diff will be
  noisy but mechanical; the commit message must explicitly call this out
  so future blame queries can skip it.
- ferdiiskandar now depends on internal monorepo packages (`workspace:*`).
  Any future plan to extract ferdiiskandar to a standalone repo must
  un-bundle this dependency first.
- The `react` preset's `no-console: ['warn', { allow: ['warn', 'error'] }]`
  may surface console.log calls that source currently tolerates.
  Expected: minor; ferdiiskandar is a marketing site without server
  console flow.

**Neutral:**

- The standalone configuration in ferdiiskandar remains valid until
  Phase B lands. CI does not break in the interim.

---

## Phase B Execution Notes

When Phase B is opened:

1. Branch from the merged migration baseline (post-merge of
   `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`).
2. Add devDependencies, run `pnpm install` from monorepo root, verify
   workspace links resolve.
3. Replace `eslint.config.mjs` and `tsconfig.json` per the recipes above.
4. Run `pnpm --filter @the-abyss/ferdiiskandar lint --fix`. Inspect the
   diff. Resolve any remaining errors manually.
5. Run the full verification gate. Commit.
6. Update `.agent/DECISIONS.md` with a new entry referencing this ADR
   and noting the adoption is complete.
7. Optionally update `docs/adr/README.md` index — note that the index is
   currently stale (lists only 001-005); a separate doc cleanup is
   warranted.

---

## References

- ADR 0008 — Package Taxonomy and Boundary Model
- `AGENTS.md` §8 — Code Style Guidelines (ESLint section)
- `packages/tooling/config-eslint/{base,react,node}.js`
- `packages/tooling/config-typescript/tsconfig.json`
- `packages/platform/document-ingestion/tsconfig.json` — concrete
  precedent for extends + `moduleResolution: bundler` override
- `.agent/DECISIONS.md` — entry "[2026-05-07] ferdiiskandar migrated from
  class-prototype into apps/corporate/"
