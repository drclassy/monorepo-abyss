# Hermes Maximus — Architecture Overview

**Last updated:** 2026-04-13

---

## Guiding Principle: Thin-Wrap Orchestration

We do **not** rewrite vendor code. Each repository in the Hermes ecosystem ships its own `Dockerfile` and often its own `docker-compose.yml`. Our job is to:

1. **Glue** them onto a shared Docker network so they talk to each other by service name.
2. **Configure** each vendor via its native config files (mounted as volumes).
3. **Keep custom code minimal** — no HTTP wrappers, no REST adapters.

---

## Service Topology

### Base Profile (always on)

```
[Mission Control :3000]     [Workspace UI :3001]
           │                         │
           └──────────┬──────────────┘
                      ▼
            [Hermes Gateway :8642]
                      │
            [hermes-core CLI / ACP]
                      │
            [hindsight-postgres :5432]
```

- **Mission Control** — Next.js 16 dashboard. OpenClaw-native; Hermes bridge is pending.
- **Workspace UI** — Node app, explicitly designed for the Hermes gateway.
- **hermes-core** — Python agent runtime. Runs in **gateway mode** (`hermes gateway run`) to expose HTTP on `8642`.
- **hindsight** — Postgres-based memory backend (standalone bundle with embedded pg).

### Meta Profile (pending)

- **super-hermes** — wraps gateway calls
- **hermes-dojo** — subscribes to telemetry
- **hermes-council** — invoked on high-stakes triggers
- **self-evolution** — loop closure

### Skills Profile (pending)

- **skill-factory** — scans traces and generates new skills
- **skill-marketplace** — discovers and publishes skills

---

## Data Flow

1. Chief opens **Workspace UI** (or Mission Control for dashboard-only views).
2. UI authenticates to the **Hermes gateway**.
3. UI submits a task → gateway → routes to hermes-core.
4. hermes-core executes the task using skills from `./skills` and plugins from `./plugins`.
5. State is persisted to `/opt/data` (volume `data/hermes-home`).
6. If hindsight is wired, memory adapter writes to Postgres.
7. Gateway streams updates back to UI via SSE.

---

## Network & Storage

- **Network:** `hermes-net` (bridge) declared in `docker-compose.base.yml`.
- **Volumes:**
  - `hermes-home` — hermes-core state
  - `hindsight-pg0` — hindsight embedded Postgres
  - `mc-data` — mission-control SQLite

---

## Port Map

| Host | Container | Service |
|------|-----------|---------|
| `127.0.0.1:3000` | `mission-control:3000` | Mission Control |
| `127.0.0.1:3001` | `workspace-ui:3000` | Workspace UI |
| `127.0.0.1:8642` | `hermes-core:8642` | Hermes Gateway |
| `127.0.0.1:8888` | `hindsight:8888` | Hindsight API |
| `127.0.0.1:9999` | `hindsight:9999` | Hindsight CP |
| *(internal)* | `hindsight:5432` | Hindsight Postgres |

---

## Integration Surface by Protocol

| Service | Protocol | Healthcheck |
|---------|----------|-------------|
| hermes-gateway | HTTP (FastAPI) | `GET /health` on `:8642` |
| hermes-core CLI | stdio / subprocess | `docker exec hermes-core hermes --version` |
| hindsight | Postgres + HTTP | `pg_isready` + `curl :8888/health` |
| mission-control | HTTP (Next.js) | built-in `node /app/healthcheck.js` |
| workspace-ui | HTTP (Node/Vite) | `GET /` on `:3001` |
