# @the-abyss/shared-types

Central TypeScript type contracts for the Abyss monorepo. All apps and packages
import shared domain types from here — prevents type drift between packages and
enforces a single source of truth for API boundaries.

## Install

```bash
pnpm add @the-abyss/shared-types
```

## Usage

```typescript
import type {
  User,
  ApiResponse,
  PaginatedResponse,
  AiSession,
} from '@the-abyss/shared-types'

function getUsers(): Promise<PaginatedResponse<User>> { ... }
function handleResponse<T>(res: ApiResponse<T>): T { ... }
```

## Exports

| Category              | Types                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| **Auth**              | `User`, `Role`, `Session`                                                |
| **Organization**      | `Organization`, `App`                                                    |
| **AI Sessions**       | `AiSession`, `AiSessionStatus`, `AiSessionMetrics`                       |
| **Audit**             | `AuditLog`                                                               |
| **Flows**             | `FlowDefinition`, `FlowExecution`, `FlowExecutionStatus`, `FlowMetadata` |
| **API Keys**          | `ApiKey`                                                                 |
| **Response wrappers** | `ApiResponse`, `ApiError`, `PaginatedResponse`, `PaginationParams`       |
| **Handoffs**          | `Handoff`, `HandoffStatus`, `HandoffApproval`                            |
| **Config**            | `ClaudesyWorkflowConfig`                                                 |
