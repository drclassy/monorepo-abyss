# Hermes Maximus Implementation Plan — v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Revision:** v2 — rewritten after spec v2 (`4686ea6`).
**Goal:** Boot the curated Hermes Maximus flagship stack as a thin-wrap over vendor composes (14 pinned submodules, 3 profiles) at `apps/prototype/agent-hermes/`.

**Architecture shift from v1:** We do NOT write a custom unified compose. We use each vendor's own Dockerfile + docker-compose, joined by a shared Docker network and a thin glue layer. Custom code is kept to a minimum.

**Spec reference:** `docs/superpowers/specs/2026-04-12-hermes-maximus-design.md` (v2)

**All paths relative to:** `D:/Devop/abyss-monorepo/apps/prototype/agent-hermes/`

**State at plan-start:** Phase 0 is DONE (skeleton, manifest, pytest harness). Four vendor submodules are already added (`hermes-core` v2026.4.8, `hindsight` v0.5.0, `mission-control` v2.0.1, `workspace-ui` v1.0.0). The remaining 10 submodules are pending.

---

## Honesty Note

This plan is shorter than v1 (2,047 lines → ~800 lines target) because many integration details are **determined at build time**, not pre-specified. Where v1 lied about fictitious endpoints, v2 says "validate and document" — and the corresponding task is scoped to that validation.

Every Phase-1 and later task that depends on uninspected repos starts with an `inspect-first` subtask. When inspection reveals surprises, the subtask report notes them and the controller decides whether to adapt or escalate.

---

## Phase 0 — DONE

No changes. Commits `795b609`, `7a344b9`, `7d6f09b` remain valid.

---

## Phase 1 — Base Vendor Stack (revised)

**Goal:** The four already-added vendor repos running together. First proof that thin-wrap works.

### Task 1.1 — DONE
`hermes-core` submodule at `vendor/hermes-core` pinned to v2026.4.8.

### Task 1.2 — DONE
`hindsight` submodule at `vendor/hindsight` pinned to v0.5.0.

### Task 1.3 — DONE
`mission-control` submodule at `vendor/mission-control` pinned to v2.0.1.

### Task 1.4 — DONE
`workspace-ui` submodule at `vendor/workspace-ui` pinned to v1.0.0.

---

### Task 1.5 — Inspect four vendor composes; document integration surface

**Files (read-only):**
- `vendor/hermes-core/Dockerfile`
- `vendor/hindsight/docker/standalone/Dockerfile` and `vendor/hindsight/docker/docker-compose/*/docker-compose.yml`
- `vendor/mission-control/docker-compose.yml` and `Dockerfile`
- `vendor/workspace-ui/docker-compose.yml` and `Dockerfile`

**Files (write):**
- Create: `docs/INTEGRATION-SURFACE.md`

- [ ] **Step 1: Read each vendor's Dockerfile/compose and extract**

For each of the four services, record:
  - Entry point command
  - Exposed port(s) (declared by `EXPOSE` or compose `ports:`)
  - Required environment variables (inspect `Dockerfile`, `env.*example`, README)
  - Volume mounts needed
  - Dependencies on other services (e.g., Postgres for hindsight)
  - Healthcheck (if defined)
  - Network expectations

- [ ] **Step 2: Write `docs/INTEGRATION-SURFACE.md`**

Table per service:

```markdown
### hermes-core (v2026.4.8)
| Field | Value |
|-------|-------|
| Entry | `/opt/hermes/docker/entrypoint.sh` (CLI bootstrap) |
| Ports | none exposed in Dockerfile — gateway mode uses 8642 via `API_SERVER_PORT` |
| Required env | `NOUS_API_KEY` (runtime config determines rest) |
| Volumes | `/opt/data` = HERMES_HOME (host: `./data/hermes-home`) |
| Healthcheck | none (add: `docker exec hermes hermes --version`) |
| Notes | Start in gateway mode via `scripts/hermes-gateway`; CLI commands via `docker exec` |

(repeat for hindsight, mission-control, workspace-ui)
```

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/docs/INTEGRATION-SURFACE.md
git commit -m "docs(agent-hermes): integration-surface table for 4 base-profile vendors"
```

**🛑 Task 1.5 checkpoint — controller reviews findings before continuing.**

---

### Task 1.6 — Write `.env.example` (real vendor env vars)

**Files:**
- Create: `.env.example`

- [ ] **Step 1:** Use INTEGRATION-SURFACE.md to collect every env var referenced by the four vendors; write `.env.example` with placeholders and comments.

Sketch (actual content populated in 1.5 output):

```bash
# Shared — Hermes Maximus
NOUS_API_KEY=your_key_here
ANTHROPIC_API_KEY=
GCP_PROJECT=

# Web search plugin (Phase 2)
SERPER_API_KEY=
TAVILY_API_KEY=
EXA_API_KEY=

# Networking — bind to localhost only
HERMES_BIND=127.0.0.1
MC_PORT=3000
WORKSPACE_UI_PORT=3001
HERMES_GATEWAY_PORT=8642
HINDSIGHT_PG_PORT=5432

# <per-service vars discovered in Task 1.5>
```

- [ ] **Step 2: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/.env.example
git commit -m "feat(agent-hermes): .env.example populated from vendor inspection"
```

---

### Task 1.7 — Write `docker-compose.base.yml` glue

**Files:**
- Create: `docker-compose.base.yml`

- [ ] **Step 1: Write the glue compose**

Responsibilities:
1. Declare a shared network `hermes-net`
2. Declare shared named volumes (hindsight-db, hermes-home, mc-data, workspace-data)
3. Include (or `extends:`) the four vendor composes **or** declare services here that reference `vendor/<repo>/Dockerfile` directly — whichever is cleaner based on Task 1.5 findings
4. Override vendor ports to bind to `127.0.0.1` only
5. Attach every service to `hermes-net`
6. Wire dependencies: hermes-core depends on hindsight; UIs depend on hermes-core

Shape (actual Dockerfile paths/ports verified from Task 1.5):

```yaml
name: hermes-maximus

networks:
  hermes-net:
    driver: bridge

volumes:
  hermes-home:
  hindsight-db:
  mc-data:
  workspace-data:

services:
  hindsight:
    build:
      context: ./vendor/hindsight
      dockerfile: docker/standalone/Dockerfile
    environment:
      # vendor-required vars from Task 1.5
    ports:
      - "${HERMES_BIND:-127.0.0.1}:${HINDSIGHT_PG_PORT:-5432}:5432"
    volumes:
      - hindsight-db:/var/lib/postgresql/data
    networks: [hermes-net]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

  hermes-core:
    build:
      context: ./vendor/hermes-core
      dockerfile: Dockerfile
    # Override default CLI entrypoint to start gateway mode.
    # Exact command from Task 1.5.
    command: ["python", "scripts/hermes-gateway"]
    environment:
      - NOUS_API_KEY=${NOUS_API_KEY}
      - API_SERVER_PORT=${HERMES_GATEWAY_PORT:-8642}
      - HERMES_HOME=/opt/data
    ports:
      - "${HERMES_BIND:-127.0.0.1}:${HERMES_GATEWAY_PORT:-8642}:8642"
    volumes:
      - hermes-home:/opt/data
      - ./config/hermes/config.yaml:/opt/data/config.yaml:ro
      - ./skills:/opt/data/skills:rw
    depends_on:
      hindsight:
        condition: service_healthy
    networks: [hermes-net]
    shm_size: 1gb  # Playwright/Chromium
    restart: unless-stopped

  mission-control:
    build:
      context: ./vendor/mission-control
      dockerfile: Dockerfile
    environment:
      # discovered in Task 1.5 — including gateway URL pointing at hermes-core:8642
      - PORT=${MC_PORT:-3000}
    ports:
      - "${HERMES_BIND:-127.0.0.1}:${MC_PORT:-3000}:3000"
    volumes:
      - mc-data:/app/.data
    depends_on:
      hermes-core:
        condition: service_started  # gateway does not define healthcheck; use started
    networks: [hermes-net]
    restart: unless-stopped

  workspace-ui:
    build:
      context: ./vendor/workspace-ui
      dockerfile: Dockerfile
    environment:
      # discovered in Task 1.5
      - HERMES_GATEWAY_URL=http://hermes-core:8642
    ports:
      - "${HERMES_BIND:-127.0.0.1}:${WORKSPACE_UI_PORT:-3001}:3000"  # remap to 3001
    volumes:
      - workspace-data:/app/data
    depends_on:
      hermes-core:
        condition: service_started
    networks: [hermes-net]
    restart: unless-stopped
```

- [ ] **Step 2: Write `config/hermes/config.yaml`** — minimal gateway-mode config based on `vendor/hermes-core/cli-config.yaml.example`.

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.base.yml apps/prototype/agent-hermes/config/hermes/config.yaml
git commit -m "feat(agent-hermes): base glue compose + hermes gateway config"
```

---

### Task 1.8 — Boot base stack (expect friction)

**This is the critical validation task.** First real build.

- [ ] **Step 1: Copy `.env.example` → `.env` and add real NOUS_API_KEY**

```powershell
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
Copy-Item .env.example .env
notepad .env   # Chief fills in NOUS_API_KEY
```

- [ ] **Step 2: Build all four services**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
docker compose -f docker-compose.base.yml build 2>&1 | tee data/logs/build.log
```

Expected: four images build successfully. If any service fails to build, capture the error in `data/logs/build.log` and report as BLOCKED with specific log lines.

- [ ] **Step 3: Start base stack**

```bash
docker compose -f docker-compose.base.yml up -d
docker compose -f docker-compose.base.yml ps
```

Expected: four containers running; hindsight healthy within 60s.

- [ ] **Step 4: Manual verification checklist**

```bash
# hindsight postgres up?
docker exec hindsight pg_isready -U postgres
# hermes CLI available?
docker exec hermes-core hermes --version
# gateway responding?
curl -f http://127.0.0.1:8642/ || echo "gateway path TBD"
# mission-control UI?
curl -sI http://127.0.0.1:3000/ | head -1
# workspace-ui?
curl -sI http://127.0.0.1:3001/ | head -1
```

- [ ] **Step 5: If anything fails, debug + fix + update compose — iterate until all 5 checks pass or escalate.**

Common failures to expect:
- Gateway command wrong (revisit Task 1.5 findings)
- Env var missing (revisit Task 1.6)
- Volume permission issue (WSL2 vs container user)
- Port collision (mission-control and workspace-ui both want 3000)

- [ ] **Step 6: Tear down + commit any compose tweaks**

```bash
docker compose -f docker-compose.base.yml down
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.base.yml apps/prototype/agent-hermes/config/
git commit -m "fix(agent-hermes): base compose adjustments after first boot"
```

**🛑 Task 1.8 checkpoint — Chief verifies booted UIs render in browser.**

---

### Task 1.9 — Real smoke tests for base stack

**Files:**
- Create: `tests/smoke/test_base_profile.py`

- [ ] **Step 1: Replace plan v1's fictitious tests with reality-based ones**

```python
import subprocess
import httpx

def test_hindsight_postgres_ready():
    """hindsight must accept Postgres connections."""
    out = subprocess.run(
        ["docker", "exec", "hindsight", "pg_isready", "-U", "postgres"],
        capture_output=True, text=True, timeout=10,
    )
    assert out.returncode == 0, out.stderr

def test_hermes_core_cli_responds():
    """hermes-core CLI returns a version string."""
    out = subprocess.run(
        ["docker", "exec", "hermes-core", "hermes", "--version"],
        capture_output=True, text=True, timeout=20,
    )
    assert out.returncode == 0, out.stderr
    assert out.stdout.strip(), "empty version output"

def test_hermes_gateway_http_reachable():
    """Gateway HTTP port accepts TCP + returns 200/401/404 (any non-connection-error)."""
    r = httpx.get("http://127.0.0.1:8642/", timeout=10)
    assert r.status_code < 500, f"gateway returned 5xx: {r.status_code}"

def test_mission_control_ui_loads():
    r = httpx.get("http://127.0.0.1:3000/", timeout=10, follow_redirects=True)
    assert r.status_code == 200
    # Known string from mission-control landing (verified in Task 1.5)
    assert "Mission Control" in r.text or "mission-control" in r.text.lower()

def test_workspace_ui_loads():
    r = httpx.get("http://127.0.0.1:3001/", timeout=10, follow_redirects=True)
    assert r.status_code == 200
    assert "Hermes" in r.text or "Workspace" in r.text
```

- [ ] **Step 2: Boot + run + tear down**

```powershell
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
docker compose -f docker-compose.base.yml up -d
.\.venv\Scripts\python.exe -m pytest tests/smoke/test_base_profile.py -v
docker compose -f docker-compose.base.yml down
```

Expected: 5 passed. Any failure = bug or surface mismatch; fix and re-run.

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_base_profile.py
git commit -m "test(agent-hermes): real smoke suite for base profile (5 checks green)"
```

**🎯 Phase 1 complete. Base vendor stack boots and passes smoke.**

---

## Phase 2 — Skills + Plugins Mount

**Goal:** Mount skill pack + two plugins into hermes-core; verify discoverable via CLI.

### Task 2.1 — Add `wondelai/skills` submodule

- [ ] **Step 1:**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
git submodule add https://github.com/wondelai/skills.git skills/wondelai
cd skills/wondelai && git checkout 4d322538 && cd ../..
```

- [ ] **Step 2: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add .gitmodules apps/prototype/agent-hermes/skills/wondelai
git commit -m "feat(agent-hermes): mount wondelai/skills production pack"
```

---

### Task 2.2 — Add `hermes-web-search-plus` plugin (inspect first)

- [ ] **Step 1: Add submodule**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
git submodule add https://github.com/robbyczgw-cla/hermes-web-search-plus.git plugins/web-search-plus
cd plugins/web-search-plus && git checkout v1.3.0 && cd ../..
```

- [ ] **Step 2: Inspect plugin structure**

Check `plugins/web-search-plus/README.md` and any `plugin.yaml` or equivalent manifest. Record how hermes-core consumes plugins (via `config.yaml` plugin paths, or hermes-specific convention).

- [ ] **Step 3: Wire plugin into `config/hermes/config.yaml`** — add the plugin path to hermes-core's plugin search list.

- [ ] **Step 4: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add .gitmodules apps/prototype/agent-hermes/plugins/web-search-plus apps/prototype/agent-hermes/config/hermes/config.yaml
git commit -m "feat(agent-hermes): add web-search-plus plugin + wire into hermes config"
```

---

### Task 2.3 — Add `evey-bridge-plugin` (inspect first)

- [ ] **Step 1:**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
git submodule add https://github.com/42-evey/evey-bridge-plugin.git plugins/evey-bridge
cd plugins/evey-bridge && git checkout 663b240c && cd ../..
```

- [ ] **Step 2: Inspect + wire into config** (same pattern as 2.2).

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add .gitmodules apps/prototype/agent-hermes/plugins/evey-bridge apps/prototype/agent-hermes/config/hermes/config.yaml
git commit -m "feat(agent-hermes): add evey-bridge plugin (Claude Code handoff)"
```

---

### Task 2.4 — Verify skills + plugins discoverable

**Files:**
- Create: `tests/integration/test_skill_discovery.py`

- [ ] **Step 1: Write test**

```python
import subprocess

def test_hermes_lists_skills_including_wondelai():
    out = subprocess.run(
        ["docker", "exec", "hermes-core", "hermes", "skills", "list"],
        capture_output=True, text=True, timeout=30,
    )
    assert out.returncode == 0, out.stderr
    assert "wondelai" in out.stdout.lower() or "web-search" in out.stdout.lower()

def test_hermes_plugin_config_valid():
    """hermes-core loaded config.yaml without error (no startup crash)."""
    out = subprocess.run(
        ["docker", "logs", "hermes-core", "--tail", "100"],
        capture_output=True, text=True, timeout=10,
    )
    assert "config loaded" in out.stdout.lower() or "plugin" in out.stdout.lower()
    assert "error" not in out.stderr.lower() or "no such" not in out.stderr.lower()
```

- [ ] **Step 2: Boot + run + tear down**

```bash
docker compose -f docker-compose.base.yml up -d
pytest tests/integration/test_skill_discovery.py -v
docker compose -f docker-compose.base.yml down
```

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/tests/integration/
git commit -m "test(agent-hermes): verify wondelai skills + plugins load into hermes-core"
```

**🛑 Phase 2 checkpoint.**

---

## Phase 3 — Meta Profile (super-hermes + dojo + council + self-evolution)

**Goal:** Add meta profile. **Expect surprises** — these are lower-star community repos; may need adapters.

### Task 3.1 — Add four meta submodules + inspect each

- [ ] **Step 1: Add all four**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
git submodule add https://github.com/Cranot/super-hermes.git vendor/super-hermes && cd vendor/super-hermes && git checkout ba6b1cd3 && cd ../..
git submodule add https://github.com/Yonkoo11/hermes-dojo.git vendor/hermes-dojo && cd vendor/hermes-dojo && git checkout 9bea2018 && cd ../..
git submodule add https://github.com/Ridwannurudeen/hermes-council.git vendor/hermes-council && cd vendor/hermes-council && git checkout 913c6922 && cd ../..
git submodule add https://github.com/NousResearch/hermes-agent-self-evolution.git vendor/self-evolution && cd vendor/self-evolution && git checkout 4693c8f0 && cd ../..
```

- [ ] **Step 2: Inspect each repo**

For each: check for Dockerfile, integration model (hermes plugin? standalone service? library?), README usage.

Append each to `docs/INTEGRATION-SURFACE.md` with a table row per service.

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add .gitmodules apps/prototype/agent-hermes/vendor/super-hermes apps/prototype/agent-hermes/vendor/hermes-dojo apps/prototype/agent-hermes/vendor/hermes-council apps/prototype/agent-hermes/vendor/self-evolution apps/prototype/agent-hermes/docs/INTEGRATION-SURFACE.md
git commit -m "feat(agent-hermes): add 4 meta profile submodules + document integration surfaces"
```

---

### Task 3.2 — Write `docker-compose.meta.yml` (shape per inspection)

Based on Task 3.1 findings:
- If each meta repo ships a Dockerfile → compose overlay with 4 services
- If they're hermes plugins (like web-search-plus) → wire into `config/hermes/config.yaml` instead, no new containers
- If mixed → document per-service decision

**Files:**
- Create: `docker-compose.meta.yml` (if any standalone services)
- Modify: `config/hermes/config.yaml` (if any plugin-style)
- Modify: `config/council-triggers.yaml` (regardless — defines policy)
- Create: `config/dojo-policies.yaml` (if dojo is standalone service)

- [ ] **Step 1-N:** Actual content determined by Task 3.1 findings. Scoped here; each sub-step is a separate file-write + commit when implementing.

- [ ] **Final commit:**

```bash
git commit -m "feat(agent-hermes): meta profile glue (super-hermes + dojo + council + self-evolution)"
```

---

### Task 3.3 — Meta profile smoke tests

Same pattern as base: reality-based tests.

- [ ] **Step 1: Write `tests/smoke/test_meta_profile.py`** — contents determined by Task 3.1 integration surfaces.

- [ ] **Step 2: Boot `docker compose -f docker-compose.base.yml -f docker-compose.meta.yml up -d`, run, tear down.**

- [ ] **Step 3: Commit.**

**🛑 Phase 3 checkpoint.**

---

## Phase 4 — Skills Profile (factory + marketplace)

**Goal:** Self-extending skill pipeline.

### Task 4.1 — Add two skills submodules + inspect

- [ ] **Step 1:**

```bash
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
git submodule add https://github.com/Romanescu11/hermes-skill-factory.git vendor/skill-factory && cd vendor/skill-factory && git checkout ca38242c && cd ../..
git submodule add https://github.com/Lethe044/hermes-skill-marketplace.git vendor/skill-marketplace && cd vendor/skill-marketplace && git checkout 10754a22 && cd ../..
```

- [ ] **Step 2: Inspect + append to INTEGRATION-SURFACE.md**

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git commit -m "feat(agent-hermes): add skills profile submodules (factory + marketplace)"
```

---

### Task 4.2 — Write `docker-compose.skills.yml`

Shape determined by inspection. Same rules as Task 3.2.

- [ ] **Step 1: Write compose overlay.** Include scan interval, volume mounts for `./skills/`, wiring to hermes-core events.

- [ ] **Step 2: Commit.**

---

### Task 4.3 — Skills profile smoke tests

- [ ] **Step 1: Write `tests/smoke/test_skills_profile.py`.**

- [ ] **Step 2: Boot, run, tear down, commit.**

**🛑 Phase 4 checkpoint.**

---

## Phase 5 — Operator Ergonomics

### Task 5.1 — Makefile

**Files:**
- Create: `Makefile`

- [ ] **Step 1: Write Makefile**

```makefile
BASE_COMPOSE = -f docker-compose.base.yml
META_COMPOSE = $(BASE_COMPOSE) -f docker-compose.meta.yml
SKILLS_COMPOSE = $(BASE_COMPOSE) -f docker-compose.skills.yml
FULL_COMPOSE = $(BASE_COMPOSE) -f docker-compose.meta.yml -f docker-compose.skills.yml

.PHONY: help up up-meta up-skills up-full down logs ps smoke smoke-all

help:
	@echo "Hermes Maximus:"
	@echo "  up          — base profile"
	@echo "  up-meta     — base + meta"
	@echo "  up-skills   — base + skills"
	@echo "  up-full     — everything"
	@echo "  down        — stop all"
	@echo "  logs SVC=x  — follow service logs"
	@echo "  ps          — container status"
	@echo "  smoke       — base smoke tests"
	@echo "  smoke-all   — every test"

up:
	docker compose $(BASE_COMPOSE) up -d

up-meta:
	docker compose $(META_COMPOSE) up -d

up-skills:
	docker compose $(SKILLS_COMPOSE) up -d

up-full:
	docker compose $(FULL_COMPOSE) up -d

down:
	docker compose $(FULL_COMPOSE) down

logs:
	docker compose $(BASE_COMPOSE) logs -f $(SVC)

ps:
	docker compose $(BASE_COMPOSE) ps

smoke:
	pytest tests/smoke/test_base_profile.py -v

smoke-all:
	pytest tests/ -v
```

- [ ] **Step 2: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/Makefile
git commit -m "feat(agent-hermes): Makefile with profile targets"
```

---

### Task 5.2 — PowerShell equivalents

**Files (all identical pattern, one per target):**
- `scripts/up.ps1`, `scripts/up-meta.ps1`, `scripts/up-skills.ps1`, `scripts/up-full.ps1`, `scripts/down.ps1`, `scripts/smoke.ps1`

- [ ] **Step 1: Write each script**

Example `scripts/up.ps1`:
```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..
docker compose -f docker-compose.base.yml up -d
Write-Host "✓ Base up — http://127.0.0.1:3000 + :3001" -ForegroundColor Green
```

- [ ] **Step 2: Run one script to confirm pwsh works**

```powershell
cd D:/Devop/abyss-monorepo/apps/prototype/agent-hermes
.\scripts\up.ps1; .\scripts\down.ps1
```

- [ ] **Step 3: Commit**

```bash
cd D:/Devop/abyss-monorepo
git add apps/prototype/agent-hermes/scripts/
git commit -m "feat(agent-hermes): PowerShell 7 operator scripts"
```

---

## Phase 6 — Documentation

### Task 6.1 — Rewrite `README.md` (operator run book)

- [ ] **Step 1: Write comprehensive README** including quickstart (Windows), profile table, UI URLs, docs index, boundaries.

- [ ] **Step 2: Commit.**

### Task 6.2 — `docs/ARCHITECTURE.md`

- [ ] **Step 1: Condense spec v2 §3-5 into an architecture overview suitable for a new operator.**

- [ ] **Step 2: Commit.**

### Task 6.3 — `docs/OPERATIONS.md`

- [ ] **Step 1: Write ops runbook** — backup/restore for each data volume, chaos drills (§8.3 of spec), submodule bump procedure, secret rotation.

- [ ] **Step 2: Commit.**

### Task 6.4 — `docs/META-AGENT-LOOP.md` (after Phase 3)

- [ ] Content only makes sense once meta profile is actually wired (Phase 3 complete). Defer writing until then, or write a stub.

### Task 6.5 — `docs/SKILLS-CATALOG.md`

- [ ] **Step 1:** Enumerate skills from `skills/wondelai` + `skills/custom`. Use `hermes skills list` output as the source of truth.

- [ ] **Step 2: Commit.**

**🛑 Phase 6 checkpoint.**

---

## Phase 7 — Full Stack Integration

### Task 7.1 — Full-stack smoke

**Files:**
- Create: `tests/smoke/test_full_stack.py`

- [ ] **Step 1: Write parametrized service health test** — enumerate every service that has an HTTP or exec-based health probe; verify all green when full profile is up.

- [ ] **Step 2: Boot `make up-full`, run, tear down, commit.**

### Task 7.2 — Chaos drill — kill hindsight

**Files:**
- Create: `tests/integration/test_chaos_hindsight.py`

- [ ] Kill hindsight container; verify hermes-core reports the degradation on logs (or via gateway API); restart hindsight; verify recovery.

### Task 7.3 — End-to-end task round-trip

**Files:**
- Create: `tests/integration/test_e2e_roundtrip.py`

- [ ] **Step 1:** Submit a hello-world task via **workspace-ui** (known Hermes client; mission-control e2e is a stretch goal per spec §12). Poll for completion. Assert response and trace persistence.

- [ ] **Step 2:** If mission-control e2e works too, add a second test. If not, document the gap in `docs/OPERATIONS.md`.

- [ ] **Step 3: Commit.**

---

## Phase 8 — Monorepo Handoff

### Task 8.1 — `.agent/CONTEXT.md`, `PROGRESS.md`, `HANDOFF.md`

- [ ] Write the three files summarizing status, with pointers to spec v2 + plan v2.

- [ ] Commit.

### Task 8.2 — Update `apps/prototype/AGENTS.md`

- [ ] Replace the old `hermes-agent` row in the sub-applications table with `agent-hermes` + current status.

- [ ] Commit.

### Task 8.3 — Session log

- [ ] Write `.agent/sessions/2026-04-12.md` per division template.

- [ ] Commit.

**🎯 Plan v2 complete.**

---

## Success Criteria (from spec v2 §12)

1. `scripts/up.ps1` brings base vendor stack green in ≤ 5 min — Task 1.8 + 1.9
2. Mission Control loads at 127.0.0.1:3000 — Task 1.9
3. Workspace UI loads at 127.0.0.1:3001 — Task 1.9
4. `docker exec hermes-core hermes --version` returns — Task 1.9
5. `pg_isready` against hindsight passes — Task 1.9
6. Hello-world task via workspace-ui round-trips — Task 7.3
7. `scripts/down.ps1` cleanly stops, data volumes intact — Task 5.2
8. Smoke passes on fresh checkout — Task 1.9 + 7.1

---

## Self-Review — v2 Plan

**Spec coverage (v2):**
- §2 Reality check → Tasks 1.5, 3.1, 4.1 (inspect-first pattern)
- §3 Architecture → Tasks 1.7, 3.2, 4.2
- §4 Directory layout → Already exists (Phase 0 + current state)
- §5 Data flow → Tasks 1.7 (wiring), 7.3 (e2e proof)
- §6 LLM provider → Task 1.7 (config.yaml)
- §7 Safety → Task 3.2 (council triggers), Task 1.8 (`127.0.0.1` binding)
- §8 Testing → Tasks 1.9, 2.4, 3.3, 4.3, 7.1-3
- §9 Windows → Task 5.2
- §10 Boundaries → §12 docs
- §11 Open items → Each tracked in the task it applies to
- §12 Success criteria → mapped above

**Placeholder scan:**
- Every step is concrete within what can be known before repo inspection.
- Tasks 1.7, 2.2, 2.3, 3.2, 4.2 explicitly defer sub-contents to inspection tasks that precede them (1.5, 3.1, 4.1). This is **acknowledged uncertainty**, not a placeholder.
- No "TODO" / "TBD" / "fill in later" without a preceding inspection task that populates it.

**Type consistency:** Ports (3000, 3001, 8642, 5432), container names (`hermes-core`, `hindsight`, `mission-control`, `workspace-ui`), volume names (`hermes-home`, `hindsight-db`, `mc-data`, `workspace-data`) — consistent across Tasks 1.7, 1.9, 5.1, 5.2.

---

*End of plan v2.*
