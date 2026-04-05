# Task ID: 14

**Title:** Wire all sections into landing page with GSAP ScrollSmoother

**Status:** pending

**Dependencies:** 5, 6, 7, 8, 9, 10, 11, 12, 13

**Priority:** high

**Description:** Compose all section components into the root page, initialize GSAP ScrollSmoother, add section IDs for scroll anchoring, and ensure smooth scroll behavior with proper z-indexing.

**Details:**

1. Update src/app/page.tsx: 'use client', import all section components
2. Wrap in smooth-wrapper > smooth-content div pattern for GSAP ScrollSmoother
3. Initialize ScrollSmoother in useEffect: ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.2, effects: true })
4. Register GSAP plugins: gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
5. Section order: Header (fixed), HeroSection, EthosSection, FocusSection, CapabilitiesSection, ShowcaseSection, DeveloperSection, TeamsSection, Footer
6. Add section IDs for anchor scrolling from nav
7. Ensure z-indexing: header z-50, sections z-1, modals z-100
8. Handle cleanup on unmount

**Test Strategy:**

Full page scroll test. Verify smooth scrolling works. All sections render in correct order. Anchor links scroll to correct sections. No z-index conflicts. No console errors.
