<!--
  GitHub Repository README — Editorial / Newspaper Style
  Repository target: abyss-monorepo
  Suggested filename: README.md
-->

<table width="100%">
<tr>
<td width="36%" align="center" valign="middle">
<img src="https://i.postimg.cc/LsLBPbDz/s-abyss.png" alt="The Abyss" width="240">
  <br />
  <sub><b>The Abyss</b> · Sentra Healthcare AI Engineering Workspace</sub>
</td>
<td width="64%" valign="middle">

# The Abyss

### AI-Native Monorepo · Healthcare AI Infrastructure · Sentra Engineering Ecosystem

<p>
  <b>Root engineering workspace for the Sentra Healthcare AI ecosystem</b><br />
  Applications · Shared engines · RAG · Clinical reasoning · Governance · Infrastructure<br />
  Reality-first monorepo inventory based on the current workspace tree
</p>

<p>
  <img src="https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-9.15.0-yellow?style=flat-square&logo=pnpm&logoColor=black" />
  <img src="https://img.shields.io/badge/typescript-5.7.x-blue?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/turborepo-2.x-black?style=flat-square&logo=turborepo&logoColor=white" />
</p>

> **Editorial thesis:** The Abyss is not a brochure repository. It is the active engineering ground for Sentra's healthcare, academic, community, corporate, platform, and prototype systems — documented as it exists now, including active, legacy, prototype, and under-retirement surfaces.

</td>
</tr>
</table>

---

## ── FRONT PAGE · WHAT THIS REPOSITORY IS

**The Abyss** is the current engineering workspace for Sentra's healthcare, academic, community, corporate, platform, and prototype products.

It contains active applications, shared AI engines, shared data and design packages, tooling, infrastructure definitions, governance rules, and LangFlow flow definitions in a single `pnpm` workspace.

<table>
<tr>
<td width="33%" valign="top">

### AI-NATIVE WORKSPACE

A monorepo for AI-native healthcare systems, clinical decision support surfaces, RAG engines, orchestration runtimes, and platform-level experimentation.

</td>
<td width="33%" valign="top">

### REALITY-FIRST INVENTORY

This README reflects the repository as it currently exists in `pnpm-workspace.yaml` and the actual folder tree. It does not hide prototype, legacy, or under-retirement surfaces.

</td>
<td width="33%" valign="top">

### GOVERNED ENGINEERING SYSTEM

The repository is controlled by explicit agent instructions, tracked handoff files, architecture rules, governance surfaces, CI workflows, and verification commands.

</td>
</tr>
</table>

The mission is simple but demanding: **turn Sentra's AI healthcare ideas into a modular, inspectable, governed, and executable engineering ecosystem.**

---

## ── SOURCE OF TRUTH · REPOSITORY AUTHORITY

<table>
<tr>
<th align="left">Authority</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><b>Workspace membership</b></td>
<td><code>pnpm-workspace.yaml</code></td>
<td>Defines actual workspace inclusion and package membership.</td>
</tr>
<tr>
<td><b>Repo rules and architecture</b></td>
<td><code>AGENTS.md</code></td>
<td>Supreme repository instruction set and architectural authority.</td>
</tr>
<tr>
<td><b>Docs index</b></td>
<td><code>docs/README.md</code></td>
<td>Primary documentation entrypoint.</td>
</tr>
<tr>
<td><b>Agent handoff</b></td>
<td><code>.agent/HANDOFF.md</code></td>
<td>Current execution handoff surface and active task context.</td>
</tr>
</table>

---

## ── EDITORIAL POSITION · WHAT THIS REPOSITORY BELIEVES

> **A healthcare AI monorepo should be powerful, but never mysterious. It must be explicit, auditable, bounded, and operationally honest.**

<table>
<tr>
<td width="50%" valign="top">

### REALITY OVER THEATRE

This README must describe the repository as it actually exists. Active, prototype, legacy, and retirement surfaces should be visible rather than hidden.

</td>
<td width="50%" valign="top">

### MODULARITY OVER ENTANGLEMENT

Applications, engines, database layers, RAG, FHIR, UI packages, agent governance, and infrastructure must remain separable, inspectable, and replaceable.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### GOVERNANCE OVER CHAOS

Agent behavior, task handoff, architecture rules, Cursor behavior, MCP setup, and documentation workflows need explicit control surfaces.

</td>
<td width="50%" valign="top">

### CLINICAL SAFETY OVER MAGIC

Healthcare AI surfaces must preserve clinical boundaries, safety gates, human review, validation, auditability, and responsible deployment discipline.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### LOCAL-FIRST WHEN POSSIBLE

The ecosystem supports local-first inference, local retrieval, Docker-based development facilities, pgvector, and controlled provider integration.

</td>
<td width="50%" valign="top">

### BUILD WITH EXIT RAMPS

Legacy infrastructure, prototype folders, and under-retirement modules must remain labeled clearly so the system can evolve without hidden coupling.

</td>
</tr>
</table>

---

## ── ALL SYSTEMS AT A GLANCE · MONOREPO PROJECT DOSSIER

<table>
<tr>
<td width="50%" valign="top">

### 01 · Healthcare Applications  
**Clinical AI Product Surfaces**

Includes IntelligenceBoard, Sentra Assist, ReferraLink, Sentra Main, primary healthcare website, and healthcare dashboard surfaces.

**Core intent:** turn clinical workflows into usable AI-supported healthcare interfaces.

</td>
<td width="50%" valign="top">

### 02 · Shared AI Engines  
**Reusable Intelligence Layer**

Includes Sentra RAG, Symphony, FHIR Engine, Vector Store, LangFlow Client, Document Ingestion, and Iskandar Gatekeeper.

**Core intent:** keep AI capability modular, reusable, and auditable.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 03 · Academic Surfaces  
**Training, Simulation, and Evaluation**

Includes academic solutions, clinical simulator, and evaluation engine workspaces.

**Core intent:** support learning, simulation, assessment, and competency-oriented AI workflows.

</td>
<td width="50%" valign="top">

### 04 · Community Surfaces  
**Memory and Multi-LLM Experiments**

Includes Classy Memory, Classy Transformer, and public/community-facing website surfaces.

**Core intent:** explore AI memory, multi-provider routing, recommendation, and community-facing intelligence.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 05 · Corporate Surface  
**dr Ferdi Iskandar Website**

Personal brand and corporate-facing website surface for founder identity, public profile, editorial pages, and Abby AI Assistant.

**Core intent:** provide public-facing founder infrastructure.

</td>
<td width="50%" valign="top">

### 06 · Platform Runtime  
**Orchestration and Portal Layer**

Includes the NestJS orchestration runtime and Sentra Portal dashboard surface.

**Core intent:** coordinate platform visibility, messaging, CQRS, Kafka, and service orchestration.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 07 · Tooling and Governance  
**Execution Control Layer**

Includes Abyss CLI, governance scripts, validation tools, reusable workflows, agent rules, and tracked handoff surfaces.

**Core intent:** make engineering execution repeatable and controlled.

</td>
<td width="50%" valign="top">

### 08 · Infrastructure and Flows  
**Development and Orchestration Substrate**

Includes Docker, Docker Compose, ArgoCD, Terraform legacy modules, LangFlow definitions, PostgreSQL, Redis, Kafka, Zookeeper, and LangFlow.

**Core intent:** support local development, integration, and flow-based orchestration.

</td>
</tr>
</table>

---

## ── THE ENGINE ROOM · CORE TECHNICAL WORK

<table>
<tr>
<td width="33%" valign="top">

### RUNTIME & TOOLCHAIN

- Node >= 22
- pnpm 9.15.0
- Turborepo 2.x
- TypeScript 5.7.x
- Next.js 15/16
- React 18/19

</td>
<td width="33%" valign="top">

### AI & RETRIEVAL

- LangFlow
- Local-first inference
- OpenAI
- Anthropic
- DeepSeek
- pgvector
- Local embeddings
- Sentra RAG

</td>
<td width="33%" valign="top">

### OPERATIONS & INFRA

- PostgreSQL via Prisma
- Kafka
- Zookeeper
- Redis
- Docker Compose
- ArgoCD
- Legacy Terraform modules
- CI and governance workflows

</td>
</tr>
</table>

---

## ── SYSTEM ARCHITECTURE DOCTRINE

```text
REPOSITORY ROOT
    │
    ▼
WORKSPACE MEMBERSHIP
    │   pnpm-workspace.yaml · package manifests · folder inventory
    ▼
APPLICATION SURFACES
    │   healthcare · academic · community · corporate · platform · prototype
    ▼
SHARED ENGINES & PACKAGES
    │   RAG · FHIR · vector store · document ingestion · database · UI · types
    ▼
GOVERNANCE & AGENT CONTROL
    │   AGENTS.md · .agent · .cursor · CLAUDE.md · workflows · validation scripts
    ▼
INFRASTRUCTURE & FLOWS
    │   Docker · PostgreSQL · Redis · Kafka · Zookeeper · LangFlow · ArgoCD
    ▼
VERIFICATION LAYER
    │   build · test · lint · typecheck · governance checks · flow tests
    ▼
CONTROLLED ENGINEERING OUTPUT
```

The architecture is intentionally conservative: **AI systems, clinical engines, RAG, FHIR, databases, UI, and infrastructure should remain modular enough to inspect, replace, verify, or retire without collapsing the monorepo.**

---

## ── REPOSITORY CONTROL SURFACES

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>AGENTS.md</code></td>
<td><code>AGENTS.md</code></td>
<td>Supreme repo instruction set and architectural authority.</td>
</tr>
<tr>
<td><code>CLAUDE.md</code></td>
<td><code>CLAUDE.md</code></td>
<td>Claude Code CLI entry surface.</td>
</tr>
<tr>
<td><code>.agent</code></td>
<td><code>.agent/</code></td>
<td>Tracked governance memory and active handoff surfaces.</td>
</tr>
<tr>
<td><code>.claude</code></td>
<td><code>.claude/</code></td>
<td>Local-only Claude Code configuration and skills support.</td>
</tr>
<tr>
<td><code>.cursor</code></td>
<td><code>.cursor/</code></td>
<td>Shared Cursor rules, tracked subagents, and IDE behavior surfaces.</td>
</tr>
<tr>
<td><code>.mcp.json</code></td>
<td><code>.mcp.json</code></td>
<td>Local-only MCP registry when present on disk.</td>
</tr>
<tr>
<td><code>mcp.json.example</code></td>
<td><code>mcp.json.example</code></td>
<td>Committed MCP template for local setup.</td>
</tr>
<tr>
<td><code>.github/workflows</code></td>
<td><code>.github/workflows/</code></td>
<td>CI, automation, docs guard, security, and reusable agent workflows.</td>
</tr>
</table>

---

## ── CURRENT STACK

<table>
<tr>
<th align="left">Layer</th>
<th align="left">Current stack</th>
</tr>
<tr>
<td>Runtime</td>
<td>Node >= 22, pnpm 9.15.0, Turborepo 2.x</td>
</tr>
<tr>
<td>Frontend</td>
<td>Next.js 15/16, React 18/19, Tailwind CSS 3/4</td>
</tr>
<tr>
<td>Backend</td>
<td>NestJS 11, Next.js route handlers, Node/TypeScript services</td>
</tr>
<tr>
<td>Database</td>
<td>PostgreSQL via Prisma in <code>packages/database</code></td>
</tr>
<tr>
<td>AI orchestration</td>
<td>LangFlow, local-first inference, OpenAI, Anthropic, DeepSeek</td>
</tr>
<tr>
<td>Retrieval</td>
<td>pgvector, local embeddings, <code>@the-abyss/sentra-rag</code>, <code>@the-abyss/vector-store</code></td>
</tr>
<tr>
<td>Messaging and cache</td>
<td>Kafka, Zookeeper, Redis</td>
</tr>
<tr>
<td>Infrastructure</td>
<td>Docker, Docker Compose, ArgoCD, Terraform legacy modules under retirement</td>
</tr>
<tr>
<td>Testing</td>
<td>Vitest, Playwright, selected legacy Jest surfaces</td>
</tr>
</table>

---

## ── APPLICATION INVENTORY · ACTIVE WORKSPACES

### Academic

<table>
<tr>
<th align="left">Workspace</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/academic-solutions</code></td>
<td><code>apps/academic/academic-solutions</code></td>
<td>Academic product UI surface built with Next.js 16 and React 19.</td>
</tr>
<tr>
<td><code>@the-abyss/clinical-simulator</code></td>
<td><code>apps/academic/clinical-simulator</code></td>
<td>Clinical case simulation and training surface.</td>
</tr>
<tr>
<td><code>@the-abyss/evaluation-engine</code></td>
<td><code>apps/academic/evaluation-engine</code></td>
<td>Competency and evaluation backend surface.</td>
</tr>
</table>

### Community

<table>
<tr>
<th align="left">Workspace</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/classy-memory</code></td>
<td><code>apps/community/classy-memory</code></td>
<td>Memory-oriented community application surface with Python and TypeScript memory engines.</td>
</tr>
<tr>
<td><code>@the-abyss/classy-transformer</code></td>
<td><code>apps/community/classy-transformer</code></td>
<td>Multi-LLM platform with provider routing, embeddings, and recommendation APIs.</td>
</tr>
<tr>
<td><code>@the-abyss/daf-website</code></td>
<td><code>apps/community/daf-website</code></td>
<td>Foundation or outreach website surface.</td>
</tr>
</table>

### Corporate

<table>
<tr>
<th align="left">Workspace</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/ferdiiskandar</code></td>
<td><code>apps/corporate/ferdiiskandar</code></td>
<td>Personal brand and corporate-facing website surface.</td>
</tr>
</table>

### Healthcare

<table>
<tr>
<th align="left">Workspace</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>aby-dashboard</code></td>
<td><code>apps/healthcare/aby-dashboard</code></td>
<td>Healthcare dashboard application surface.</td>
</tr>
<tr>
<td><code>@classy/intelligenceboard</code></td>
<td><code>apps/healthcare/intelligenceboard</code></td>
<td>Clinical AI dashboard with CDSS, telemedicine, trajectory intelligence, EMR bridge, and voice surfaces.</td>
</tr>
<tr>
<td><code>@the-abyss/puskesmas-website</code></td>
<td><code>apps/healthcare/primary-healthcare/website</code></td>
<td>Public-facing primary healthcare website surface.</td>
</tr>
<tr>
<td><code>@the-abyss/referralink</code></td>
<td><code>apps/healthcare/referralink</code></td>
<td>Referral and routing surface with diagnosis API, semantic cache, and memory-service helpers.</td>
</tr>
<tr>
<td><code>@the-abyss/sentra-assist</code></td>
<td><code>apps/healthcare/sentra-assist</code></td>
<td>Browser extension for CDSS, Iskandar diagnosis, emergency detection, and workflow automation.</td>
</tr>
<tr>
<td><code>@the-abyss/sentra-main</code></td>
<td><code>apps/healthcare/sentra-main</code></td>
<td>Sentra marketing and public main site.</td>
</tr>
</table>

Additional healthcare sub-surface: `apps/healthcare/primary-healthcare/database` holds Prisma schema and database assets for the primary healthcare domain.

### Prototype

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/edge-ai-prototype</code></td>
<td><code>apps/prototype/edge-ai-prototype</code></td>
<td>Edge AI experimentation workspace.</td>
</tr>
<tr>
<td><code>ghost-protocol</code></td>
<td><code>apps/prototype/ghost-protocol</code></td>
<td>Prototype or specification surface without its own package manifest.</td>
</tr>
<tr>
<td><code>ghost-protocols</code></td>
<td><code>apps/prototype/ghost-protocols</code></td>
<td>Prototype or specification surface without its own package manifest.</td>
</tr>
</table>

### Platform

<table>
<tr>
<th align="left">Workspace</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/orchestrator</code></td>
<td><code>platform/orchestrator</code></td>
<td>NestJS 11 orchestration runtime with CQRS, Kafka, and Socket.IO.</td>
</tr>
<tr>
<td><code>sentra-portal</code></td>
<td><code>platform/sentra-portal</code></td>
<td>Portal and dashboard surface for platform or clinical visibility.</td>
</tr>
</table>

---

## ── SHARED ENGINES AND PACKAGES

<table>
<tr>
<th align="left">Package</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/clinical-references</code></td>
<td><code>packages/clinical-references</code></td>
<td>Shared clinical reference types and structured clinical data surfaces.</td>
</tr>
<tr>
<td><code>@the-abyss/config-eslint</code></td>
<td><code>packages/config-eslint</code></td>
<td>Shared ESLint flat-config presets and repo lint boundaries.</td>
</tr>
<tr>
<td><code>@the-abyss/config-typescript</code></td>
<td><code>packages/config-typescript</code></td>
<td>Shared TypeScript configuration presets across workspaces.</td>
</tr>
<tr>
<td><code>@the-abyss/database</code></td>
<td><code>packages/database</code></td>
<td>Prisma client, schema, and shared database access layer.</td>
</tr>
<tr>
<td><code>@the-abyss/design-token</code></td>
<td><code>packages/design-token</code></td>
<td>Sentra design tokens for color, borders, typography, and spacing.</td>
</tr>
<tr>
<td><code>@the-abyss/document-ingestion</code></td>
<td><code>packages/document-ingestion</code></td>
<td>Canonical document ingestion surface with parsing, OCR-quality reporting, normalization, and source hashing.</td>
</tr>
<tr>
<td><code>@the-abyss/fhir-engine</code></td>
<td><code>packages/fhir-engine</code></td>
<td>FHIR validation, normalization, bundle projection, and interoperability engine.</td>
</tr>
<tr>
<td><code>@the-abyss/integration-bridge</code></td>
<td><code>packages/integration-bridge</code></td>
<td>Bridge layer for external integrations such as Notion and Linear.</td>
</tr>
<tr>
<td><code>@the-abyss/iskandar-gatekeeper</code></td>
<td><code>packages/iskandar-gatekeeper</code></td>
<td>GO-gate and access-control enforcement surface.</td>
</tr>
<tr>
<td><code>@the-abyss/langflow-client</code></td>
<td><code>packages/langflow-client</code></td>
<td>TypeScript client for LangFlow API integration and flow execution.</td>
</tr>
<tr>
<td><code>@the-abyss/literature-harvester</code></td>
<td><code>packages/literature-harvester</code></td>
<td>Open-access literature harvesting and collection tooling.</td>
</tr>
<tr>
<td><code>@the-abyss/sentra-rag</code></td>
<td><code>packages/sentra-rag</code></td>
<td>Sentra RAG engine for local-first medical knowledge retrieval, ingestion, evaluation, and pgvector-backed evidence lookup.</td>
</tr>
<tr>
<td><code>@the-abyss/ui</code></td>
<td><code>packages/sentra-ui</code></td>
<td>Shared Sentra UI component layer.</td>
</tr>
<tr>
<td><code>@the-abyss/shared-types</code></td>
<td><code>packages/shared-types</code></td>
<td>Cross-workspace TypeScript contracts and shared domain types.</td>
</tr>
<tr>
<td><code>@the-abyss/symphony</code></td>
<td><code>packages/symphony</code></td>
<td>Clinical reasoning and orchestration layer with FHIR and CDS Hooks interoperability.</td>
</tr>
<tr>
<td><code>@the-abyss/vector-store</code></td>
<td><code>packages/vector-store</code></td>
<td>Embedding-provider, ingest, and vector-store support utilities for retrieval workflows.</td>
</tr>
</table>

---

## ── AI CAPABILITY MAP

<table>
<tr>
<td width="50%" valign="top">

### CORE ENGINES

- `@the-abyss/sentra-rag` — local-first RAG runtime for ingest, chunking, embeddings, pgvector writes, retrieval, registry tracking, supersession, and evaluation artifacts.
- `@the-abyss/symphony` — clinical reasoning engine for assessment, pattern processing, confidence scoring, trajectory logic, safety gates, FHIR, and CDS Hooks export.
- `@the-abyss/vector-store` — retrieval-side embedding and vector helper surface.
- `@the-abyss/document-ingestion` — canonical document front door with parser providers, OCR quality checks, markdown normalization, and source hashing.
- `@the-abyss/langflow-client` — TypeScript LangFlow API client.
- `@the-abyss/fhir-engine` — FHIR bundle generation, transformation, validation hooks, and version strategy.

</td>
<td width="50%" valign="top">

### HEALTHCARE AI APPLICATIONS

- `@classy/intelligenceboard` — CDSS routes, consult APIs, telemedicine workflows, Audrey voice surfaces, trajectory analytics, EMR bridge, clinical reports, and observability hooks.
- `@the-abyss/sentra-assist` — Iskandar diagnosis engine, emergency detector, ICD and RAG support, platform API clients, sidepanel CDSS widgets, and browser-assisted workflow automation.
- `@the-abyss/referralink` — referral routing, diagnosis endpoint, embedding-driven semantic cache, and memory-service helpers.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### COMMUNITY AI SURFACES

- `@the-abyss/classy-transformer` — multi-provider LLM workspace with provider registry, embeddings, transform engine, and recommendation API surfaces.
- `@the-abyss/classy-memory` — community memory runtime with TypeScript and Python surfaces for extraction, consolidation, scheduling, and session logging.

</td>
<td width="50%" valign="top">

### PROTOTYPE AND ACADEMIC AI SURFACES

- `apps/academic/clinical-simulator` — AI-assisted clinical-case training.
- `apps/academic/evaluation-engine` — competency and assessment workflows.
- `apps/prototype/edge-ai-prototype` — Edge-AI experiments.
- `apps/prototype/ghost-protocols` — experimental AI protocol specifications.

</td>
</tr>
</table>

---

## ── TOOLING AND OPERATIONAL FACILITIES

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>@the-abyss/cli</code></td>
<td><code>tooling/abyss-cli</code></td>
<td>Monorepo CLI for task init, GO flow, status, scaffolding, and flow sync.</td>
</tr>
<tr>
<td><code>governance</code></td>
<td><code>tooling/governance</code></td>
<td>Compliance standards, checklists, troubleshooting, templates, and <code>validate.ps1</code>.</td>
</tr>
<tr>
<td><code>kilo</code></td>
<td><code>tooling/kilo</code></td>
<td>Supporting tooling surface currently kept inside the monorepo.</td>
</tr>
<tr>
<td><code>classy-librarian-console</code></td>
<td><code>tooling/librarian-desktop</code></td>
<td>Electron desktop console and literature worker surface.</td>
</tr>
<tr>
<td><code>scripts</code></td>
<td><code>tooling/scripts</code></td>
<td>Supporting scripts for governance checks, RAG tasks, and maintenance work.</td>
</tr>
</table>

---

## ── GOVERNANCE SURFACES

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Purpose</th>
</tr>
<tr>
<td><code>AGENTS.md</code></td>
<td>Repository-wide single source of truth for agent behavior and architecture.</td>
</tr>
<tr>
<td><code>.agent/CONTEXT.md</code></td>
<td>Architecture and runtime context.</td>
</tr>
<tr>
<td><code>.agent/PROGRESS.md</code></td>
<td>Current progress state.</td>
</tr>
<tr>
<td><code>.agent/HANDOFF.md</code></td>
<td>Active execution handoff and task plan.</td>
</tr>
<tr>
<td><code>.agent/DECISIONS.md</code></td>
<td>Architectural decisions and superseding directives.</td>
</tr>
<tr>
<td><code>.agent/LESSONS.md</code></td>
<td>Durable mistakes-to-avoid memory.</td>
</tr>
<tr>
<td><code>.cursor/rules/</code></td>
<td>Shared Cursor behavior rules that are intentionally tracked.</td>
</tr>
</table>

Local-only note: `.agent/sessions/` is a local working surface and is not part of pushed repository history.

---

## ── INFRASTRUCTURE AND DEPLOYMENT FACILITIES

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>argocd</code></td>
<td><code>infrastructure/argocd</code></td>
<td>GitOps application manifests.</td>
</tr>
<tr>
<td><code>docker</code></td>
<td><code>infrastructure/docker</code></td>
<td>Shared Dockerfiles and <code>docker-compose.yml</code> for local stack orchestration.</td>
</tr>
<tr>
<td><code>terraform</code></td>
<td><code>infrastructure/terraform</code></td>
<td>Legacy infrastructure-as-code modules under retirement.</td>
</tr>
</table>

### Local Stack Facilities

The current infrastructure folder explicitly supports:

- PostgreSQL
- Redis
- LangFlow
- Kafka
- Zookeeper
- Orchestrator
- Docker-based service bring-up for development and integration work

---

## ── FLOW DEFINITIONS

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>academic</code></td>
<td><code>flows/definitions/academic</code></td>
<td>LangFlow definitions for academic workflows.</td>
</tr>
<tr>
<td><code>healthcare</code></td>
<td><code>flows/definitions/healthcare</code></td>
<td>LangFlow definitions for healthcare workflows.</td>
</tr>
<tr>
<td><code>platform</code></td>
<td><code>flows/definitions/platform</code></td>
<td>LangFlow definitions for platform workflows.</td>
</tr>
</table>

---

## ── DOCUMENTATION SURFACES

<table>
<tr>
<th align="left">Surface</th>
<th align="left">Path</th>
<th align="left">Role</th>
</tr>
<tr>
<td><code>adr</code></td>
<td><code>docs/adr</code></td>
<td>Architectural decision records.</td>
</tr>
<tr>
<td><code>archive</code></td>
<td><code>docs/archive</code></td>
<td>Historical docs that remain preserved but are not primary active docs.</td>
</tr>
<tr>
<td><code>blueprint</code></td>
<td><code>docs/blueprint</code></td>
<td>Blueprint and structure guidance.</td>
</tr>
<tr>
<td><code>guides</code></td>
<td><code>docs/guides</code></td>
<td>Active guides and onboarding references.</td>
</tr>
<tr>
<td><code>specs</code></td>
<td><code>docs/specs</code></td>
<td>Current specifications and system-level contracts.</td>
</tr>
<tr>
<td><code>superpowers</code></td>
<td><code>docs/superpowers</code></td>
<td>Supplemental execution artifacts and planning surfaces retained in the repo.</td>
</tr>
<tr>
<td><code>templates</code></td>
<td><code>docs/templates</code></td>
<td>Reusable documentation templates.</td>
</tr>
</table>

Primary docs entrypoint: [`docs/README.md`](docs/README.md)

---

## ── THE ABYSS OPERATING STANDARD

```text
No architecture without source of truth.
No AI engine without boundaries.
No clinical surface without safety gates.
No shared package without clean ownership.
No workflow automation without rollback.
No repository change without verification.
No legacy surface without clear labeling.
```

<table>
<tr>
<th align="left">Question</th>
<th align="left">Required answer</th>
</tr>
<tr>
<td><b>What workspace owns this surface?</b></td>
<td>Application, package, platform, tooling, infrastructure, docs, or prototype ownership must be clear.</td>
</tr>
<tr>
<td><b>What boundary must not be crossed?</b></td>
<td>Clinical, data, package, dependency, provider, or infrastructure boundary must be explicit.</td>
</tr>
<tr>
<td><b>What is the source of truth?</b></td>
<td>Use <code>pnpm-workspace.yaml</code>, <code>AGENTS.md</code>, package manifests, and current folder state.</td>
</tr>
<tr>
<td><b>What can fail?</b></td>
<td>Build, tests, typecheck, package boundaries, AI provider calls, local infra, or hidden coupling.</td>
</tr>
<tr>
<td><b>How is it verified?</b></td>
<td>Run build, lint, test, typecheck, governance checks, and surface-specific validation.</td>
</tr>
</table>

---

## ── DEVELOPMENT COMMANDS

### Root

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:ui
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm graph
pnpm flows:test
```

### Database

```bash
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

### Governance

```bash
pnpm governance:agents-check
powershell -ExecutionPolicy Bypass -File tooling/governance/validate.ps1 -path .
```

### Abyss CLI

```bash
pnpm abyss init-task "Describe the task"
pnpm abyss go .agent/sessions/YYYY-MM-DD --by "Chief"
pnpm abyss sync-flow path/to/flow.json
pnpm abyss create app my-new-app
pnpm abyss status
```

---

## ── QUICK START

```bash
git clone https://github.com/drclassy/abyss-monorepo.git
cd abyss-monorepo
pnpm install
pnpm dev
```

For local infrastructure:

```bash
cd infrastructure/docker
docker-compose up -d
```

---

## ── NOTES ON ACCURACY

- The authoritative workspace membership comes from [`pnpm-workspace.yaml`](pnpm-workspace.yaml), not from historical wording in older docs.
- `.claude/` is a local-only configuration surface and is listed only so contributors understand its role when it exists on disk.
- Some package names and folder names differ slightly; for example, `platform/sentra-portal` currently carries a legacy package name in its `package.json`.
- This README uses folder surfaces as the primary inventory anchor where package naming is inconsistent.
- `terraform` remains present in the tree but is treated as a legacy surface under retirement.

---

## ── LICENSE

The root package manifest currently declares this repository as **UNLICENSED**.

See:

- [`package.json`](package.json)
- [`LICENSE`](LICENSE)

---

<p align="center">
  <b>Architected and built by dr Classy.</b><br />
  <sub>The Abyss · Sentra Healthcare AI engineering workspace · Reality-first monorepo doctrine.</sub><br />
  <sub><b>Version:</b> 0.0.1 · <b>Last updated:</b> 2026-04-30</sub>
</p>

