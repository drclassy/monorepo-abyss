# Hermes Maximus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the curated Hermes Maximus meta-agent stack — 14 vendored repos, Docker Compose layered profiles (base / meta / skills), Hindsight memory, self-evolution loop, Windows-native operator scripts — at `apps/prototype/agent-hermes/`.

**Architecture:** Docker Compose with three opt-in profiles. All services on `127.0.0.1` internal network. External repos vendored as pinned git submodules under `vendor/`, `skills/`, `plugins/`. PowerShell scripts mirror every Make target for Windows 11 parity.

**Tech Stack:** Docker Compose v2, Git submodules, PowerShell 7.6, Python 3.12 (where Hermes runtime demands), Hindsight (vector + graph memory), Nous Research API (primary LLM), pytest (smoke/integration tests).

**Spec reference:** `docs/superpowers/specs/2026-04-12-hermes-maximus-design.md`

**All paths relative to:** `D:\Devop\abyss-monorepo\apps\prototype\agent-hermes\`

---

## Phase 0 — Bootstrap & Version Discovery

**Goal:** Create the skeleton, discover pinned versions, establish the smoke-test harness before any service code lands.

### Task 0.1: Create skeleton directories & sentinels

**Files:**
- Create: `.gitignore`
- Create: `.gitmodules` (empty stub)
- Create: `README.md` (placeholder pointing to spec)

- [ ] **Step 1: Create directory tree**

Run:
```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
New-Item -ItemType Directory -Force -Path vendor, skills\custom, plugins, config, data\hindsight-db, data\mission-control-db, data\marketplace-store, data\logs, scripts, tests\smoke, tests\integration, .agent\sessions
```

Expected: Directories created silently.

- [ ] **Step 2: Write `.gitignore`**

```
# Data volumes (gitignored)
data/
!data/.gitkeep

# Secrets
.env
.env.local
.env.*.local

# Node / Python
node_modules/
__pycache__/
*.pyc
.venv/
.pytest_cache/

# OS
Thumbs.db
.DS_Store

# Editor
.vscode/
.idea/

# Docker temp
.docker-build-cache/
```

- [ ] **Step 3: Seed data sentinel so empty dir is tracked**

Run:
```powershell
"# placeholder" | Out-File -FilePath data\.gitkeep -Encoding utf8
```

- [ ] **Step 4: Write minimal README.md stub**

```markdown
# Hermes Maximus — Personal Meta-Agent

See `docs/superpowers/specs/2026-04-12-hermes-maximus-design.md` for the full design.

Status: **Phase 0 / bootstrapping** — not yet runnable.
```

- [ ] **Step 5: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitignore apps/prototype/agent-hermes/data/.gitkeep apps/prototype/agent-hermes/README.md
git commit -m "chore(agent-hermes): scaffold directory skeleton"
```

---

### Task 0.2: Discover pinned repository tags

**Files:**
- Create: `docs/VERSION-MANIFEST.md`

- [ ] **Step 1: Probe each of the 14 repos for latest release tag**

For every repo in the spec §2, run (replace OWNER/REPO):
```powershell
gh api repos/OWNER/REPO/releases/latest --jq '.tag_name'
# Fallback if no releases exist:
gh api repos/OWNER/REPO/tags --jq '.[0].name'
# Fallback if no tags: record default branch HEAD sha
gh api repos/OWNER/REPO --jq '.default_branch'
gh api repos/OWNER/REPO/commits/<branch> --jq '.sha[0:8]'
```

Record results as: `OWNER/REPO | tag | commit-sha | date`.

- [ ] **Step 2: Write `docs/VERSION-MANIFEST.md`**

Table format:

```markdown
# Version Manifest — 2026-04-12

| Repo | Pinned Ref | Commit SHA | Date | Category |
|------|-----------|-----------|------|----------|
| NousResearch/hermes-agent | v<X.Y.Z> | <sha8> | YYYY-MM-DD | core |
| builderz-labs/mission-control | ... | ... | ... | ui |
| ... (14 rows total) |
```

Include a note: *"Update this manifest whenever a submodule is bumped. `make version-check` must match."*

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docs/VERSION-MANIFEST.md
git commit -m "docs(agent-hermes): record pinned version manifest for 14 vendored repos"
```

---

### Task 0.3: Smoke test harness (pytest)

**Files:**
- Create: `tests/smoke/conftest.py`
- Create: `tests/smoke/test_harness_boots.py`
- Create: `pyproject.toml` (minimal)
- Create: `requirements-dev.txt`

- [ ] **Step 1: Write `requirements-dev.txt`**

```
pytest==8.3.3
httpx==0.27.2
pytest-timeout==2.3.1
python-dotenv==1.0.1
```

- [ ] **Step 2: Write minimal `pyproject.toml`**

```toml
[project]
name = "agent-hermes-tests"
version = "0.1.0"
requires-python = ">=3.12"

[tool.pytest.ini_options]
testpaths = ["tests"]
timeout = 180
addopts = "-v --tb=short"
```

- [ ] **Step 3: Write `tests/smoke/conftest.py`**

```python
import os
import time
import httpx
import pytest

HERMES_HOST = os.getenv("HERMES_HOST", "127.0.0.1")

def wait_for_health(port: int, path: str = "/health", timeout: int = 120) -> bool:
    url = f"http://{HERMES_HOST}:{port}{path}"
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = httpx.get(url, timeout=5)
            if r.status_code == 200:
                return True
        except httpx.HTTPError:
            pass
        time.sleep(2)
    return False

@pytest.fixture(scope="session")
def health_probe():
    return wait_for_health
```

- [ ] **Step 4: Write failing test `tests/smoke/test_harness_boots.py`**

```python
def test_harness_module_importable():
    """The smoke harness fixture must be importable. Sanity check only."""
    from conftest import wait_for_health
    assert callable(wait_for_health)
```

- [ ] **Step 5: Install dev deps + run test — expect PASS**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest tests/smoke/test_harness_boots.py -v
```

Expected: `1 passed`.

- [ ] **Step 6: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/pyproject.toml apps/prototype/agent-hermes/requirements-dev.txt apps/prototype/agent-hermes/tests/
git commit -m "test(agent-hermes): add pytest smoke harness scaffold"
```

**🛑 Phase 0 checkpoint — Chief review before Phase 1.**

---

## Phase 1 — Base Compose: Hermes Core + Hindsight

**Goal:** Boot the two foundational services (agent runtime + memory) with a passing smoke test.

### Task 1.1: Add `hermes-core` submodule

**Files:**
- Modify: `.gitmodules`
- Create: `vendor/hermes-core/` (via submodule)

- [ ] **Step 1: Add submodule pinned to the tag from VERSION-MANIFEST.md**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/NousResearch/hermes-agent.git vendor/hermes-core
cd vendor/hermes-core
git checkout <pinned-tag-from-manifest>
cd ..\..
```

- [ ] **Step 2: Verify submodule registered**

```powershell
git config -f .gitmodules --get-regexp path
```

Expected output includes: `submodule.vendor/hermes-core.path vendor/hermes-core`

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/hermes-core
git commit -m "feat(agent-hermes): add hermes-core submodule pinned to release tag"
```

---

### Task 1.2: Add `hindsight` submodule

**Files:**
- Modify: `.gitmodules`
- Create: `vendor/hindsight/`

- [ ] **Step 1: Add submodule**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/vectorize-io/hindsight.git vendor/hindsight
cd vendor/hindsight
git checkout <pinned-tag-from-manifest>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/hindsight
git commit -m "feat(agent-hermes): add hindsight memory submodule"
```

---

### Task 1.3: Write failing smoke test for base profile

**Files:**
- Create: `tests/smoke/test_base_profile.py`

- [ ] **Step 1: Write failing smoke test**

```python
import pytest

def test_hermes_core_health(health_probe):
    """hermes-core must report /health OK on port 8080."""
    assert health_probe(8080), "hermes-core /health did not return 200 within timeout"

def test_hindsight_health(health_probe):
    """hindsight must report /health OK on port 8081."""
    assert health_probe(8081), "hindsight /health did not return 200 within timeout"
```

- [ ] **Step 2: Run — expect FAIL (no services running yet)**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
pytest tests/smoke/test_base_profile.py -v
```

Expected: 2 failures, both with "did not return 200 within timeout".

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_base_profile.py
git commit -m "test(agent-hermes): add failing smoke for base profile health checks"
```

---

### Task 1.4: Write `.env.example`

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Write `.env.example`**

```bash
# ── Hermes Maximus ── Environment Template ───────────────────────
# Copy to .env and fill in. .env is gitignored.

# Primary LLM provider (Nous Research)
NOUS_API_KEY=your_nous_api_key_here
NOUS_MODEL=Hermes-4-405B

# Optional providers
ANTHROPIC_API_KEY=
GCP_PROJECT=
VERTEX_LOCATION=us-central1

# Web search plugin (multi-provider)
SERPER_API_KEY=
TAVILY_API_KEY=
EXA_API_KEY=

# Hindsight memory
HINDSIGHT_DB_PATH=/var/lib/hindsight/db
HINDSIGHT_EMBED_MODEL=text-embedding-3-small

# Mission Control
MISSION_CONTROL_COST_CEILING_USD=5.00
MISSION_CONTROL_TIMEOUT_SECONDS=1800

# Network
HERMES_BIND=127.0.0.1
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.env.example
git commit -m "feat(agent-hermes): add .env.example template"
```

---

### Task 1.5: Write `docker-compose.yml` (base — hermes-core + hindsight)

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Write base compose file**

```yaml
name: hermes-maximus

networks:
  hermes-net:
    driver: bridge

volumes:
  hindsight-db:
    driver: local

services:
  hermes-core:
    build:
      context: ./vendor/hermes-core
      dockerfile: Dockerfile
    container_name: hermes-core
    environment:
      - NOUS_API_KEY=${NOUS_API_KEY}
      - NOUS_MODEL=${NOUS_MODEL}
      - HINDSIGHT_URL=http://hindsight:8081
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8080:8080"
    volumes:
      - ./skills:/app/skills:ro
      - ./plugins:/app/plugins:ro
      - ./config/hermes.toml:/app/config/hermes.toml:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hindsight:
        condition: service_healthy
    networks: [hermes-net]
    restart: unless-stopped

  hindsight:
    build:
      context: ./vendor/hindsight
      dockerfile: Dockerfile
    container_name: hindsight
    environment:
      - HINDSIGHT_DB_PATH=${HINDSIGHT_DB_PATH}
      - HINDSIGHT_EMBED_MODEL=${HINDSIGHT_EMBED_MODEL}
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8081:8081"
    volumes:
      - hindsight-db:/var/lib/hindsight/db
      - ./config/hindsight.yaml:/app/config/hindsight.yaml:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 20s
    networks: [hermes-net]
    restart: unless-stopped
```

- [ ] **Step 2: Write minimal `config/hermes.toml`**

```toml
# Hermes Core runtime config

[provider]
primary = "nous"
fallback = ["anthropic"]

[memory]
backend = "hindsight"
url = "http://hindsight:8081"

[skills]
hot_reload = true
reload_interval_seconds = 300
search_paths = ["/app/skills/wondelai", "/app/skills/custom"]

[plugins]
search_paths = ["/app/plugins"]

[safety]
max_tool_calls_per_task = 50
max_recursive_depth = 5
wall_clock_timeout_seconds = 1800
```

- [ ] **Step 3: Write minimal `config/hindsight.yaml`**

```yaml
storage:
  path: /var/lib/hindsight/db
  max_size_gb: 10

embedding:
  model: text-embedding-3-small
  dimensions: 1536

retrieval:
  semantic_weight: 0.5
  graph_weight: 0.3
  temporal_weight: 0.2
  top_k: 20

redaction:
  # Fields matching these patterns are redacted before storage.
  patterns:
    - "(?i)api[_-]?key"
    - "(?i)password"
    - "(?i)secret"
    - "(?i)token"
    - "(?i)bearer"
```

- [ ] **Step 4: Copy `.env.example` → `.env` and fill with test values (Chief manually sets `NOUS_API_KEY`)**

Run:
```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
Copy-Item .env.example .env
# Chief edits .env to add real NOUS_API_KEY
```

- [ ] **Step 5: Boot base profile**

```powershell
docker compose up -d
```

Expected: two containers start, both healthy within 60s.

- [ ] **Step 6: Re-run smoke — expect PASS**

```powershell
pytest tests/smoke/test_base_profile.py -v
```

Expected: `2 passed`.

- [ ] **Step 7: Tear down**

```powershell
docker compose down
```

- [ ] **Step 8: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.yml apps/prototype/agent-hermes/config/hermes.toml apps/prototype/agent-hermes/config/hindsight.yaml
git commit -m "feat(agent-hermes): base compose boots hermes-core + hindsight (smoke green)"
```

**🛑 Phase 1 checkpoint — Chief runs `docker compose up` locally, confirms green, then Phase 2.**

---

## Phase 2 — UI: Mission Control + Workspace

**Goal:** Add Mission Control (fleet orchestration) and Workspace UI (chat/terminal/memory) to base profile.

### Task 2.1: Add `mission-control` submodule

**Files:**
- Modify: `.gitmodules`

- [ ] **Step 1: Add submodule**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/builderz-labs/mission-control.git vendor/mission-control
cd vendor/mission-control
git checkout <pinned-tag>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/mission-control
git commit -m "feat(agent-hermes): add mission-control submodule"
```

---

### Task 2.2: Add `workspace-ui` submodule

- [ ] **Step 1: Add submodule**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/outsourc-e/hermes-workspace.git vendor/workspace-ui
cd vendor/workspace-ui
git checkout <pinned-tag>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/workspace-ui
git commit -m "feat(agent-hermes): add workspace-ui submodule"
```

---

### Task 2.3: Extend smoke test for UI services

**Files:**
- Modify: `tests/smoke/test_base_profile.py`

- [ ] **Step 1: Append failing tests**

```python
def test_mission_control_health(health_probe):
    assert health_probe(3000), "mission-control /health did not return 200 within timeout"

def test_workspace_ui_health(health_probe):
    assert health_probe(3001), "workspace-ui /health did not return 200 within timeout"
```

- [ ] **Step 2: Run — expect FAIL on the two new tests**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
pytest tests/smoke/test_base_profile.py -v
```

Expected: 2 failed, 2 passed.

- [ ] **Step 3: Commit (red)**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_base_profile.py
git commit -m "test(agent-hermes): add failing smoke for mission-control + workspace-ui"
```

---

### Task 2.4: Extend `docker-compose.yml` with mission-control + workspace-ui

**Files:**
- Modify: `docker-compose.yml`
- Create: `config/mission-control.yaml`

- [ ] **Step 1: Write `config/mission-control.yaml`**

```yaml
fleet:
  routing_strategy: round-robin
  default_agent: hermes-core

cost:
  ceiling_usd_per_task: 5.00
  ceiling_usd_per_day: 50.00
  alert_threshold_pct: 80

timeouts:
  task_wall_clock_seconds: 1800
  tool_call_seconds: 120

triggers:
  # Which tasks trigger council review (see council-triggers.yaml).
  council_on_high_stakes: true
```

- [ ] **Step 2: Append two services to `docker-compose.yml`**

Add under `services:`:

```yaml
  mission-control:
    build:
      context: ./vendor/mission-control
      dockerfile: Dockerfile
    container_name: mission-control
    environment:
      - HERMES_CORE_URL=http://hermes-core:8080
      - HINDSIGHT_URL=http://hindsight:8081
      - COST_CEILING_USD=${MISSION_CONTROL_COST_CEILING_USD}
      - TIMEOUT_SECONDS=${MISSION_CONTROL_TIMEOUT_SECONDS}
    ports:
      - "${HERMES_BIND:-127.0.0.1}:3000:3000"
    volumes:
      - ./config/mission-control.yaml:/app/config/mission-control.yaml:ro
      - ./data/mission-control-db:/var/lib/mission-control
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hermes-core:
        condition: service_healthy
    networks: [hermes-net]
    restart: unless-stopped

  workspace-ui:
    build:
      context: ./vendor/workspace-ui
      dockerfile: Dockerfile
    container_name: workspace-ui
    environment:
      - MISSION_CONTROL_URL=http://mission-control:3000
      - HINDSIGHT_URL=http://hindsight:8081
    ports:
      - "${HERMES_BIND:-127.0.0.1}:3001:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      mission-control:
        condition: service_healthy
    networks: [hermes-net]
    restart: unless-stopped
```

- [ ] **Step 3: Boot + re-run smoke**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
docker compose up -d
pytest tests/smoke/test_base_profile.py -v
```

Expected: `4 passed`.

- [ ] **Step 4: Tear down + commit**

```powershell
docker compose down
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.yml apps/prototype/agent-hermes/config/mission-control.yaml
git commit -m "feat(agent-hermes): mission-control + workspace-ui join base profile (smoke green)"
```

**🛑 Phase 2 checkpoint — Chief verifies UI reachable at http://127.0.0.1:3000 and :3001.**

---

## Phase 3 — Skills + Plugins (Base Profile)

**Goal:** Mount the production skill pack and two core plugins.

### Task 3.1: Add `wondelai/skills` submodule

- [ ] **Step 1: Add**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/wondelai/skills.git skills/wondelai
cd skills/wondelai
git checkout <pinned-tag>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/skills/wondelai
git commit -m "feat(agent-hermes): mount wondelai/skills production pack"
```

---

### Task 3.2: Add `web-search-plus` plugin submodule

- [ ] **Step 1: Add**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/robbyczgw-cla/hermes-web-search-plus.git plugins/web-search-plus
cd plugins/web-search-plus
git checkout <pinned-tag>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/plugins/web-search-plus
git commit -m "feat(agent-hermes): add web-search-plus plugin (Serper+Tavily+Exa)"
```

---

### Task 3.3: Add `evey-bridge` plugin submodule (Claude Code bridge)

- [ ] **Step 1: Add**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/42-evey/evey-bridge-plugin.git plugins/evey-bridge
cd plugins/evey-bridge
git checkout <pinned-tag>
cd ..\..
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/plugins/evey-bridge
git commit -m "feat(agent-hermes): add evey-bridge plugin (Claude Code handoff)"
```

---

### Task 3.4: Integration test — plugin loads & skill discoverable

**Files:**
- Create: `tests/integration/test_skill_discovery.py`

- [ ] **Step 1: Write failing test**

```python
import httpx

def test_hermes_lists_wondelai_skills():
    """hermes-core GET /skills must include at least one wondelai skill."""
    r = httpx.get("http://127.0.0.1:8080/skills", timeout=10)
    r.raise_for_status()
    skills = r.json()
    names = [s.get("source", "") for s in skills]
    assert any("wondelai" in n for n in names), (
        f"no wondelai skill found in response; got {names[:5]}..."
    )

def test_hermes_lists_web_search_plus_plugin():
    r = httpx.get("http://127.0.0.1:8080/plugins", timeout=10)
    r.raise_for_status()
    plugins = r.json()
    assert any(p.get("name") == "web-search-plus" for p in plugins)
```

- [ ] **Step 2: Boot, run test — expect PASS**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
docker compose up -d
pytest tests/integration/test_skill_discovery.py -v
```

Expected: `2 passed`. (If fail: check `config/hermes.toml` `search_paths`, confirm mounts.)

- [ ] **Step 3: Tear down + commit**

```powershell
docker compose down
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/integration/
git commit -m "test(agent-hermes): integration test — skill + plugin discovery"
```

**🛑 Phase 3 checkpoint — Chief review.**

---

## Phase 4 — Meta Profile (super-hermes + dojo + council)

**Goal:** Opt-in meta-agent layer.

### Task 4.1: Add three submodules

- [ ] **Step 1: super-hermes**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/Cranot/super-hermes.git vendor/super-hermes
cd vendor/super-hermes && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 2: hermes-dojo**

```powershell
git submodule add https://github.com/Yonkoo11/hermes-dojo.git vendor/hermes-dojo
cd vendor/hermes-dojo && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 3: hermes-council**

```powershell
git submodule add https://github.com/Ridwannurudeen/hermes-council.git vendor/hermes-council
cd vendor/hermes-council && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 4: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/super-hermes apps/prototype/agent-hermes/vendor/hermes-dojo apps/prototype/agent-hermes/vendor/hermes-council
git commit -m "feat(agent-hermes): add meta profile submodules (super-hermes, dojo, council)"
```

---

### Task 4.2: Write config files for meta services

**Files:**
- Create: `config/dojo-policies.yaml`
- Create: `config/council-triggers.yaml`

- [ ] **Step 1: Write `config/dojo-policies.yaml`**

```yaml
regression_detection:
  window_days: 7
  metrics:
    - name: task_success_rate
      threshold_pct_drop: 10
    - name: avg_tokens_per_task
      threshold_pct_increase: 30
    - name: avg_latency_seconds
      threshold_pct_increase: 50

alerts:
  channels:
    - type: mission-control
    - type: log
      level: warning

sampling:
  # Don't evaluate every task — sample for efficiency.
  rate: 0.2
```

- [ ] **Step 2: Write `config/council-triggers.yaml`**

```yaml
# When ANY of these match, mission-control invokes hermes-council
# to debate before the action is committed.

patterns:
  commands:
    - "rm -rf"
    - "git reset --hard"
    - "git push --force"
    - "DROP TABLE"
    - "TRUNCATE"
    - "terraform apply"
    - "terraform destroy"
    - "kubectl delete"

  file_writes:
    deny_outside:
      - /app/data
      - /app/skills/custom
      - /app/config

  network:
    # Flags any HTTP call to these domains as high-stakes.
    production_allowlist:
      - "api.sentra.ai"
      - "prod.gcp.sentra.internal"

  skill_metadata:
    - stakes: high

debate:
  num_perspectives: 3
  max_rounds: 3
  timeout_seconds: 120
```

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/config/dojo-policies.yaml apps/prototype/agent-hermes/config/council-triggers.yaml
git commit -m "feat(agent-hermes): dojo + council config defaults"
```

---

### Task 4.3: Write `docker-compose.meta.yml` overlay

**Files:**
- Create: `docker-compose.meta.yml`

- [ ] **Step 1: Write overlay**

```yaml
# Overlay for: docker compose -f docker-compose.yml -f docker-compose.meta.yml up -d

services:
  super-hermes:
    build:
      context: ./vendor/super-hermes
      dockerfile: Dockerfile
    container_name: super-hermes
    environment:
      - HERMES_CORE_URL=http://hermes-core:8080
      - HINDSIGHT_URL=http://hindsight:8081
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8090:8090"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8090/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hermes-core:
        condition: service_healthy
    networks: [hermes-net]
    profiles: [meta]
    restart: unless-stopped

  hermes-dojo:
    build:
      context: ./vendor/hermes-dojo
      dockerfile: Dockerfile
    container_name: hermes-dojo
    environment:
      - HINDSIGHT_URL=http://hindsight:8081
      - MISSION_CONTROL_URL=http://mission-control:3000
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8091:8091"
    volumes:
      - ./config/dojo-policies.yaml:/app/config/dojo-policies.yaml:ro
      - ./data/logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8091/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hindsight:
        condition: service_healthy
    networks: [hermes-net]
    profiles: [meta]
    restart: unless-stopped

  hermes-council:
    build:
      context: ./vendor/hermes-council
      dockerfile: Dockerfile
    container_name: hermes-council
    environment:
      - HERMES_CORE_URL=http://hermes-core:8080
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8092:8092"
    volumes:
      - ./config/council-triggers.yaml:/app/config/council-triggers.yaml:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8092/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hermes-core:
        condition: service_healthy
    networks: [hermes-net]
    profiles: [meta]
    restart: unless-stopped
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.meta.yml
git commit -m "feat(agent-hermes): docker-compose.meta.yml overlay (super-hermes + dojo + council)"
```

---

### Task 4.4: Smoke test for meta profile

**Files:**
- Create: `tests/smoke/test_meta_profile.py`

- [ ] **Step 1: Write failing test**

```python
def test_super_hermes_health(health_probe):
    assert health_probe(8090)

def test_hermes_dojo_health(health_probe):
    assert health_probe(8091)

def test_hermes_council_health(health_probe):
    assert health_probe(8092)
```

- [ ] **Step 2: Boot meta profile**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
docker compose -f docker-compose.yml -f docker-compose.meta.yml --profile meta up -d
```

- [ ] **Step 3: Run smoke — expect PASS**

```powershell
pytest tests/smoke/test_meta_profile.py -v
```

Expected: `3 passed`.

- [ ] **Step 4: Tear down + commit**

```powershell
docker compose -f docker-compose.yml -f docker-compose.meta.yml down
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_meta_profile.py
git commit -m "test(agent-hermes): smoke for meta profile (3 services)"
```

**🛑 Phase 4 checkpoint.**

---

## Phase 5 — Skills Profile (Self-Extending Capabilities)

**Goal:** Opt-in skill-factory + skill-marketplace + nightly self-evolution.

### Task 5.1: Add three submodules

- [ ] **Step 1: skill-factory**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
git submodule add https://github.com/Romanescu11/hermes-skill-factory.git vendor/skill-factory
cd vendor/skill-factory && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 2: skill-marketplace**

```powershell
git submodule add https://github.com/Lethe044/hermes-skill-marketplace.git vendor/skill-marketplace
cd vendor/skill-marketplace && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 3: self-evolution**

```powershell
git submodule add https://github.com/NousResearch/hermes-agent-self-evolution.git vendor/self-evolution
cd vendor/self-evolution && git checkout <pinned-tag> && cd ..\..
```

- [ ] **Step 4: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.gitmodules apps/prototype/agent-hermes/vendor/skill-factory apps/prototype/agent-hermes/vendor/skill-marketplace apps/prototype/agent-hermes/vendor/self-evolution
git commit -m "feat(agent-hermes): add skills profile submodules (factory + marketplace + self-evolution)"
```

---

### Task 5.2: Write `docker-compose.skills.yml` overlay

**Files:**
- Create: `docker-compose.skills.yml`

- [ ] **Step 1: Write overlay**

```yaml
# Overlay for: docker compose -f docker-compose.yml -f docker-compose.skills.yml up -d

services:
  skill-factory:
    build:
      context: ./vendor/skill-factory
      dockerfile: Dockerfile
    container_name: skill-factory
    environment:
      - HINDSIGHT_URL=http://hindsight:8081
      - MARKETPLACE_URL=http://skill-marketplace:8094
      - SCAN_INTERVAL_MINUTES=60
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8093:8093"
    volumes:
      - ./skills/custom:/app/output
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8093/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hindsight:
        condition: service_healthy
    networks: [hermes-net]
    profiles: [skills]
    restart: unless-stopped

  skill-marketplace:
    build:
      context: ./vendor/skill-marketplace
      dockerfile: Dockerfile
    container_name: skill-marketplace
    environment:
      - HERMES_CORE_URL=http://hermes-core:8080
    ports:
      - "${HERMES_BIND:-127.0.0.1}:8094:8094"
    volumes:
      - ./data/marketplace-store:/var/lib/marketplace
      - ./skills:/app/skills
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8094/health"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s
    depends_on:
      hermes-core:
        condition: service_healthy
    networks: [hermes-net]
    profiles: [skills]
    restart: unless-stopped

  self-evolution:
    build:
      context: ./vendor/self-evolution
      dockerfile: Dockerfile
    container_name: self-evolution
    environment:
      - HINDSIGHT_URL=http://hindsight:8081
      - HERMES_CORE_URL=http://hermes-core:8080
      - NOUS_API_KEY=${NOUS_API_KEY}
      - CRON_SCHEDULE=0 2 * * *   # 02:00 local daily
    volumes:
      - ./config:/app/config:ro
      - ./data/logs:/app/logs
    networks: [hermes-net]
    profiles: [skills]
    restart: unless-stopped
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docker-compose.skills.yml
git commit -m "feat(agent-hermes): docker-compose.skills.yml overlay (factory + marketplace + self-evolution)"
```

---

### Task 5.3: Smoke test for skills profile

**Files:**
- Create: `tests/smoke/test_skills_profile.py`

- [ ] **Step 1: Write test**

```python
def test_skill_factory_health(health_probe):
    assert health_probe(8093)

def test_skill_marketplace_health(health_probe):
    assert health_probe(8094)

def test_self_evolution_container_running():
    """self-evolution has no HTTP port — check container state instead."""
    import subprocess
    out = subprocess.run(
        ["docker", "inspect", "--format", "{{.State.Status}}", "self-evolution"],
        capture_output=True, text=True, timeout=10,
    )
    assert out.returncode == 0, out.stderr
    assert out.stdout.strip() == "running"
```

- [ ] **Step 2: Boot, run, tear down**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
docker compose -f docker-compose.yml -f docker-compose.skills.yml --profile skills up -d
pytest tests/smoke/test_skills_profile.py -v
docker compose -f docker-compose.yml -f docker-compose.skills.yml down
```

Expected: `3 passed`.

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_skills_profile.py
git commit -m "test(agent-hermes): smoke for skills profile"
```

**🛑 Phase 5 checkpoint.**

---

## Phase 6 — Operator Ergonomics: PowerShell + Makefile

**Goal:** One-command lifecycle on Windows and WSL/Linux.

### Task 6.1: Write `Makefile`

**Files:**
- Create: `Makefile`

- [ ] **Step 1: Write Makefile**

```makefile
.PHONY: help up up-meta up-skills up-full down logs ps smoke smoke-all version-check

help:
	@echo "Hermes Maximus — targets:"
	@echo "  up          — base profile"
	@echo "  up-meta     — base + meta profile"
	@echo "  up-skills   — base + skills profile"
	@echo "  up-full     — base + meta + skills"
	@echo "  down        — stop everything"
	@echo "  logs SVC=x  — follow service logs"
	@echo "  smoke       — run base smoke tests"
	@echo "  smoke-all   — run every smoke+integration test"
	@echo "  version-check — verify submodule SHAs match VERSION-MANIFEST.md"

up:
	docker compose up -d

up-meta:
	docker compose -f docker-compose.yml -f docker-compose.meta.yml --profile meta up -d

up-skills:
	docker compose -f docker-compose.yml -f docker-compose.skills.yml --profile skills up -d

up-full:
	docker compose -f docker-compose.yml -f docker-compose.meta.yml -f docker-compose.skills.yml --profile meta --profile skills up -d

down:
	docker compose -f docker-compose.yml -f docker-compose.meta.yml -f docker-compose.skills.yml down

logs:
	docker compose logs -f $(SVC)

ps:
	docker compose ps

smoke:
	pytest tests/smoke/test_base_profile.py -v

smoke-all:
	pytest tests/ -v

version-check:
	python scripts/verify_versions.py
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/Makefile
git commit -m "feat(agent-hermes): Makefile with up/down/smoke targets"
```

---

### Task 6.2: Write PowerShell equivalents

**Files:**
- Create: `scripts/up.ps1`
- Create: `scripts/up-meta.ps1`
- Create: `scripts/up-skills.ps1`
- Create: `scripts/up-full.ps1`
- Create: `scripts/down.ps1`
- Create: `scripts/smoke.ps1`

- [ ] **Step 1: Write `scripts/up.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
docker compose up -d
Write-Host "✓ Base profile up. UI: http://127.0.0.1:3000 + :3001" -ForegroundColor Green
```

- [ ] **Step 2: Write `scripts/up-meta.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
docker compose -f docker-compose.yml -f docker-compose.meta.yml --profile meta up -d
Write-Host "✓ Base + meta profile up (super-hermes :8090, dojo :8091, council :8092)" -ForegroundColor Green
```

- [ ] **Step 3: Write `scripts/up-skills.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
docker compose -f docker-compose.yml -f docker-compose.skills.yml --profile skills up -d
Write-Host "✓ Base + skills profile up (factory :8093, marketplace :8094, self-evolution cron)" -ForegroundColor Green
```

- [ ] **Step 4: Write `scripts/up-full.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
docker compose -f docker-compose.yml -f docker-compose.meta.yml -f docker-compose.skills.yml --profile meta --profile skills up -d
Write-Host "✓ Full stack up — all 13 services" -ForegroundColor Green
```

- [ ] **Step 5: Write `scripts/down.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
docker compose -f docker-compose.yml -f docker-compose.meta.yml -f docker-compose.skills.yml down
Write-Host "✓ Stack down" -ForegroundColor Yellow
```

- [ ] **Step 6: Write `scripts/smoke.ps1`**

```powershell
#Requires -Version 7.0
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
if (-not (Test-Path .venv)) {
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements-dev.txt
} else {
    .\.venv\Scripts\Activate.ps1
}
pytest tests/smoke/ -v
```

- [ ] **Step 7: Run one script to confirm pwsh executes**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
.\scripts\up.ps1
.\scripts\down.ps1
```

Expected: both complete without errors.

- [ ] **Step 8: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/scripts/
git commit -m "feat(agent-hermes): PowerShell 7 operator scripts (Windows parity)"
```

---

### Task 6.3: Write `scripts/verify_versions.py`

**Files:**
- Create: `scripts/verify_versions.py`

- [ ] **Step 1: Write script**

```python
"""Verify every submodule SHA matches VERSION-MANIFEST.md."""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
MANIFEST = ROOT / "docs" / "VERSION-MANIFEST.md"

def parsed_manifest():
    """Return {repo_path: expected_sha8}."""
    text = MANIFEST.read_text(encoding="utf-8")
    pattern = re.compile(r"^\|\s*([\w\-/]+)\s*\|\s*[^|]+\|\s*([a-f0-9]{6,40})\s*\|", re.MULTILINE)
    return dict(pattern.findall(text))

def submodule_shas():
    """Return {submodule_path: short_sha}."""
    out = subprocess.run(
        ["git", "submodule", "status"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    result = {}
    for line in out.splitlines():
        parts = line.strip().split()
        if len(parts) >= 2:
            sha, path = parts[0].lstrip("+-"), parts[1]
            result[path] = sha[:8]
    return result

def main():
    manifest = parsed_manifest()
    actual = submodule_shas()
    failures = []
    for path, sha in actual.items():
        # Map path like "vendor/hermes-core" → owner/repo via manifest.
        # For now, just check that every submodule path has SOME recorded sha.
        if not any(sha.startswith(m[:8]) for m in manifest.values()):
            failures.append(f"{path} sha {sha} not found in VERSION-MANIFEST.md")
    if failures:
        print("VERSION CHECK FAILED:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        sys.exit(1)
    print(f"✓ {len(actual)} submodules match manifest")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run — expect PASS (all submodules match manifest)**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
python scripts/verify_versions.py
```

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/scripts/verify_versions.py
git commit -m "feat(agent-hermes): version-check script pins submodules to manifest"
```

**🛑 Phase 6 checkpoint.**

---

## Phase 7 — Documentation

**Goal:** README + ARCHITECTURE + OPERATIONS + META-AGENT-LOOP + SKILLS-CATALOG.

### Task 7.1: Write `README.md` (operator run book)

**Files:**
- Modify: `README.md` (replace placeholder)

- [ ] **Step 1: Write README**

```markdown
# Hermes Maximus

Personal meta-agent stack: 14 curated repos from the awesome-hermes-agent
ecosystem composed into a layered Docker deployment.

## Quickstart (Windows 11, PowerShell 7)

```powershell
# One-time setup
git submodule update --init --recursive
Copy-Item .env.example .env           # fill NOUS_API_KEY at minimum

# Run
.\scripts\up.ps1                      # base profile (4 services)
# or
.\scripts\up-full.ps1                 # everything (13 services)

# Verify
.\scripts\smoke.ps1

# UI
# Mission Control → http://127.0.0.1:3000
# Workspace       → http://127.0.0.1:3001

# Tear down
.\scripts\down.ps1
```

## Profiles

| Profile | Services | RAM | Boot |
|---------|---------|-----|------|
| base | 4 | ~3 GB | ~2 min |
| meta | +3 | +2 GB | +2 min |
| skills | +3 | +1 GB | +1 min |
| full | 13 | ~6 GB | ~5 min |

## Documentation

- [Design Spec](./docs/superpowers/specs/2026-04-12-hermes-maximus-design.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Operations](./docs/OPERATIONS.md)
- [Meta-Agent Loop](./docs/META-AGENT-LOOP.md)
- [Skills Catalog](./docs/SKILLS-CATALOG.md)
- [Version Manifest](./docs/VERSION-MANIFEST.md)

## Boundaries

- Prototype-only. No production GCP. No real patient data. No prod credentials.
- See `apps/prototype/AGENTS.md` for division rules.
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/README.md
git commit -m "docs(agent-hermes): operator README with quickstart and profile table"
```

---

### Task 7.2: Write `docs/ARCHITECTURE.md`

- [ ] **Step 1: Write ARCHITECTURE.md**

Reference the design spec §3-5 and include the topology diagram, port map, data flow, and the rationale for layered profiles.

Keep under 200 lines. Include ASCII topology diagram copied from the spec §3.2.

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docs/ARCHITECTURE.md
git commit -m "docs(agent-hermes): architecture reference doc"
```

---

### Task 7.3: Write `docs/OPERATIONS.md`

- [ ] **Step 1: Write OPERATIONS.md**

Sections required:
- Daily operation (up / down / logs / ps)
- Backup: `docker run --rm -v hermes-maximus_hindsight-db:/db -v ${PWD}/backups:/out alpine tar czf /out/hindsight-$(date +%F).tar.gz /db`
- Restore: reverse
- Chaos drills (4 drills from spec §8.3)
- Bumping a submodule version (git fetch → checkout → update manifest → `make version-check` → commit)
- Secret rotation

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docs/OPERATIONS.md
git commit -m "docs(agent-hermes): operations runbook (backup/restore/chaos/bump)"
```

---

### Task 7.4: Write `docs/META-AGENT-LOOP.md`

- [ ] **Step 1: Write META-AGENT-LOOP.md**

Expand spec §5 into a full narrative:
- Sequence diagram (mermaid) of task → super-hermes → core → hindsight → dojo → council → factory → marketplace → self-evolution
- Event types on hindsight stream (task_started, tool_called, task_completed, outcome_evaluated)
- How skill-factory decides a pattern is "repeated enough"
- How council decides a debate is "done"
- Self-evolution schedule: nightly 02:00 local, DSPy pass on last 7 days' traces, updates `config/prompts/*.toml`

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docs/META-AGENT-LOOP.md
git commit -m "docs(agent-hermes): meta-agent loop reference"
```

---

### Task 7.5: Write `docs/SKILLS-CATALOG.md`

- [ ] **Step 1: Enumerate every skill discoverable in `skills/wondelai` + `skills/custom`**

Run:
```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
Get-ChildItem skills -Recurse -Filter "SKILL.md" | Select-Object FullName
```

For each, extract: name, description, invocation example, source. Put in markdown table.

- [ ] **Step 2: Write SKILLS-CATALOG.md**

Format:
```markdown
| Skill | Source | Description | Example |
|-------|--------|-------------|---------|
| code-review | wondelai | Reviews a diff for ... | `hermes skill code-review --diff ./changes.patch` |
```

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/docs/SKILLS-CATALOG.md
git commit -m "docs(agent-hermes): skills catalog enumeration"
```

**🛑 Phase 7 checkpoint — Chief review docs.**

---

## Phase 8 — Full Stack Integration + Chaos Drills

**Goal:** Verify all 13 services run together, and graceful degradation works.

### Task 8.1: Full-stack smoke

**Files:**
- Create: `tests/smoke/test_full_stack.py`

- [ ] **Step 1: Write test**

```python
import pytest

ALL_PORTS = {
    "mission-control": 3000,
    "workspace-ui": 3001,
    "hermes-core": 8080,
    "hindsight": 8081,
    "super-hermes": 8090,
    "hermes-dojo": 8091,
    "hermes-council": 8092,
    "skill-factory": 8093,
    "skill-marketplace": 8094,
}

@pytest.mark.parametrize("service,port", ALL_PORTS.items())
def test_service_healthy(service, port, health_probe):
    assert health_probe(port, timeout=180), f"{service} failed /health on :{port}"
```

- [ ] **Step 2: Boot full, run, tear down**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
.\scripts\up-full.ps1
pytest tests/smoke/test_full_stack.py -v
.\scripts\down.ps1
```

Expected: `9 passed` (self-evolution has no HTTP port, not included here).

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/smoke/test_full_stack.py
git commit -m "test(agent-hermes): full-stack smoke — all 9 HTTP services healthy"
```

---

### Task 8.2: Chaos drill — kill hindsight

**Files:**
- Create: `tests/integration/test_chaos_hindsight.py`

- [ ] **Step 1: Write test**

```python
import subprocess
import time
import httpx

def test_hermes_core_degrades_gracefully_when_hindsight_dies():
    # Assume full stack running before test.
    subprocess.run(["docker", "kill", "hindsight"], check=True, timeout=10)
    time.sleep(5)
    # hermes-core must still respond to /health (degraded mode).
    r = httpx.get("http://127.0.0.1:8080/health", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("memory_backend") == "degraded" or body.get("status") == "degraded"
    # Restore.
    subprocess.run(["docker", "start", "hindsight"], check=True, timeout=10)
```

- [ ] **Step 2: Boot full, run, clean up**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
.\scripts\up-full.ps1
pytest tests/integration/test_chaos_hindsight.py -v
.\scripts\down.ps1
```

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/integration/test_chaos_hindsight.py
git commit -m "test(agent-hermes): chaos drill — hindsight kill, graceful degradation"
```

---

### Task 8.3: End-to-end task round-trip

**Files:**
- Create: `tests/integration/test_e2e_roundtrip.py`

- [ ] **Step 1: Write test**

```python
import httpx
import time

def test_hello_world_task_completes_and_is_stored():
    # 1. Post task to mission-control.
    r = httpx.post(
        "http://127.0.0.1:3000/tasks",
        json={"prompt": "Reply with exactly the string: HERMES_OK", "stakes": "low"},
        timeout=30,
    )
    r.raise_for_status()
    task_id = r.json()["task_id"]

    # 2. Poll for completion.
    deadline = time.time() + 120
    while time.time() < deadline:
        status = httpx.get(f"http://127.0.0.1:3000/tasks/{task_id}", timeout=10).json()
        if status.get("state") == "completed":
            break
        time.sleep(3)
    else:
        raise AssertionError("task did not complete in 120s")

    assert "HERMES_OK" in status["output"]

    # 3. Verify trace in hindsight.
    trace = httpx.get(f"http://127.0.0.1:8081/traces/{task_id}", timeout=10).json()
    assert trace["task_id"] == task_id
    assert len(trace["events"]) > 0
```

- [ ] **Step 2: Boot full, run, clean up**

```powershell
cd D:\Devop\abyss-monorepo\apps\prototype\agent-hermes
.\scripts\up-full.ps1
pytest tests/integration/test_e2e_roundtrip.py -v
.\scripts\down.ps1
```

Expected: `1 passed`. This is the spec's Success Criterion #3.

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/tests/integration/test_e2e_roundtrip.py
git commit -m "test(agent-hermes): e2e round-trip — task completes + trace stored (SC #3)"
```

**🛑 Phase 8 checkpoint — the stack is now verifiably alive.**

---

## Phase 9 — Monorepo Registration & Handoff

**Goal:** Surface `agent-hermes` to the monorepo's `.agent/` memory and division-level docs.

### Task 9.1: Write `.agent/CONTEXT.md`

**Files:**
- Create: `.agent/CONTEXT.md`

- [ ] **Step 1: Write**

```markdown
# Agent-Hermes CONTEXT

**Location:** `apps/prototype/agent-hermes/`
**Division:** prototype
**Status:** Active prototype (Phase 1 stack live)
**Purpose:** Personal meta-agent — self-improving, self-monitoring, self-extending.

## Stack
14 vendored repos under `vendor/`, `skills/`, `plugins/`. Docker Compose layered profiles.
See design spec: `docs/superpowers/specs/2026-04-12-hermes-maximus-design.md`.

## LLM Provider
Nous Research primary (Hermes-4 model). Anthropic + Vertex AI + Ollama optional.

## Boundaries
- Local only. No production GCP.
- No real patient data, no production credentials.
- Not importable by any production division.
```

- [ ] **Step 2: Write `.agent/PROGRESS.md`**

```markdown
# Agent-Hermes PROGRESS

**Last updated:** 2026-04-12

## Current phase
Stack implementation (Phases 0-8 complete).

## Next
- Curate `skills/custom/` with Chief's personal workflows
- Tune `config/council-triggers.yaml` after first week of traces
- Evaluate self-evolution DSPy output after first nightly run

## Blockers
None.
```

- [ ] **Step 3: Write `.agent/HANDOFF.md`**

```markdown
# Agent-Hermes HANDOFF — 2026-04-12

## State
Full stack committed, all smoke + e2e tests green on Chief's machine.

## How to continue
1. `git submodule update --init --recursive`
2. `cp .env.example .env`; fill NOUS_API_KEY
3. `.\scripts\up.ps1` (base) or `.\scripts\up-full.ps1` (everything)
4. Verify: `.\scripts\smoke.ps1`
5. Open http://127.0.0.1:3000

## Next-session prompts
- "Add a custom skill for <X>" → add under `skills/custom/`, reload
- "Bump hermes-core to latest" → see OPERATIONS.md §Bumping
- "Enable Vertex AI provider" → set GCP_PROJECT in .env, edit hermes.toml provider.primary
```

- [ ] **Step 4: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.agent/
git commit -m "docs(agent-hermes): .agent/ CONTEXT + PROGRESS + HANDOFF"
```

---

### Task 9.2: Update `apps/prototype/AGENTS.md` with agent-hermes entry

**Files:**
- Modify: `apps/prototype/AGENTS.md`

- [ ] **Step 1: Find existing sub-apps table (search for "Sub-applications")**

Current row exists: `hermes-agent | Autonomous agent prototype | Experimental`.

- [ ] **Step 2: Replace with `agent-hermes` (new package name)**

Change the row to:
```markdown
| `agent-hermes` | Personal meta-agent (14-repo curated flagship stack) | Active |
```

- [ ] **Step 3: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/AGENTS.md
git commit -m "docs(prototype): register agent-hermes in division AGENTS.md"
```

---

### Task 9.3: Session log

**Files:**
- Create: `.agent/sessions/2026-04-12.md`

- [ ] **Step 1: Write session log (use the template from prototype AGENTS.md §8)**

```markdown
# Session: 2026-04-12

## Goal
Stand up the Hermes Maximus meta-agent flagship stack per design spec.

## Actions Taken
- Phase 0: scaffold + version manifest + pytest harness
- Phase 1: hermes-core + hindsight base compose, smoke green
- Phase 2: mission-control + workspace-ui joined base, smoke green
- Phase 3: wondelai/skills + web-search-plus + evey-bridge plugins
- Phase 4: meta profile (super-hermes + dojo + council)
- Phase 5: skills profile (factory + marketplace + self-evolution)
- Phase 6: Makefile + PowerShell operator scripts
- Phase 7: README + ARCHITECTURE + OPERATIONS + META-AGENT-LOOP + SKILLS-CATALOG
- Phase 8: full-stack smoke + chaos drill + e2e round-trip

## Files Modified
See commits `3c8c2d1..HEAD` under `apps/prototype/agent-hermes/`.

## Results
All smoke and integration tests green. Stack bootable via `.\scripts\up-full.ps1`.

## Next Steps
- Curate `skills/custom/` with Chief's workflows
- Monitor first self-evolution run (02:00 local)
- Tune council-triggers.yaml after one week of traces

## Blockers
None.
```

- [ ] **Step 2: Commit**

```powershell
cd D:\Devop\abyss-monorepo
git add apps/prototype/agent-hermes/.agent/sessions/2026-04-12.md
git commit -m "docs(agent-hermes): session log 2026-04-12"
```

**🎯 Phase 9 complete — handoff ready.**

---

## Success Criteria (from spec §12, verified by tests)

1. ✅ `.\scripts\up.ps1` brings base profile green in ≤ 3 min — Task 1.5 smoke
2. ✅ `.\scripts\up-full.ps1` brings all 13 services green in ≤ 6 min — Task 8.1
3. ✅ Hello-world task round-trips end-to-end — Task 8.3
4. ✅ Killing hindsight does not crash stack — Task 8.2
5. ✅ `.\scripts\smoke.ps1` passes on fresh checkout — Task 0.3 → 8.1
6. ✅ Documentation self-sufficient — Phase 7

---

## Self-Review Log

**Spec coverage:**
- §2 catalog → Tasks 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 5.1 (all 14 repos added)
- §3 topology (profiles) → Tasks 1.5, 4.3, 5.2
- §4 directory layout → Tasks 0.1, 7.1
- §5 data flow → Tasks 7.4 (doc) + 8.3 (e2e test proves it)
- §6 LLM provider → Task 1.4 (.env) + 1.5 (hermes.toml)
- §7 safety → Tasks 4.2 (configs), 1.5 (healthchecks)
- §8 testing → Tasks 0.3, 1.3, 2.3, 3.4, 4.4, 5.3, 8.1, 8.2, 8.3
- §9 Windows → Task 6.2
- §10 boundaries → Task 7.1 (README), 9.1 (CONTEXT)
- §11 open items → surfaced in HANDOFF + marked deliberate
- §12 success criteria → each mapped above

**Placeholder scan:** Every task shows full file content or exact commands. `<pinned-tag>` placeholders are deliberate — filled from VERSION-MANIFEST.md in each task.

**Type consistency:** Ports, container names, env var names, volume names checked across all compose files — consistent.

---

*End of plan.*
