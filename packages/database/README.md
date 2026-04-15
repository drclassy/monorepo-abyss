# @the-abyss/database

Prisma client singleton and type exports for the Abyss monorepo. All apps import
the database client from here — never instantiate `PrismaClient` directly in
application code.

## Install

```bash
pnpm add @the-abyss/database
```

## Usage

```typescript
import { prisma, connectDatabase } from '@the-abyss/database'
import type { User, Organization } from '@the-abyss/database'

const user = await prisma.user.findUnique({ where: { id } })
```

## Exports

| Export                                                                                                             | Type      | Description                                                       |
| ------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------- |
| `prisma`                                                                                                           | singleton | Global `PrismaClient` instance (reused across hot reloads in dev) |
| `connectDatabase`                                                                                                  | function  | Explicitly open the database connection                           |
| `disconnectDatabase`                                                                                               | function  | Explicitly close the database connection                          |
| `PrismaClient`                                                                                                     | class     | Re-exported from `@prisma/client`                                 |
| `SagaExecutionStatus`                                                                                              | enum      | Saga state machine status values                                  |
| `User`, `Organization`, `App`, `AiSession`, `AuditLog`, `FlowDefinition`, `FlowExecution`, `Role`, `SagaExecution` | types     | Prisma model types                                                |
| `Prisma`                                                                                                           | namespace | Prisma query builder types and input schemas                      |
