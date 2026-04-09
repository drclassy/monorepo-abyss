# Corporate Domain Steering

**Domain:** Core Platform and Brand Identity
**Compliance Level:** STRICT (Architectural Integrity)
**Revision:** 2026.04.06

## Domain Overview

The Corporate domain maintains the structural integrity of the Abyss Monorepo and the external representation of the Sentra brand.

### Applications
- `sentra-main`: Core orchestration platform and shared resource hub.
- `sentra-portal`: External-facing marketing and partnership gateway.
- `ferdiiskandar`: Executive leadership and vision profile.

## Architectural Governance

### Core Alignment
- `sentra-main` serves as the single source of truth for shared UI tokens and orchestration logic.
- Updates to core packages must be verified against all satellite applications.

### Design Philosophy
- Aesthetic: Deep Onyx (Logical, Functional, Premium).
- No sub-standard visual assets or "kindergarten" design elements.

## Technical Standards

### Stack
- Next.js 16 (Turbopack), React 19, Tailwind CSS 4.
- High-performance animations via GSAP and Framer Motion.

### Mandatory to read native folder
Claude native folder "C:\Users\claud\.claude\CLAUDE.md"
Codex native folder "C:\Users\claud\.codex\AGENTS.md"
Rocode native folder "C:\Users\claud\roocode\AGENT.md"
Jen Gemini native folder "C:\Users\claud\.gemini\GEMINI.md"
Github Copilot native folder "C:\Users\claud\.copilot\AGENTS..md"
Kilocode native folder "C:\Users\claud\.kilo\AGENTS.md"


### Testing Strategy

| Test Type | Target Coverage | Requirement |
|-----------|-----------------|-------------|
| Performance | Lighthouse 90+ | Mandatory |
| Build Tests | Turbopack | Required |
| Integration | Core APIs | Required |

---
© 2026 Sentra Healthcare AI
