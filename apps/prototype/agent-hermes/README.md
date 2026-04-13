# Hermes Maximus — Personal Meta-Agent

> A self-improving, self-monitoring AI lab stack composed from the best-of-breed Hermes ecosystem.

**Status:** Phase 1 (Base Stack) complete and green. Phase 2+ in progress.

See the full design spec at [`docs/superpowers/specs/2026-04-12-hermes-maximus-design.md`](docs/superpowers/specs/2026-04-12-hermes-maximus-design.md).

---

## Prerequisites

- Windows 11 Home (or Pro) with **WSL2** backend
- **Docker Desktop** running
- **Python 3.12+**
- A **Nous API key** (`NOUS_API_KEY`) — primary LLM provider
- Optional: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` for model fallback

---

## Quickstart

```powershell
# 1. Initialize all vendor submodules
git submodule update --init --recursive

# 2. Create a virtual environment and install test deps
python -m venv .venv
.\.venv\Scripts\pip install -r requirements-dev.txt

# 3. Copy environment template and fill in your NOUS_API_KEY
Copy-Item .env.example .env
notepad .env   # add NOUS_API_KEY

# 4. Build images (first run is slow)
docker compose -f docker-compose.base.yml build

# 5. Start the base profile
.\scripts\up.ps1

# 6. Verify with smoke tests
.\scripts\smoke.ps1
```

### Service URLs (base profile)

| Service | URL | Notes |
|---------|-----|-------|
| Mission Control | http://127.0.0.1:3000 | Dashboard (OpenClaw-native; Hermes bridge is pending) |
| Workspace UI | http://127.0.0.1:3001 | Hermes-native chat client |
| Hermes Gateway | http://127.0.0.1:8642 | HTTP API for agent tasks |
| Hindsight API | http://127.0.0.1:8888 | Memory backend API |
| Hindsight CP | http://127.0.0.1:9999 | Control-plane UI |

---

## Profiles

Hermes Maximus is organized into three compose profiles:

1. **Base** (`docker-compose.base.yml`) — always on.
   - hermes-core, hindsight, mission-control, workspace-ui
2. **Meta** (`docker-compose.meta.yml`) — *pending*.
   - super-hermes, hermes-dojo, hermes-council, self-evolution
3. **Skills** (`docker-compose.skills.yml`) — *pending*.
   - skill-factory, skill-marketplace

Use the PowerShell helpers:

```powershell
.\scripts\up.ps1          # base only
.\scripts\up-meta.ps1     # base + meta (when available)
.\scripts\up-skills.ps1   # base + skills (when available)
.\scripts\up-full.ps1     # everything available
.\scripts\down.ps1        # stop all
```

Or use the Makefile if you prefer Git Bash / WSL:

```bash
make up
make smoke
make down
```

---

## Project Layout

```
.
├── docker-compose.base.yml      # Glue compose for base profile
├── config/hermes/config.yaml    # Gateway-mode config
├── .env.example                 # Environment template
├── scripts/                     # PowerShell operator helpers
├── skills/                      # 77 bundled skills + wondelai (pending)
├── plugins/                     # web-search-plus, evey-bridge (pending)
├── vendor/                      # Pinned git submodules
├── tests/smoke/                 # Base profile smoke tests
├── tests/integration/           # End-to-end tests
├── docs/                        # Specs, plans, architecture, ops
└── .agent/                      # Monorepo memory protocol
```

---

## Testing

```powershell
# Smoke tests (base profile)
.\scripts\smoke.ps1

# All tests
python -m pytest tests/ -v
```

Smoke tests verify:
- hindsight Postgres accepts connections
- hermes-core CLI returns a version
- gateway HTTP port responds
- mission-control and workspace-ui serve HTML

---

## Troubleshooting

### Docker Desktop not running
If you see `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, start Docker Desktop and wait until the engine is green.

### Build fails on Windows with "bad interpreter"
We force LF line endings via `.gitattributes`. If you still see CRLF issues, run:

```powershell
git add --renormalize .
```

### hermes-core healthcheck fails
The container has no `curl`; we use Python's `urllib` for healthchecks. If you changed the compose, do not re-introduce `curl`.

### Mission Control cannot talk to Hermes
This is a known gap. Mission Control is wired for OpenClaw. Use **Workspace UI** (http://127.0.0.1:3001) for end-to-end Hermes tasks until the bridge is implemented.

---

## Boundaries

- Prototype-only. No production deployment.
- No real patient data or PHI.
- No `terraform apply` (Chief-only per monorepo rules).

---

## Docs Index

- [Design Spec v2](docs/superpowers/specs/2026-04-12-hermes-maximus-design.md)
- [Implementation Plan v2](docs/superpowers/plans/2026-04-12-hermes-maximus-plan.md)
- [Integration Surface](docs/INTEGRATION-SURFACE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Operations Runbook](docs/OPERATIONS.md)
- [Version Manifest](docs/VERSION-MANIFEST.md)
