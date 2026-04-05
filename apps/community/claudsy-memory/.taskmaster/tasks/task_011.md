# Task ID: 11

**Title:** Build DeveloperSection with pinned text and stacking cards

**Status:** pending

**Dependencies:** 4

**Priority:** medium

**Description:** Create the 'For Developers' section with left-pinned column (heading + description + CTA) and right column with 3 numbered stacking cards that pin on scroll via GSAP ScrollTrigger.

**Details:**

1. src/components/landing/DeveloperSection.tsx: grid grid-cols-12 section
2. Left column (col-span-5): pinned on scroll via ScrollTrigger.create pin. 'For Developers' label, 'Build With Persistent Memory' heading (h4 uppercase), description, WQFButton 'Get started'
3. Right column (col-span-6, offset 1): 3 stacking cards
4. Card 1 (electric-teal): '01' + 'Install in minutes' + description
5. Card 2 (infrared): '02' + 'Multi-agent ready' + description
6. Card 3 (off-white): '03' + 'Self-healing' + description
7. Each card: aspect-[1.3/1], rounded-[20px], flex column justify-between, icon in top-right
8. GSAP stacking: each card pinned at increasing top offsets (80px + 80*index*0.25)
9. Mobile: no pin, clip-path reveal per card on scroll

**Test Strategy:**

Verify left column pins while scrolling through cards (desktop). Cards stack with increasing top offset. Mobile shows sequential card reveals. Colors and typography match reference.
