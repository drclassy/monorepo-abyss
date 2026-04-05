# Task ID: 15

**Title:** Responsive polish, accessibility, and dashboard regression test

**Status:** pending

**Dependencies:** 14

**Priority:** high

**Description:** Test all breakpoints, fix layout issues, ensure prefers-reduced-motion compliance, verify mobile nav, and confirm dashboard at /dashboard has zero regressions.

**Details:**

1. Test viewports: 375px (mobile), 768px (tablet), 1024px (laptop), 1280px+ (desktop)
2. Fix any overflow, spacing, font-size issues per breakpoint
3. Verify mobile nav hamburger works correctly
4. Ensure ALL GSAP animations check window.matchMedia('(prefers-reduced-motion: reduce)') and skip
5. Test card stacking: pin on desktop, clip-path on mobile
6. Navigate to /dashboard: verify all zones, command palette, API routes, daemon controls
7. Check no visual regressions from new globals.css tokens
8. Verify dashboard layout still uses overflow:hidden correctly
9. Test keyboard navigation and focus management

**Test Strategy:**

Cross-viewport visual testing. Reduced-motion media query testing. Full dashboard functionality verification. Keyboard navigation audit. Performance check (no jank on scroll).
