# @the-abyss/iskandar-gatekeeper

Security and validation layer for the Abyss monorepo. Provides Express
middleware for JWT (HS256-only) and API key authentication, plus a CI/CD GO-Gate
validator that blocks pipelines until Chief approves session handoffs.

## Install

```bash
pnpm add @the-abyss/iskandar-gatekeeper
```

## Usage

### JWT middleware

```typescript
import { jwtMiddleware } from '@the-abyss/iskandar-gatekeeper'

app.use('/api', jwtMiddleware(process.env.JWT_SECRET!))
```

### API key middleware with permission enforcement

```typescript
import { apiKeyMiddleware } from '@the-abyss/iskandar-gatekeeper'

// Requires X-API-Key header; key must have 'admin' permission
app.use('/api/admin', apiKeyMiddleware(undefined, ['admin']))
```

### Combined JWT + API key middleware

```typescript
import {
  authMiddleware,
  loadApiKeysFromEnv,
} from '@the-abyss/iskandar-gatekeeper'

app.use(
  '/api',
  authMiddleware({
    jwtSecret: process.env.JWT_SECRET,
    apiKeys: loadApiKeysFromEnv(),
    requiredPermissions: ['read'],
  })
)
```

### GO-Gate validator (CI/CD)

Run as a CI step to block builds until all pending sessions have Chief GO
approval:

```bash
npx tsx packages/iskandar-gatekeeper/src/index.ts
```

## Environment variables (API key mode)

| Variable                              | Description                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `ISKANDAR_API_KEY_<NAME>`             | API key value                                         |
| `ISKANDAR_API_KEY_<NAME>_PERMISSIONS` | Comma-separated permissions (default: `read`)         |
| `ISKANDAR_API_KEY_<NAME>_EXPIRES`     | ISO 8601 expiry date (optional)                       |
| `ISKANDAR_API_KEY`                    | Single fallback key with `read` + `write` permissions |

## Exports

| Export               | Type     | Description                                                      |
| -------------------- | -------- | ---------------------------------------------------------------- |
| `verifyJwt`          | function | Verify an HS256 JWT against a secret                             |
| `validateApiKey`     | function | Check an API key against configured keys (timing-safe)           |
| `loadApiKeysFromEnv` | function | Load API keys from `ISKANDAR_API_KEY_*` env vars                 |
| `jwtMiddleware`      | function | Express middleware — requires `Authorization: Bearer <token>`    |
| `apiKeyMiddleware`   | function | Express middleware — requires `X-API-Key` header                 |
| `authMiddleware`     | function | Combined JWT + API key middleware with optional permission gate  |
| `validateSessions`   | function | GO-Gate — scans `.agent/sessions/` HANDOFF.md files for approval |
| `JwtPayload`         | type     | Decoded JWT payload shape                                        |
| `ApiKeyConfig`       | type     | API key configuration with permissions and optional expiry       |
| `ValidationError`    | type     | Auth error with `code` and `message` fields                      |
| `AuthResult`         | type     | Auth outcome — `valid`, `payload`, `apiKey`, `errors`            |
| `ValidationResult`   | type     | GO-Gate scan result — `passed`, `message`, `sessions`            |
| `SessionStatus`      | type     | Per-session approval status                                      |
