# @the-abyss/literature-worker

Local loopback worker that exposes the literature harvester over HTTP.

## Start

```bash
pnpm --filter @the-abyss/literature-worker start
```

Defaults:

- host: `127.0.0.1`
- port: `8787`

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check |
| POST | `/harvest` | Trigger an OA literature harvest |

`/harvest` expects JSON:

```json
{
  "query": "heart failure",
  "limit": 10,
  "openAccessOnly": true
}
```
