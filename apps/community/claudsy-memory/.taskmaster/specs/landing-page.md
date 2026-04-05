# Spec: Claudesy Memory Engine — Landing Page (WQF-Inspired)

**Date:** 2026-03-26
**Target:** app/claudsy-memory
**Reference:** `site-concept/` — WorldQuant Foundry website (pixel-faithful adaptation)
**Stack:** Next.js 16.2.1, React 19, TypeScript, Tailwind CSS 4, GSAP, Three.js, Swiper

## Overview

Build a premium, multi-section landing page for Claudesy Memory Engine faithfully adapted from the WorldQuant Foundry design reference in `site-concept/`. The site features GSAP ScrollTrigger animations, Three.js hero background, Swiper carousel, auto-hiding header, corner accent SVG patterns, and alternating dark/light sections. All WQF content is remapped to Sentra/Claudesy Memory branding while preserving identical visual language, interactions, and animation patterns.

## Design Reference (`site-concept/`)

### Color Palette (from WQF CSS)
| Token | WQF Name | Hex | Usage |
|---|---|---|---|
| rich-carbon | `bg-rich-carbon` | `#111111` | Primary dark bg |
| neural-fog | `text-neural-fog` | `#c8c8c8` (approx) | Light section bg, body text |
| off-white | `text-off-white` | `#f0f0f0` | Headings, bright text |
| electric-teal | `bg-electric-teal` | `#00c9a7` (approx) | Accent cards |
| infrared | `bg-infrared` | `#ff4d4d` (approx) | Accent cards |
| urban-smoke | `bg-urban-smoke` | `#1a1a1a` | Header scrolled bg |

### Typography
- **Headings:** Roc Grotesk Medium — ALL UPPERCASE
- **Body mono:** Azeret Mono — section labels, buttons, small text
- **Scale:** `h1-h7`, `p1-p3`, `p1-mono`, `p2-mono`, `p3-mono`
- **Font files:** `site-concept/assets/roc-grotesk-*.woff2`, `azeret-mono-regular.otf`

### Signature Patterns
1. **Corner Accents** — SVG L-brackets at corners of buttons/cards (4 corners)
2. **Button Hover** — Dot slides in + text slides horizontally + duplicate span slides vertically
3. **Text Hover** — Duplicate span technique: original slides up, clone slides in from below
4. **Section Reveals** — GSAP clip-path `inset(0 0 100% 0)` → `inset(0)` on scroll
5. **Split Text Reveal** — Character-by-character reveal animation
6. **Stacking Cards** — ScrollTrigger pinned cards that overlap on scroll
7. **Header Auto-hide** — Shows on scroll up, hides on scroll down past 1 viewport

### Libraries Required (new dependencies)
- `gsap` — ScrollSmoother, ScrollTrigger, timeline animations
- `three` — 3D canvas background for hero
- `swiper` — Portfolio/features carousel

## Content Mapping (WQF → Sentra)

### Navigation
| WQF | Sentra |
|---|---|
| WHY WQF | HOW IT WORKS |
| PORTFOLIO | CAPABILITIES |
| TEAM | TECHNOLOGY |
| INSIGHTS | UPDATES |
| Contact | OPEN DASHBOARD |

### Sections

#### 1. Hero (Full-viewport)
- **WQF:** "Forging Companies That Pull The Future Forward"
- **Sentra:** "Persistent Memory For AI Agents That Never Forget"
- Three.js canvas background (particle/neural-net style)
- Bottom bar: CTA button "Open Dashboard" + tagline description
- Logo at header (Sentra logo from `public/icon.png`)

#### 2. Ethos / Vision (Light section — `bg-neural-fog text-rich-carbon`)
- **WQF:** "Vision matters. Velocity wins." + 4 expanding cards
- **Sentra:** "Intelligence Persists. Context Compounds." + 4 expanding feature cards:
  - **Semantic Memory** — Factual knowledge extraction and storage
  - **Episodic Memory** — Session-based experience recall
  - **Procedural Memory** — Learned workflows and patterns
  - **Multi-Agent Memory** — Independent memory per agent with shared consolidation
- Rounded top corners (`rounded-t-[20px]`), clip-path reveal

#### 3. Focus (Centered text, full-viewport)
- **WQF:** "Exponential technologies. Trillion-dollar markets."
- **Sentra:** "Four Memory Categories. One Unified Engine."
- Subtext explaining the extract → consolidate → recall pipeline

#### 4. Industries / Capabilities (Interactive list with image reveal)
- **WQF:** Industry list (AI, Biotech, Robotics…)
- **Sentra:** Capability list with hover-reveal:
  - **Extract** — AI reads session logs, extracts structured facts
  - **Consolidate** — Deduplication, merge, priority scoring
  - **Health Monitor** — Daemon-driven continuous health checks
  - **Search & Recall** — Semantic + keyword fact retrieval
  - **Curation** — Manual fact editing, deletion, categorization
  - **Boot Context** — Generates startup context for agent sessions

#### 5. Portfolio / Showcase (Swiper carousel)
- **WQF:** Company logos in centered carousel
- **Sentra:** Showcase of integrated tools/agents using the memory engine:
  - Claude, Codex, Cursor, Jules, Copilot (agents)
- Each slide: agent icon/logo + name + hover color

#### 6. Leadership / Technology (Photo grid → Architecture visual)
- **WQF:** 3-column leadership photos with expandable bios
- **Sentra:** Architecture overview — Python engine + Next.js dashboard + Ollama
- Or: Team behind Sentra (Dr. Ferdi + Claudesy AI)

#### 7. For Investors → For Developers (Stacking cards, left pinned)
- **WQF:** "Invest in tomorrow's category creators" + 3 numbered cards
- **Sentra:** "Build With Persistent Memory" + 3 cards:
  - 01: "Install in minutes" (pip install, npm dev)
  - 02: "Multi-agent ready" (each agent gets isolated memory)
  - 03: "Self-healing" (daemon monitors + auto-consolidates)

#### 8. For Founders → For AI Teams (Stacking cards, reversed)
- **WQF:** "Move at the speed of breakthrough" + 3 cards
- **Sentra:** "Scale Your Agent Fleet" + 3 cards:
  - 01: "Session continuity" (never lose context between sessions)
  - 02: "Fact curation" (edit, merge, archive knowledge)
  - 03: "Health dashboard" (real-time engine monitoring)

#### 9. Newsletter / CTA
- Simple "Get started" CTA section linking to dashboard

#### 10. Footer
- **WQF:** Logo emblem + legal links + social
- **Sentra:** Sentra brain logo emblem + "Built by Claudesy" + version

## Technical Approach

### Routing
- `/` → Landing page (scrollable)
- `/dashboard` → Existing Dashboard (overflow:hidden preserved via layout)
- Sub-pages (about, portfolio, etc.) — out of scope for v1, single-page scroll

### New Dependencies
```bash
npm install gsap three swiper
```

### Font Setup
- Copy `roc-grotesk-*.woff2` and `azeret-mono-regular.otf` from `site-concept/assets/` to `public/fonts/`
- Declare `@font-face` in `globals.css`
- Map to Tailwind via `@theme` — `--font-roc-grotesk`, `--font-azeret-mono`

### Component Structure
```
src/components/landing/
├── Header.tsx             # Fixed header, auto-hide, logo compact
├── HeroSection.tsx        # Full-vh, Three.js canvas, hero title, bottom CTA
├── EthosSection.tsx       # Light bg, vision text, 4 expanding cards
├── FocusSection.tsx       # Centered headline + description
├── CapabilitiesSection.tsx # Interactive list with image/icon reveal
├── ShowcaseSection.tsx    # Swiper carousel of agents/tools
├── ArchitectureSection.tsx # Tech overview (replaces Leadership)
├── DeveloperSection.tsx   # Stacking cards — For Developers
├── TeamsSection.tsx       # Stacking cards — For AI Teams
├── CTASection.tsx         # Final CTA
├── Footer.tsx             # Logo emblem + links
└── ui/
    ├── CornerAccent.tsx   # Reusable SVG corner bracket component
    ├── WQFButton.tsx      # Button with dot + text slide + corners
    └── SplitText.tsx      # Character-reveal animation wrapper
```

### Animation Strategy
- **GSAP ScrollTrigger** for all scroll-based animations (replaces Alpine.js x-data logic)
- **useGSAP hook** pattern: `useEffect` + `gsap.context()` for cleanup
- **Three.js** via raw canvas ref (lightweight, no React Three Fiber needed)
- **Swiper React** for carousel section
- All animations respect `prefers-reduced-motion`

### CSS Architecture
- Extend `globals.css` with WQF color tokens and typography scale
- Map WQF Tailwind classes to custom theme: `rich-carbon`, `neural-fog`, `off-white`, etc.
- Corner accent positioning via absolute + CSS (matching WQF `corner-accent` class)

## Files Involved

### New Files
- `src/app/dashboard/page.tsx` — Dashboard route
- `src/app/dashboard/layout.tsx` — Dashboard layout (overflow:hidden)
- `src/components/landing/*.tsx` — ~13 component files
- `public/fonts/roc-grotesk-medium.woff2`
- `public/fonts/roc-grotesk-regular.woff2`
- `public/fonts/azeret-mono-regular.otf`

### Modified Files
- `src/app/page.tsx` — Replace Dashboard with Landing
- `src/app/layout.tsx` — Update metadata
- `src/app/globals.css` — Add WQF tokens, typography, corner-accent styles, landing overrides
- `package.json` — Add gsap, three, swiper deps
- `next.config.ts` — May need transpilePackages for gsap/three

## Acceptance Criteria

- [ ] Landing page at `/` faithfully reproduces WQF visual language and interactions
- [ ] Dashboard at `/dashboard` fully functional with zero regressions
- [ ] Header auto-hides on scroll down, reveals on scroll up, compacts with rounded pill
- [ ] Hero section has Three.js particle/neural-net canvas background
- [ ] Ethos section has light bg with 4 expanding cards on hover (desktop) / stacked (mobile)
- [ ] Capabilities list shows interactive hover-reveal pattern
- [ ] Swiper carousel for showcase section, centered active slide
- [ ] Stacking cards with GSAP ScrollTrigger pin for developer/teams sections
- [ ] Corner accent SVGs on all interactive elements (buttons, cards, nav items)
- [ ] Button hover: dot slides in + text shifts + duplicate text slides vertically
- [ ] Roc Grotesk + Azeret Mono fonts load correctly
- [ ] All text content is Sentra/Claudesy Memory branded (zero WQF references)
- [ ] Responsive: mobile (375px+), tablet (768px+), desktop (1024px+)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Smooth scroll behavior via GSAP ScrollSmoother

## Out of Scope (v1)

- Sub-pages (/about, /portfolio, /insights) — single-page scroll only
- Contact form / modal — replaced with "Open Dashboard" CTA
- Real images/photos — use SVG icons and abstract visuals
- Blog / CMS integration
- Authentication
- SEO beyond basic meta
- i18n
