# Task ID: 4

**Title:** Build reusable UI primitives: CornerAccent, WQFButton, SplitText

**Status:** done

**Dependencies:** 2

**Priority:** high

**Description:** Create the three core UI building blocks used across all landing sections: CornerAccent (SVG L-bracket at 4 corners), WQFButton (dot slide-in + text slide + corner accents), and SplitText (GSAP character-reveal animation wrapper).

**Details:**

1. src/components/landing/ui/CornerAccent.tsx: Accept size prop, render 4 absolute-positioned SVG L-brackets at corners of parent (relative). SVG path: M0.5 0.2L0.5 9.2M0.2 0.5L9.2 0.5
2. src/components/landing/ui/WQFButton.tsx: Accept label, href, theme (light/dark), onClick. Render: outer relative container with CornerAccent, inner flex with dot div (slides from -24px to -5px on hover), text with duplicate span (original slides -translate-y-full, clone slides in). Use CSS transitions matching WQF durations (400ms, ease-[--easing])
3. src/components/landing/ui/SplitText.tsx: Accept children text, wrap each character in a span. Use GSAP ScrollTrigger to animate opacity and y per character on scroll. Respect prefers-reduced-motion.

**Test Strategy:**

Render each component in isolation. Verify CornerAccent positions correctly at all 4 corners. Verify WQFButton hover animation matches WQF reference. Verify SplitText reveals characters sequentially on scroll.
