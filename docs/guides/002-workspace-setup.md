---
id: workspace-setup
type: guide
status: active
owner: sentra-engineering
tags: [workspace, pnpm, turborepo]
---

# Workspace setup in The Abyss

Workspace commands and how the monorepo works.

## Workspace members

The monorepo has four workspace groups:

| Group | Path | Contents |
|-------|------|----------|
| **apps/** | `apps/**` | 7 deployable applications |
| **packages/** | `packages/**` | 12 shared libraries |
| **tooling/** | `tooling/**` | 2 developer tools |
| **flows/** | `flows/**` | Langflow workflow definitions |

## Core commands

### Build and dev

```bash
pnpm build          # Build all packages (Turborepo cached)
pnpm dev            # Start all dev servers
pnpm typecheck      # TypeScript strict check from root
```

### Target a specific package

```bash
# Build a single package
pnpm turbo run build --filter=@the-abyss/ui

# Dev server for a single app
pnpm turbo run dev --filter=@the-abyss/referralink

# Build packages affected by recent changes
pnpm turbo run build --filter=[HEAD^1]
```

### Dependency management

```bash
# Add dependency to workspace root
pnpm -w add <package>

# Add to a specific package
pnpm add <package> --filter @the-abyss/ui

# Add dev dependency
pnpm add -D <package> --filter @the-abyss/database
```

### Database (Prisma)

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

## Turborepo cache

Turborepo caches build artifacts. Unchanged packages are skipped automatically.

```bash
# View dependency graph
pnpm graph

# Clear all cache
pnpm clean
```

## Path aliases

Shared packages are imported using `@the-abyss/*`:

```typescript
import { Button } from '@the-abyss/ui'
import { db } from '@the-abyss/database'
import type { Patient } from '@the-abyss/shared-types'
```
