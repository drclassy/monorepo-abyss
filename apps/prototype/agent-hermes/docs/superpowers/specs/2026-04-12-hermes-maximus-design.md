# Hermes Maximus — Personal Meta-Agent Design Spec

**Date:** 2026-04-12
**Revision:** **v2 — rewritten after direct inspection of vendor repos**
**Location:** `apps/prototype/agent-hermes/`
**Author:** Claude (Opus 4.6, 1M) with Chief (Dr. Ferdi Iskandar)
**Status:** Revision 2 — awaiting spec review before implementation plan regeneration
**Source catalog:** https://github.com/0xNyk/awesome-hermes-agent

---

## Revision History

- **v1 (obsoleted):** assumed every service exposed REST `/health`, `/skills`, `/tasks` on a unified compose file I'd write. **Wrong** — based on catalog blurbs, not repo inspection.
- **v2 (current):** based on direct inspection of 4 cloned repos (hermes-core, hindsight, mission-control, workspace-ui). Documents the **real** interfaces and adopts a **thin-wrap** orchestration strategy.

---

## 1. Mission (unchanged)

Build the most advanced and complete **Personal AI Lab / Meta-Agent** stack by composing best-of-breed repositories from the awesome-hermes-agent ecosystem. Self-improving, self-monitoring, self-extending.

**Primary user:** Chief (personal use, Windows 11 Home + Docker Desktop + WSL2).

**Non-goals (unchanged):**
- No Sentra healthcare integration in Phase 1.
- No production GCP deployment (prototype division rule).
- No real patient data, no production credentials.

---

## 2. Reality Check — What the Vendor Repos Actually Are

Lesson from v1: catalog blurbs are curation, not contracts. Here is what is true after inspecting the code.

### 2.1 hermes-core (NousResearch/hermes-agent @ v2026.4.8)

- **Three runtime modes, not one:**
  1. **CLI mode** — `hermes <subcommand>`; interactive or scripted.
  2. **ACP adapter mode** — `python -m acp_adapter.entry`; JSON-RPC over **stdio** (Agent Client Protocol). Clients spawn it as a subprocess and talk to stdin/stdout. **Not HTTP.**
  3. **Gateway mode** — `scripts/hermes-gateway`; long-running service that exposes an HTTP API on **port 8642** (default, configurable via `API_SERVER_PORT`). This is the integration surface for dashboards.
- **Ships own `Dockerfile`** (debian:13.4 + Python 3 + Node + Playwright + ffmpeg).
- **Entrypoint:** `/opt/hermes/docker/entrypoint.sh` — bootstraps `$HERMES_HOME=/opt/data` with `.env`, `config.yaml`, `SOUL.md`, skills.
- **No `EXPOSE` in Dockerfile.** Runtime chooses; we pick gateway mode.
- **Windows native unsupported.** Requires WSL2 (Docker Desktop already uses WSL2 on Chief's machine — fine).

### 2.2 hindsight (vectorize-io/hindsight @ v0.5.0)

- **NOT a generic memory HTTP API.** It's a **Postgres-based memory layer** with multiple deployment variants under `docker/`:
  - `docker/standalone/Dockerfile` — single-container bundle.
  - `docker/docker-compose/{external-pg,pg_textsearch,s3-file-storage,timescale,vchord}/` — compose variants for different backends.
- **Integration:** hermes-core includes `plastic-labs/honcho` for user modeling by default. Hindsight would **replace or supplement** that, but wiring it in needs a config change in hermes-core. Not automatic.
- **For v2 scope:** use `docker/standalone` variant. Connection via Postgres (not HTTP). Integration test: verify Postgres is reachable and schema migrations ran.

### 2.3 mission-control (builderz-labs/mission-control @ v2.0.1)

- **Next.js 16 + React 19 + SQLite** dashboard. Self-contained (no external DB needed).
- **Ships own `Dockerfile` + `docker-compose.yml` + hardened variant.**
- **Port 3000** (configurable via `PORT` / `MC_PORT` env).
- **Integration model:** connects to agent gateways via HTTP. Default design is for **OpenClaw**; `extra_hosts: host-gateway` in its compose suggests the gateway runs on the Docker host or another container.
- **Hermes compatibility:** README says "multi-gateway — OpenClaw, and more coming soon." Direct Hermes gateway support may require config adapter work; for v2 we will connect it to the Hermes gateway on port 8642 and document any integration gaps as open items.

### 2.4 workspace-ui (outsourc-e/hermes-workspace @ v1.0.0)

- **Node ≥22 app.** Ships own `Dockerfile` + `docker-compose.yml`.
- **Explicitly designed for Hermes gateway** — README: *"Direct gateway connection with real-time SSE streaming."*
- **This is the reference integration client for the Hermes gateway.**
- Port default: 3000 (pending confirmation at build time; will verify and document).

### 2.5 What changes in the architecture

v1 assumption → v2 reality:

| v1 | v2 |
|----|----|
| One custom `docker-compose.yml` I write | Three layers: (a) vendor composes unchanged, (b) a thin **`docker-compose.glue.yml`** that adds a shared network + shared `.env`, (c) a PowerShell/Make helper that starts them in the right order |
| Every service has `/health` REST endpoint | Only **hermes gateway (8642)** and **mission-control (3000)** and **workspace-ui (3000)** are HTTP services. hermes-core-CLI and hindsight-Postgres use their native protocols. |
| Mission Control orchestrates hermes-core via REST | Mission Control connects to the **Hermes gateway** as its agent backend. Adapter config required; validated per-task. |
| Custom compose binds all services on 127.0.0.1 | Same security posture, applied to vendor composes via override |

---

## 3. Architecture — Thin-Wrap Over Vendor Composes

### 3.1 Strategy

**Do not rewrite orchestration.** Each vendor repo ships a Dockerfile and usually a compose. Respect upstream. Our job is to:

1. **Glue them** onto a shared Docker network so they can reach each other by service name.
2. **Configure each vendor** via its own native config files (mounted as volumes from `config/<service>/`).
3. **Keep custom code minimal.** No HTTP wrappers, no REST adapters. If a vendor speaks stdio (ACP), we use a stdio client. If it speaks Postgres (hindsight), we use a Postgres client. If it speaks HTTP (gateway/UIs), we use HTTP.

### 3.2 Compose layering

```
base profile (always on):
  docker-compose.base.yml                  ← our glue (network, shared env, volumes)
  -f vendor/hermes-core/docker-compose.yml   (if they ship one; else we reference the Dockerfile)
  -f vendor/hindsight/docker/docker-compose/standalone/docker-compose.yml
  -f vendor/mission-control/docker-compose.yml
  -f vendor/workspace-ui/docker-compose.yml

meta profile (opt-in):
  + docker-compose.meta.yml  ← glue for super-hermes + dojo + council

skills profile (opt-in):
  + docker-compose.skills.yml ← glue for skill-factory + marketplace + self-evolution
```

Start with:
```powershell
docker compose -f docker-compose.base.yml \
               -f vendor/hermes-core/Dockerfile.compose.yml \  # (path verified at integration time)
               [additional -f files] up -d
```

A Makefile target and a PowerShell script hide the long command. See §9.

### 3.3 Real service topology (v2)

```
┌──────────────────────────────────────────────────────────────┐
│  PROFILE: base                                               │
│                                                              │
│  [mission-control :3000]   [workspace-ui :3001]              │
│           ↓                         ↓                        │
│           └───────┬─────────────────┘                        │
│                   ▼                                          │
│          [hermes-gateway :8642]   ← our orchestration point  │
│                   ↓                                          │
│          [hermes-core (CLI/ACP)]                             │
│                   ↓                                          │
│          [hindsight-postgres :5432]                          │
│                                                              │
│  Skills mounted from ./skills into hermes-core at /opt/data/skills │
│  Plugins are hermes-native — configured via config.yaml       │
├──────────────────────────────────────────────────────────────┤
│  PROFILE: meta (opt-in)                                      │
│                                                              │
│  [super-hermes]  → wraps hermes-gateway calls                │
│  [hermes-dojo]   → subscribes to hermes-core telemetry       │
│  [hermes-council]→ invoked by UIs on high-stakes triggers    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  PROFILE: skills (opt-in)                                    │
│                                                              │
│  [skill-factory]       [skill-marketplace]   [self-evolution]│
│  All read/write ./skills/ directly                           │
└──────────────────────────────────────────────────────────────┘
```

**Key change from v1:** ports `8080` and `8081` are GONE. Real services use:
- Mission Control: **3000**
- Workspace UI: **3001** (remap from its default 3000 to avoid clash)
- Hermes Gateway: **8642** (API_SERVER_PORT)
- Hindsight Postgres: **5432** (internal only)
- Meta/skills profile ports: assigned at build time by inspecting each repo

### 3.4 Integration surface by service

| Service | Protocol | Port | Healthcheck method |
|---------|----------|------|---------------------|
| hermes-gateway | HTTP (FastAPI) | 8642 | `curl /` expects 200 or documented endpoint |
| hermes-core-CLI | stdio / subprocess | — | `docker exec hermes-core hermes version` returns 0 |
| hindsight | Postgres | 5432 | `pg_isready -h hindsight -p 5432` |
| mission-control | HTTP (Next.js) | 3000 | `curl /api/health` (verified at build time) |
| workspace-ui | HTTP (Node) | 3001 | `curl /api/health` or `/` (verified at build time) |

Test strategy (§8) is written to verify these **real** endpoints, not fictitious ones.

---

## 4. Directory Layout (revised)

```
apps/prototype/agent-hermes/
├── README.md                           ← operator run book
├── docker-compose.base.yml             ← our glue: network, shared env, volumes
├── docker-compose.meta.yml             ← meta profile glue
├── docker-compose.skills.yml           ← skills profile glue
├── .env.example                        ← shared env (NOUS_API_KEY, etc.)
├── .gitignore                          ← (already done)
├── .gitmodules                         ← lives at monorepo root (14 submodules)
│
├── scripts/
│   ├── up.ps1 / up.sh                  ← `docker compose -f base.yml -f vendor/... up -d`
│   ├── up-meta.ps1 / up-meta.sh
│   ├── up-skills.ps1 / up-skills.sh
│   ├── up-full.ps1 / up-full.sh
│   ├── down.ps1 / down.sh
│   └── smoke.ps1 / smoke.sh
│
├── vendor/                             ← pinned git submodules (14 total)
│   ├── hermes-core/                    ← v2026.4.8 (added)
│   ├── hindsight/                      ← v0.5.0 (added)
│   ├── mission-control/                ← v2.0.1 (added)
│   ├── workspace-ui/                   ← v1.0.0 (added)
│   ├── super-hermes/                   ← to add in Phase 4
│   ├── hermes-dojo/                    ← to add in Phase 4
│   ├── hermes-council/                 ← to add in Phase 4
│   ├── self-evolution/                 ← to add in Phase 4
│   ├── skill-factory/                  ← to add in Phase 5
│   ├── skill-marketplace/              ← to add in Phase 5
│   └── hermes-agent-docs/              ← to add later (docs only)
│
├── skills/
│   ├── wondelai/                       ← submodule (Phase 3)
│   └── custom/                         ← Chief's own skills
│
├── plugins/
│   ├── web-search-plus/                ← submodule (Phase 3)
│   └── evey-bridge/                    ← submodule (Phase 3)
│
├── config/
│   ├── hermes/
│   │   ├── config.yaml                 ← mounted into hermes-core @ /opt/data/config.yaml
│   │   └── .env.hermes                 ← hermes-specific env (merged into .env at up-time)
│   ├── hindsight/
│   │   └── <whatever the vendor requires>  (validated at integration time)
│   ├── mission-control/
│   │   └── config.yaml                 (validated at integration time)
│   └── workspace-ui/
│       └── config.yaml                 (validated at integration time)
│
├── data/                               ← gitignored, persistent volumes
│   ├── hermes-home/                    ← /opt/data in hermes-core container
│   ├── hindsight-db/
│   ├── mission-control-db/
│   ├── workspace-ui-db/
│   └── logs/
│
├── tests/
│   ├── smoke/                          ← pytest smoke suite
│   └── integration/                    ← end-to-end round-trip tests
│
├── .agent/                             ← monorepo convention
│   ├── CONTEXT.md
│   ├── PROGRESS.md
│   ├── HANDOFF.md
│   └── sessions/
│
└── docs/
    ├── ARCHITECTURE.md
    ├── SKILLS-CATALOG.md
    ├── OPERATIONS.md
    ├── META-AGENT-LOOP.md
    ├── VERSION-MANIFEST.md
    └── superpowers/
        ├── specs/
        │   └── 2026-04-12-hermes-maximus-design.md  ← this file
        └── plans/
            └── 2026-04-12-hermes-maximus-plan.md     ← v1 plan, will be regenerated
```

---

## 5. Data Flow — Gateway-Centric

```
1. Chief opens Mission Control (http://127.0.0.1:3000) OR Workspace UI (:3001)
2. UI authenticates to hermes-gateway (http://hermes-gateway:8642) via config
3. UI sends a task → gateway → spawns/routes to hermes-core CLI
4. hermes-core runs the task (skills from ./skills, plugins from config.yaml)
5. hermes-core writes state to /opt/data (volume: data/hermes-home)
6. If hindsight is wired: hermes-core's memory adapter writes to Postgres
7. Gateway streams updates back to UI via SSE
8. Dojo subscribes to gateway event log (meta profile)
9. Council is called when triggers fire (meta profile)
10. Skill-factory scans traces, publishes new skills (skills profile)
```

**Note:** Steps 6, 8, 9, 10 depend on configuration wiring that will be validated per-phase. If any gap exists in vendor support (e.g., mission-control can't yet auth to hermes-gateway), it is documented as an open item with a workaround.

---

## 6. LLM Provider Strategy (mostly unchanged)

Configured inside hermes-core's `config/hermes/config.yaml`:
- **Primary:** Nous Research API via `NOUS_API_KEY`.
- **Optional:** Anthropic, Google Vertex AI (Chief's cloud), Ollama (local).

Switch via `hermes model` CLI — no code changes.

---

## 7. Error Handling & Safety

### 7.1 Circuit breakers
Mission Control and Workspace UI both have native cost ceilings, session timeouts, and tool-call budgets. We configure them via their own config files; no custom code.

### 7.2 Council auto-triggers
Kept as a **workflow policy**, not a runtime-enforced wrapper. File: `config/council-triggers.yaml`. UIs (via gateway) read this at task submission and route high-stakes tasks through the Council when meta profile is active.

### 7.3 Health checks
Each vendor compose has its own `healthcheck:`. Our glue layer does NOT override them. If a vendor lacks one, we add it in the glue overlay.

### 7.4 Secret handling
- All shared secrets via root `.env` (gitignored) + per-service `.env.<service>` files.
- `.env.example` committed with placeholders only.
- Hindsight's redaction patterns (if used) configured at hindsight's own config layer.

---

## 8. Testing Strategy (revised)

**Replaced fictitious endpoints with real interfaces.**

### 8.1 Smoke suite
- `test_hermes_gateway_responds` — GET `http://127.0.0.1:8642/` expects HTTP 200 (real endpoint TBD at build time, documented in code comment).
- `test_hermes_core_cli_available` — `docker exec hermes-core hermes --version` returns 0.
- `test_hindsight_postgres_up` — `pg_isready -h 127.0.0.1 -p 5432` inside the hindsight container.
- `test_mission_control_ui` — GET `http://127.0.0.1:3000/` expects 200 and HTML containing a known string from the app.
- `test_workspace_ui` — same pattern at :3001.

### 8.2 Integration
- **End-to-end:** Post a task via Mission Control's HTTP API (path discovered during Phase 2), poll for completion, assert output matches expectation. **Requires** NOUS_API_KEY.
- **Gateway contract:** `curl http://127.0.0.1:8642/<documented-path>` round-trips a trivial JSON-RPC call.

### 8.3 Chaos drills
Documented in OPERATIONS.md; functional equivalents of v1's drills but on real services:
- Kill hindsight Postgres → verify hermes-core continues in degraded memory mode.
- Kill hermes-gateway → verify UIs report disconnection, recover on restart.
- Fill hindsight disk → verify eviction policy (if any) or graceful error.

---

## 9. Platform Notes — Windows 11

- Docker Desktop (29.3.1 confirmed installed) with WSL2 backend.
- `scripts/*.ps1` mirror every `scripts/*.sh` for pwsh parity.
- hermes-core requires WSL2 for **native** install; inside Docker that's irrelevant.
- Submodule paths use forward slashes in compose files; Windows git handles the rest.

---

## 10. Boundaries (unchanged)

- Prototype-only. No production GCP.
- No real patient data, no production credentials.
- Not importable by any production division.
- Inactive 60+ days → flag for archival.

---

## 11. Open Items (honest list)

1. **mission-control ↔ hermes-gateway compatibility** — mission-control is designed for OpenClaw; Hermes gateway adapter may need config work or upstream PR. Validated in Phase 2.
2. **workspace-ui port** — default 3000 collides with mission-control; remap via compose env. Confirmed at Phase 2 build.
3. **hindsight wiring into hermes-core** — requires editing hermes-core's `config.yaml` memory adapter. Validated Phase 1 end.
4. **hermes-gateway health endpoint** — exact path to be verified from `gateway/platforms/api_server.py`; documented in test comment.
5. **Meta profile repos** — have NOT yet been inspected. Integration concerns will surface at Phase 4.
6. **Skills profile repos** — NOT yet inspected. Same caveat.
7. **hermes-core in Docker with WSL2 host** — Playwright + Chromium in Docker needs shm_size override. Add to base compose.

---

## 12. Success Criteria (revised, realistic)

1. `.\scripts\up.ps1` brings **the base vendor stack** green in ≤ 5 minutes on Chief's machine (first-run includes build time for all vendors, which is the dominant cost).
2. Mission Control UI loads at http://127.0.0.1:3000 and shows a non-error landing page.
3. Workspace UI loads at http://127.0.0.1:3001 and shows a non-error landing page.
4. `docker exec hermes-core hermes --version` returns the expected version string.
5. `pg_isready` against hindsight Postgres returns "accepting connections".
6. A hello-world task **submitted via workspace-ui** (known Hermes client) completes end-to-end and returns a response. This proves the gateway is routing correctly. Mission-control end-to-end is a **stretch goal** pending OpenClaw↔Hermes adapter status.
7. `.\scripts\down.ps1` cleanly stops the stack, leaving data volumes intact.
8. `.\scripts\smoke.ps1` passes on a fresh checkout after `git submodule update --init --recursive`.

---

## 13. What Survives From v1

- **Mission statement:** unchanged.
- **14-repo curated catalog:** unchanged.
- **Three profiles (base/meta/skills):** unchanged.
- **Directory skeleton + VERSION-MANIFEST + pytest harness:** unchanged (already committed in Phase 0).
- **Boundaries + prototype-division rules:** unchanged.

## What Is Thrown Out From v1

- Fictitious REST endpoints (`/health`, `/skills`, `/tasks` on every service).
- Custom `docker-compose.yml` that tried to unify everything.
- Assumption that mission-control is a drop-in Hermes orchestrator.
- Test strategy based on fictitious endpoints.
- Safety circuit-breaker implementations in "our" code (delegated to each vendor's native features).

---

*End of spec v2.*
