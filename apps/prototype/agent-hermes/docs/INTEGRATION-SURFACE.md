# Integration Surface — Phase 1 Vendor Repos

**Date:** 2026-04-12
**Status:** Four base-profile vendors inspected. Table below is ground truth for `docker-compose.base.yml`.

---

## hermes-core (NousResearch/hermes-agent @ v2026.4.8)

| Field | Value |
|-------|-------|
| Dockerfile | `vendor/hermes-core/Dockerfile` (debian:13.4 + python3 + node + playwright chromium + ffmpeg) |
| Ports exposed | none declared in Dockerfile |
| Entry | `ENTRYPOINT ["/opt/hermes/docker/entrypoint.sh"]` which `exec hermes "$@"` |
| Gateway command | `hermes gateway run` (starts the HTTP API server if `API_SERVER_ENABLED=true`) |
| Gateway port | 8642 (default, `API_SERVER_PORT` env) |
| Health endpoint | `http://localhost:8642/health` (per workspace-ui probe in `docker/agent/Dockerfile` of sibling repo) |
| `HERMES_HOME` | `/opt/data` (VOLUME declared) |
| Required env | `NOUS_API_KEY` OR `ANTHROPIC_API_KEY` OR similar provider; `API_SERVER_ENABLED=true` for port 8642 |
| Config file | `/opt/data/config.yaml` (bootstrapped from `cli-config.yaml.example` if missing) |
| Notes | Skills mounted at `/opt/data/skills`. Playwright needs `shm_size: 1gb`. |

## hindsight (vectorize-io/hindsight @ v0.5.0)

| Field | Value |
|-------|-------|
| Dockerfile | `vendor/hindsight/docker/standalone/Dockerfile` (multi-stage: python3.11 + node20; `standalone` target is default) |
| Ports exposed | **8888** (API), **9999** (CP — control plane / management UI) |
| Entry | `CMD ["/app/start-all.sh"]` |
| Required env | `OPENAI_API_KEY` (or other LLM provider via `HINDSIGHT_API_LLM_PROVIDER`), `HINDSIGHT_DB_PASSWORD` (docker-compose variant only — standalone uses embedded pg) |
| `HINDSIGHT_API_HOST` | 0.0.0.0 (Docker-default) |
| `HINDSIGHT_ENABLE_API` | true |
| `HINDSIGHT_ENABLE_CP` | true |
| Volume | `/home/hindsight/.pg0` for embedded Postgres data |
| Health method | `curl http://localhost:8888/health` (API), or `curl http://localhost:9999/` for CP UI |
| Notes | Standalone image bundles embedded pg0 Postgres. No external DB needed for v1. |

## mission-control (builderz-labs/mission-control @ v2.0.1)

| Field | Value |
|-------|-------|
| Dockerfile | `vendor/mission-control/Dockerfile` (Next.js standalone, node:alpine) |
| Ports exposed | **3000** (`EXPOSE 3000`, `ENV PORT=3000`, `ENV HOSTNAME=0.0.0.0`) |
| Entry | `ENTRYPOINT ["/app/docker-entrypoint.sh"]` → runs Next.js server |
| Healthcheck | `CMD ["node", "/app/healthcheck.js"]` (built-in) |
| Required env | `MC_DEFAULT_GATEWAY_NAME` (defaults to "primary"), `AUTH_USER`+`AUTH_PASS` (optional seed; otherwise first-run `/setup`), `MC_ALLOWED_HOSTS` |
| Storage | SQLite at `/app/.data` (volume mount) |
| Gateway integration | **OpenClaw-specific** — env vars `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, `OPENCLAW_HOME`. **No native Hermes connector.** Use as dashboard only in Phase 1; Hermes bridge is an open item. |
| Notes | Security-hardened: `read_only: true`, `cap_drop: ALL`, tmpfs for `/tmp` and `/app/.next/cache`. |

## workspace-ui (outsourc-e/hermes-workspace @ v1.0.0)

| Field | Value |
|-------|-------|
| Dockerfile | `vendor/workspace-ui/Dockerfile` (node:22-slim) — OR use `vendor/workspace-ui/docker/workspace/Dockerfile` + `docker/agent/Dockerfile` per their own compose |
| Ports exposed | **3000** (Vite dev) |
| Entry | `CMD ["node", "server-entry.js"]` (prod) OR `pnpm dev --host 0.0.0.0 --port 3000` (dev) |
| Required env | `HERMES_API_URL` (defaults to `http://hermes-agent:8642`), `ANTHROPIC_API_KEY` (in workspace-ui's sibling Dockerfile it launches a forked hermes fetching from outsourc-e/hermes-agent) |
| Notes | workspace-ui's OWN `docker-compose.yml` bundles a `hermes-agent` service (from `outsourc-e/hermes-agent` fork) — proving gateway /health exists and the pattern works. |

---

## Derived decisions for `docker-compose.base.yml`

1. **hermes-core service**: override `ENTRYPOINT` / `CMD` to run `hermes gateway run`; set `API_SERVER_ENABLED=true`; expose 8642.
2. **hindsight service**: use `docker/standalone/Dockerfile`; expose 8888 (API) and 9999 (CP); mount `./data/hindsight-pg0`.
3. **mission-control service**: use its `Dockerfile`; expose 3000; SQLite volume `./data/mc-data`; document that Hermes integration is not yet wired (open item).
4. **workspace-ui service**: use `vendor/workspace-ui/Dockerfile` with `HERMES_API_URL=http://hermes-core:8642`; remap port 3000 → host 3001 to avoid clash with mission-control.

## Port map (revised)

| Host port | Container | Notes |
|-----------|-----------|-------|
| 127.0.0.1:3000 | mission-control:3000 | Next.js Mission Control dashboard |
| 127.0.0.1:3001 | workspace-ui:3000 | Workspace UI (remapped to avoid clash) |
| 127.0.0.1:8642 | hermes-core:8642 | Hermes gateway HTTP API (/health) |
| 127.0.0.1:8888 | hindsight:8888 | Hindsight memory API |
| 127.0.0.1:9999 | hindsight:9999 | Hindsight control plane UI |

## Known gaps (tracked as open items)

- **mission-control ↔ hermes-core adapter**: Mission Control is OpenClaw-wired. It will boot, render its dashboard, but agent operations will be no-ops until an adapter is written or upstream adds Hermes support. Documented in `docs/OPERATIONS.md`.
- **hindsight wiring into hermes-core memory**: requires editing `/opt/data/config.yaml` memory section. Phase 1 boot leaves them decoupled; Phase 2 can wire if needed.
