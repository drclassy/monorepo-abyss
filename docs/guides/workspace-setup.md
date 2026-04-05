# Workspace Setup — The Abyss

Panduan workspace commands dan cara kerja monorepo.

## Workspace Members

Monorepo ini punya 4 workspace group:

| Group | Path | Isi |
|-------|------|-----|
| **apps/** | `apps/**` | 7 deployable applications |
| **packages/** | `packages/**` | 12 shared libraries |
| **tooling/** | `tooling/**` | 2 developer tools |
| **flows/** | `flows/**` | Langflow workflow definitions |

## Commands Utama

### Build & Dev

```bash
pnpm build          # Build semua packages (Turborepo cached)
pnpm dev            # Start semua dev servers
pnpm typecheck      # TypeScript strict check dari root
```

### Targeting Specific Package

```bash
# Build satu package saja
pnpm turbo run build --filter=@the-abyss/ui

# Dev server untuk satu app
pnpm turbo run dev --filter=@the-abyss/referralink-api

# Build yang terpengaruh perubahan terbaru
pnpm turbo run build --filter=[HEAD^1]
```

### Dependency Management

```bash
# Tambah dependency ke workspace root
pnpm -w add <package>

# Tambah ke specific package
pnpm add <package> --filter @the-abyss/ui

# Tambah dev dependency
pnpm add -D <package> --filter @the-abyss/database
```

### Database (Prisma)

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema ke database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

## Turborepo Cache

Turborepo meng-cache build artifacts. Jika package tidak berubah, build di-skip.

```bash
# Lihat dependency graph
pnpm graph

# Bersihkan semua cache
pnpm clean
```

## Path Aliases

Import dari shared packages menggunakan `@the-abyss/*`:

```typescript
import { Button } from '@the-abyss/ui'
import { db } from '@the-abyss/database'
import type { Patient } from '@the-abyss/shared-types'
```
