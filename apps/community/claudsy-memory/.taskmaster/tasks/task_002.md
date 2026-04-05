# Task ID: 2

**Title:** Add WQF color tokens and typography scale to globals.css

**Status:** done

**Dependencies:** 1

**Priority:** high

**Description:** Extend globals.css with WQF design system tokens: color palette (rich-carbon, neural-fog, off-white, electric-teal, infrared, urban-smoke), typography scale (h1-h7, p1-p3, p1-mono through p3-mono), corner-accent positioning CSS, and Tailwind @theme color mappings.

**Details:**

1. Add CSS custom properties for WQF colors: --rich-carbon: #111111, --neural-fog: ~#c8c8c8, --off-white: ~#f0f0f0, --electric-teal: ~#00c9a7, --infrared: ~#ff4d4d, --urban-smoke: #1a1a1a
2. Extract exact values from site-concept/assets/main.min.css
3. Add Tailwind @theme color mappings: --color-rich-carbon, etc.
4. Create typography classes: .h1 through .h7 (uppercase, Roc Grotesk), .p1 through .p3 (body), .p1-mono through .p3-mono (Azeret Mono, uppercase)
5. Add .corner-accent CSS for absolute SVG bracket positioning at corners
6. Add landing-specific body styles (scrollable, not overflow:hidden)

**Test Strategy:**

Create a test page with all typography classes and color tokens applied. Visually verify against site-concept reference. Confirm Tailwind utilities work with new tokens.
