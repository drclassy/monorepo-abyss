# Next Session Handoff

- Date: `2026-05-05`
- Project: `ferdiiskandar` personal site
- Status: `stable baseline after /about release + homepage repositioning + hero chat refinement`

## Current Architecture

The original route-ready plan remains:

- `/` = founder landing page
- `/about` = live and implemented
- `/systems` = next priority -? clinical trajectory,RME autofill, CDSS, Symphony, Hospital Orchestrator, Personal Intelligence Assistant, transformer-Engine
- `/notes` = later
- `/contact` = later

`/drclassy` is now a valid future track, but it is not part of the original four-route expansion order.

## What Is Already Done

### Foundation

- Runtime baseline is healthy.
- Repo has passed install, lint, typecheck, test, and build in recent verification cycles.
- Next.js was upgraded and `npm audit` was cleaned earlier in the session.

### Homepage

- Homepage has been repositioned from a healthcare-only impression into a cross-sector intelligence systems founder framing.
- Visual language remains editorial, dossier-like, and rooted in the homepage `Section 03` sensibility.
- Hero headline is now:
  - `Building intelligence systems for high-responsibility sectors.`
- Hero thesis is already broadened to:
  - healthcare
  - education
  - workforce
  - digital experience

### About

- `/about` exists as a real route.
- It uses the dossier/newspaper editorial language requested by Chief.
- It is positioned as `professional positioning led by manifesto`, not biography-heavy.
- Executive profile copy, qualifications, affiliations, authority signals, and systems bridge are already integrated.

### Contact and Public Surface

- Public links are already present:
  - LinkedIn
  - X
  - Medium
  - GitHub
  - Kaggle
  - email
- Footer signature plate is already integrated from `public/sign.png`.

### Hero Chat Surface

- The right-side hero chat column is already integrated below the quote.
- It is wired to `/api/chat`, not just static decoration.
- Current quote:
  - `“Sistem terbaik adalah yang bekerja dalam diam.”`
- Current internal chat label:
  - `Meet Abby`
- The old long formal welcome message has been removed from both UI preload and backend guidance.
- Abby now uses a lightweight typed intro line instead of a full opening bubble.

## Design Decisions That Must Be Preserved

- Always keep design first-class.
- Visual companion is pre-approved.
- Preferred language is editorial / newspaper / dossier, not SaaS or component-library generic.
- Strongest reference remains homepage `Section 03`.
- Avoid small rounded feature-card grids unless explicitly requested.
- Preserve the quiet, institutional, publication-grade feel.

## Language Rule

- Use `Bahasa Indonesia profesional` for body copy, thesis, supporting copy, and editorial explanation.
- Keep `English` for titles, section names, and selected terms where appropriate.

## Important Identity / Positioning Direction

The site should no longer read as a medical-only website.

It should read as:

- founder
- systems architect
- institutional operator
- builder of intelligence systems across:
  - healthcare
  - education
  - workforce
  - digital experience

Healthcare remains the deepest authority anchor, but not the only capability frame.

## Current Next Priority

The next best phase is:

- `Design Section 1 for /systems`

Why:

- `/about` already explains who Chief is.
- `/systems` should now prove what is being built.
- It is the most natural continuation of the homepage repositioning already completed.

Recommended order after that:

1. `/systems`
2. `/notes`
3. `/contact`
4. `/drclassy`

## Suggested Opening Prompt For Next Session

Use this to resume cleanly:

`Lanjut ke Design Section 1 untuk /systems. Tetap design-first, editorial dossier, dan pastikan systems page memetakan capability lintas healthcare, education, workforce, dan digital experience tanpa terasa seperti agency portfolio.`

## Files Most Relevant To Resume

- [components/Hero.tsx](/v:/class-sentra/class-prototype/ferdiiskandar/components/Hero.tsx)
- [components/HeroChatColumn.tsx](/v:/class-sentra/class-prototype/ferdiiskandar/components/HeroChatColumn.tsx)
- [components/ui/ai-prompt-box.tsx](/v:/class-sentra/class-prototype/ferdiiskandar/components/ui/ai-prompt-box.tsx)
- [components/AboutPage.tsx](/v:/class-sentra/class-prototype/ferdiiskandar/components/AboutPage.tsx)
- [lib/site-content.ts](/v:/class-sentra/class-prototype/ferdiiskandar/lib/site-content.ts)
- [lib/about-content.ts](/v:/class-sentra/class-prototype/ferdiiskandar/lib/about-content.ts)
- [app/globals.css](/v:/class-sentra/class-prototype/ferdiiskandar/app/globals.css)
- [docs/specs/2026-05-05-founder-profile-stabilization-design.md](/v:/sentra-artificial-intelligence/abyss-monorepo/apps/corporate/ferdiiskandar/docs/specs/2026-05-05-founder-profile-stabilization-design.md)
- [docs/specs/2026-05-05-about-page-design.md](/v:/sentra-artificial-intelligence/abyss-monorepo/apps/corporate/ferdiiskandar/docs/specs/2026-05-05-about-page-design.md)
- [docs/specs/2026-05-05-content-repositioning-design.md](/v:/sentra-artificial-intelligence/abyss-monorepo/apps/corporate/ferdiiskandar/docs/specs/2026-05-05-content-repositioning-design.md)

## Working Tree Note

Current untracked items seen during archived session-note creation:

- `.continue/`
- `.next-dev.err.log`
- `.next-dev.out.log`
- `.vscode/`

They were not modified as part of this archived note.
