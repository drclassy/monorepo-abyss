# Academic Domain Steering

**Domain:** Education and Clinical Simulation
**Compliance Level:** STANDARD
**Revision:** 2026.04.06

## Domain Overview

The Academic domain focuses on providing high-fidelity medical education tools and clinical evaluation engines to bridge the gap between theory and practice.

### Applications
- `clinical-simulator`: High-fidelity medical training platform.
- `evaluation-engine`: Automated clinical pathway assessment.

## Technical Standards

### Framework Requirements
- Primary: Next.js (App Router), TypeScript.
- State Management: Zustand or React Context.
- Styling: Tailwind CSS (consistent with the Abyss Design System).

### Import Boundaries
- Domain logic must remain isolated within the application.
- Cross-domain data fetching must occur via the @the-abyss/database or public APIs.
- Shared UI components must be imported from @the-abyss/ui.

## Testing Strategy

| Test Type | Target Coverage | Requirement |
|-----------|-----------------|-------------|
| Unit Tests | 75% | Required |
| Simulation Logic | 100% | Required |
| Integration | Critical Flows | Required |

---
© 2026 Sentra Healthcare AI
