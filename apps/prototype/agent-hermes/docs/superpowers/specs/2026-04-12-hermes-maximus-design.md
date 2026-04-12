# Hermes Maximus — Personal Meta-Agent Design Spec

**Date:** 2026-04-12
**Location:** `apps/prototype/agent-hermes/`
**Author:** Claude (Opus 4.6, 1M) with Chief (Dr. Ferdi Iskandar)
**Status:** Design approved — awaiting spec review before implementation plan
**Source:** Catalog — https://github.com/0xNyk/awesome-hermes-agent

---

## 1. Mission

Build the most advanced and complete **Personal AI Lab / Meta-Agent** stack by composing best-of-breed repositories from the awesome-hermes-agent ecosystem into a single, layered Docker Compose deployment. The agent must be self-improving, self-monitoring, and capable of extending its own skill surface autonomously.

**Scope breadth:** Flagship Stack (curated best-of-breed, ~14 repos) — not a mega-install, not a research-only report.

**Primary user:** Chief (personal use, Windows 11 Home, AMD Ryzen 5 7500F / 32 GB RAM).

**Non-goals for this spec:**
- No Sentra healthcare integration in Phase 1 (can be added later as a plugin).
- No production GCP deployment (prototype division rule — prototypes stay local).
- No real patient data, no production credentials.

---

## 2. Curated Repository Catalog (the "Flagship Stack")

All submodules are pinned to explicit tags/commits at install time. Version discovery happens in Phase 0 of the implementation plan.

### 2.1 Core (always on — `base` profile)

| # | Purpose | Repository | Role |
|---|---------|------------|------|
| 1 | Agent core | `NousResearch/hermes-agent` | Self-improving closed-loop agent runtime |
| 2 | Mission Control | `builderz-labs/mission-control` | Fleet orchestration, task dispatch, cost ceilings |
| 3 | Workspace UI | `outsourc-e/hermes-workspace` | Web chat + terminal + memory browser |
| 4 | Memory | `vectorize-io/hindsight` | Semantic + graph + temporal retrieval |
| 5 | Skill pack (prod) | `wondelai/skills` | Cross-platform production skill library |
| 6 | Web search plugin | `robbyczgw-cla/hermes-web-search-plus` | Serper + Tavily + Exa multi-provider |
| 7 | Claude Code bridge | `42-evey/evey-bridge-plugin` | Claude Code ↔ Hermes task handoff |

### 2.2 Meta-agent capabilities (opt-in — `meta` profile)

| # | Purpose | Repository | Role |
|---|---------|------------|------|
| 8 | Meta-reasoning | `Cranot/super-hermes` | Rewrites/optimizes prompts before execution |
| 9 | Self-monitor | `Yonkoo11/hermes-dojo` | Regression detection, performance tracking |
| 10 | Adversarial review | `Ridwannurudeen/hermes-council` | Multi-perspective debate on high-stakes decisions |
| 11 | Self-evolution | `NousResearch/hermes-agent-self-evolution` | DSPy + GEPA prompt optimization (nightly) |

### 2.3 Self-extending skills (opt-in — `skills` profile)

| # | Purpose | Repository | Role |
|---|---------|------------|------|
| 12 | Skill generator | `Romanescu11/hermes-skill-factory` | Auto-synthesizes skills from repeated workflows |
| 13 | Skill registry | `Lethe044/hermes-skill-marketplace` | Publishes factory output; core hot-reloads |

### 2.4 Developer ergonomics

| # | Purpose | Repository | Role |
|---|---------|------------|------|
| 14 | Documentation | `mudrii/hermes-agent-docs` | Community docs mirrored for offline reference |

**Total: 14 repositories, all pinned as git submodules under `vendor/` and `skills/` and `plugins/`.**

---

## 3. Architecture — Approach B (Layered Compose Profiles)

### 3.1 Profile model

Three Docker Compose profiles, opt-in via `--profile` flag or wrapped in PowerShell/Make helpers.

```
base    → 7 services, ~3 GB RAM, boot ≤ 2 min
meta    → +4 services, +2 GB RAM, +2 min
skills  → +2 services, +1 GB RAM, +1 min
full    → all 13 services, ~6 GB RAM, ~5 min boot
```

### 3.2 Service topology

```
┌───────────────────────────────────────────────────────────────┐
│  PROFILE: base                                                │
│                                                               │
│  [mission-control :3000] ─────┐                               │
│                                ├─→ [hermes-core :8080]        │
│  [workspace-ui   :3001] ──────┘          │                    │
│                                          ▼                    │
│                                   [hindsight :8081]           │
│                                  (semantic/graph/temporal)    │
│                                                               │
│  Skills mounted:  ./skills/ → /app/skills                     │
│  Plugins mounted: ./plugins/ → /app/plugins                   │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│  PROFILE: meta (additive)                                     │
│                                                               │
│  [super-hermes :8090]  → proxies prompts before hermes-core   │
│  [hermes-dojo  :8091]  → subscribes to hindsight event stream │
│  [hermes-council :8092] → invoked by mission-control on       │
│                           high-stakes triggers                │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│  PROFILE: skills (additive)                                   │
│                                                               │
│  [skill-factory :8093]  ← reads hindsight trace patterns      │
│  [skill-marketplace :8094] ← publishes; hermes-core reloads   │
│                                                               │
│  [self-evolution (cron)] → runs nightly DSPy/GEPA pass        │
└───────────────────────────────────────────────────────────────┘
```

### 3.3 Port allocation

| Port | Service |
|------|---------|
| 3000 | Mission Control UI |
| 3001 | Workspace UI |
| 8080 | Hermes Core API |
| 8081 | Hindsight memory API |
| 8090 | Super-Hermes (meta-reasoning proxy) |
| 8091 | Dojo dashboard |
| 8092 | Council debate API |
| 8093 | Skill Factory API |
| 8094 | Skill Marketplace API |

All ports bind to `127.0.0.1` only — no public exposure in prototype.

---

## 4. Directory Layout

```
apps/prototype/agent-hermes/
├── README.md                           # Operator run book
├── docker-compose.yml                  # base profile services
├── docker-compose.meta.yml             # meta overlay
├── docker-compose.skills.yml           # skills overlay
├── .env.example                        # template: NOUS_API_KEY, SERPER_KEY, ...
├── .gitignore                          # data/, .env, node_modules, etc.
├── .gitmodules                         # all vendor/ + skills/ + plugins/ pins
├── Makefile                            # up / up-meta / up-full / down / logs
│
├── scripts/                            # PowerShell equivalents for Windows
│   ├── up.ps1
│   ├── up-meta.ps1
│   ├── up-full.ps1
│   ├── down.ps1
│   └── smoke.ps1
│
├── vendor/                             # git submodules, pinned
│   ├── hermes-core/
│   ├── mission-control/
│   ├── workspace-ui/
│   ├── hindsight/
│   ├── super-hermes/
│   ├── hermes-dojo/
│   ├── hermes-council/
│   ├── skill-factory/
│   ├── skill-marketplace/
│   ├── self-evolution/
│   └── hermes-agent-docs/
│
├── skills/
│   ├── wondelai/                       # submodule
│   └── custom/                         # Chief's personal skills (tracked in main repo)
│
├── plugins/
│   ├── web-search-plus/                # submodule
│   └── evey-bridge/                    # submodule
│
├── config/
│   ├── hermes.toml                     # core runtime config
│   ├── hindsight.yaml                  # memory schema + retrieval weights
│   ├── mission-control.yaml            # fleet rules, cost ceilings
│   ├── dojo-policies.yaml              # regression thresholds
│   └── council-triggers.yaml           # high-stakes decision patterns
│
├── data/                               # gitignored, persistent volumes
│   ├── hindsight-db/
│   ├── mission-control-db/
│   ├── marketplace-store/
│   └── logs/
│
├── .agent/                             # monorepo convention: session memory
│   ├── CONTEXT.md
│   ├── PROGRESS.md
│   ├── HANDOFF.md
│   └── sessions/
│
└── docs/
    ├── ARCHITECTURE.md                 # this design + operational notes
    ├── SKILLS-CATALOG.md               # every skill + invocation example
    ├── OPERATIONS.md                   # backup, restore, chaos drills
    ├── META-AGENT-LOOP.md              # how dojo+council+factory interact
    └── superpowers/
        └── specs/
            └── 2026-04-12-hermes-maximus-design.md   # this file
```

---

## 5. Data Flow — The Meta-Agent Loop

```
┌─────────────────────────────────────────────────────────────┐
│  1. Chief issues task → Mission Control                     │
│  2. Mission Control routes → super-hermes (prompt optimize) │
│  3. super-hermes → hermes-core (executes with skills)       │
│  4. hermes-core writes trace + outcome → hindsight          │
│  5. hermes-dojo subscribes to hindsight event stream        │
│     └── detects regression? → alerts mission-control        │
│  6. If task matches council-triggers.yaml:                  │
│     └── hermes-council spawns debate before commit          │
│  7. skill-factory scans hindsight for repeated patterns     │
│     └── auto-synthesizes new skill → marketplace            │
│  8. hermes-core hot-reloads skills every 5 min (configurable)│
│  9. self-evolution cron (02:00 local) → DSPy/GEPA pass      │
│     └── updates prompt library in config/                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. LLM Provider Strategy

**Phase 1 (default):** Nous Research API via `NOUS_API_KEY` — native Hermes model support.

**Optional providers configurable in `config/hermes.toml`:**
- Anthropic (Claude Sonnet/Opus) via `ANTHROPIC_API_KEY`
- Google Vertex AI (Chief's primary cloud) via `GCP_PROJECT` + ADC
- Local: Ollama endpoint for offline work

**Rationale:** Hermes-family models are purpose-trained for tool use and self-reflection, which the meta-loop depends on. Other providers are fallbacks.

---

## 7. Error Handling & Safety

### 7.1 Circuit breakers (mission-control enforces)
- **Cost ceiling:** per-task USD budget; hard stop at limit
- **Tool-call budget:** max N tool invocations per task
- **Wall-clock timeout:** 30 min default, configurable per skill
- **Recursive depth:** max 5 levels of sub-agent spawning

### 7.2 Council auto-triggers (`config/council-triggers.yaml`)
- Any command matching `rm -rf`, `git reset --hard`, `DROP TABLE`, `terraform apply|destroy`
- Any file write outside `data/`, `skills/custom/`, or explicitly allowlisted paths
- Any network call to a production domain (allowlist-driven)
- Any skill invocation where `stakes: high` metadata is set

### 7.3 Health checks
Every service in `docker-compose.yml` declares a `healthcheck:` block. Mission Control polls `/health` on each service; degraded services are removed from the routing pool and surfaced in the Workspace UI status panel.

### 7.4 Secret handling
- All secrets via `.env` (gitignored).
- `.env.example` committed with placeholder values only.
- No secrets logged. Hindsight redacts any field matching the secret-pattern list before storage.
- Credentials never placed in git, skills, or task traces.

---

## 8. Testing Strategy

### 8.1 Smoke test (`scripts/smoke.ps1` / `make smoke`)
1. `docker compose up -d` (base profile only)
2. Wait for all `/health` endpoints green (timeout 180s)
3. POST hello-world task to Mission Control
4. Assert task completes with correct output
5. Assert trace written to hindsight
6. `docker compose down`

### 8.2 Integration tests
- Pytest suite per service under `vendor/<service>/tests/` (upstream tests, not rewritten)
- Cross-service contract tests under `tests/integration/` (our additions)

### 8.3 Chaos drills
Documented in `docs/OPERATIONS.md`:
- Kill hindsight → verify graceful fallback to short-term memory
- Fill hindsight disk → verify eviction policy
- Kill super-hermes → verify hermes-core bypass to direct execution
- Kill council → verify high-stakes tasks fail closed (not silently pass)

---

## 9. Platform Notes — Windows 11 Home

- Docker Desktop with WSL2 backend required.
- PowerShell scripts in `scripts/` mirror every Makefile target (Chief's primary shell is pwsh 7.6).
- Volume paths use forward slashes in compose files (Docker Desktop translates).
- No symlinks inside `vendor/` — all submodules are plain git clones.
- Hindsight's vector store runs inside its container; no native Windows dependency.

---

## 10. Boundaries (prototype division rules)

- `agent-hermes` MUST NOT be referenced by any production app in `apps/healthcare/`, `apps/academic/`, `apps/community/`, or `apps/coorporate/`.
- No deployment to production GCP environments.
- No import from production divisions without Chief's explicit promotion decision.
- Real patient data and production credentials are forbidden.
- If inactive for 60+ days, flag in `.agent/PROGRESS.md` for archival review.

---

## 11. Open Items (to resolve in implementation plan)

These are deliberate handoffs to the writing-plans skill, not spec gaps:

1. **Version pinning** — discover latest stable tag for each of the 14 repos during Phase 0 of the plan.
2. **Custom skill inventory** — Chief's personal skills go in `skills/custom/`; first-draft list emerges during use, not up-front.
3. **Council trigger fine-tuning** — initial `council-triggers.yaml` uses conservative defaults; tune after first week.
4. **Self-evolution scheduler** — cron inside a dedicated container vs. host Task Scheduler — decided in implementation plan.
5. **Sentra bridge plugin** — explicitly deferred; add after Phase 1 stable.

---

## 12. Success Criteria

The design is successful when, after implementation:

1. `make up` (or `scripts/up.ps1`) brings base profile green in under 3 minutes on Chief's machine.
2. `make up-full` brings all 13 services green in under 6 minutes.
3. A hello-world task posted via Mission Control UI completes end-to-end, with the trace visible in the Workspace UI memory browser.
4. Killing any single service does not crash the stack; the UI reflects degraded state.
5. `scripts/smoke.ps1` passes on a fresh checkout after `git submodule update --init --recursive`.
6. Documentation in `docs/` lets a new operator (or future Claude session) bring the stack up without reading this spec.

---

*End of spec.*
