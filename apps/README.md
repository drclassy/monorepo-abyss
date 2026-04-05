# Abyss Monorepo Application Layer

This directory serves as the orchestration layer for the Abyss Monorepo, housing all service-oriented applications across healthcare, corporate, and academic domains.

## Domain Structure

1. **Healthcare Domain (Strict Compliance)**
   Clinical decision support and patient management systems.
   - `primary-healthcare`: Intelligence dashboard for community health centers.
   - `sentra-assist`: Real-time decision support browser extension.
   - `referralink`: AI-driven medical referral orchestration.

2. **Corporate Domain (Core Identity)**
   The backbone of Sentra Healthcare AI.
   - `sentra-main`: Core platform gateway and orchestration engine.
   - `sentra-portal`: Public marketing and partner entrance.
   - `ferdiiskandar`: Professional vision and personal brand profile.

3. **Community Domain (Innovation)**
   Tools and experimental applications for the AI ecosystem.
   - `claudsy-memory`: Long-term AI memory persistence engine.
   - `claudesy-transformer`: Prompt engineering and optimization platform.
   - `daf-website`: Premium medical practice digital presence.

4. **Academic Domain (Education)**
   Medical education and clinical simulation engines.
   - `clinical-simulator`: Next-generation medical training platform.
   - `evaluation-engine`: Clinical pathway assessment AI.

5. **Orchestrator Domain (Gateway)**
   Central gateway for all AI flow executions.

6. **Prototype Domain (Incubator)**
   Research and development sandbox for emerging technologies.

## Technology Stack

- **Frontend:** Next.js (15/16), React 19, TypeScript.
- **Styling:** Tailwind CSS 4, Framer Motion, GSAP.
- **Backend:** Node.js, Python, Prisma (PostgreSQL), SQLite.
- **Build System:** Turborepo, pnpm.

## Governance

All applications must adhere to the domain-specific steering guidelines defined in their respective `AGENTS.md` files.

---
© 2026 Sentra Healthcare AI
