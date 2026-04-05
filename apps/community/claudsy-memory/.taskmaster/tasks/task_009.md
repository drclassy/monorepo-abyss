# Task ID: 9

**Title:** Build CapabilitiesSection with interactive list and hover reveal

**Status:** pending

**Dependencies:** 4

**Priority:** high

**Description:** Create the interactive capability list matching WQF industries section: vertical list of capabilities where hovering reveals an icon/description panel. Active item expands while others contract.

**Details:**

1. src/components/landing/CapabilitiesSection.tsx: min-h-dvh section
2. List items: Extract, Consolidate, Health Monitor, Search & Recall, Curation, Boot Context
3. Each item: large h4 text (uppercase, Roc Grotesk), data-active attribute
4. Hover behavior: React state for activeLink. On hover, set active. Track dimensions via refs for animated indicator
5. Active item: show description panel alongside, title slides up to reveal expanded content
6. Desktop: side-by-side list + reveal panel. Mobile: accordion style, tap to expand
7. GSAP entrance animation: opacity:0, y:80 on scroll trigger
8. Animated dimension tracker (width, height, offset) using requestAnimationFrame like WQF pattern

**Test Strategy:**

Hover each item and verify panel reveals. Active styling correct. Mobile accordion works. GSAP entrance animation fires on scroll.
