# Spec: The Stage — Dramatic Orchestrated Motion Experience

**Date:** 2026-05-05  
**Status:** Implemented  
**Site:** ferdiiskandar (Dr. Ferdi Iskandar founder portfolio)

---

## Context

The site had a strong editorial/monograph visual identity but used motion in a restrained way — mostly CSS hover transitions. Framer Motion `^12.38.0` was already installed but unused.

**Goal:** Transform the site into a "dramatic orchestrated experience." Each section has its own cinematic entrance choreography, unified by a consistent motion language. Like a theater performance: opening act, rising action, climax.

---

## Design Decisions

- **Style:** Dramatic (not whisper, not confident)
- **Scope:** Entire site — all 8 sections
- **Approach:** "The Stage" — each section has unique character within one unified motion language

---

## Motion Language

### Timing Tokens (`lib/motion-variants.ts`)

| Token    | Value | Use case                      |
| -------- | ----- | ----------------------------- |
| `fast`   | 0.3s  | Micro-interactions, hovers    |
| `medium` | 0.6s  | Element entrances             |
| `slow`   | 1.2s  | Section reveals, hero moments |
| `epic`   | 2.0s  | Cinematic opening sequence    |

### Easing Curves

| Name       | Curve                   | Character                             |
| ---------- | ----------------------- | ------------------------------------- |
| `entrance` | `[0.16, 1, 0.3, 1]`     | Confident, authoritative              |
| `exit`     | `[0.7, 0, 0.84, 0]`     | Quick, no lingering                   |
| `dramatic` | `[0.22, 1.61, 0.36, 1]` | Slight overshoot, snapping into place |

### Base Variants

```ts
fadeUp:      y: 40→0, opacity: 0→1
fadeDown:    y: -20→0, opacity: 0→1
slideIn:     x: -60→0, opacity: 0→1
slideInRight: x: 60→0, opacity: 0→1
scaleReveal: scale: 0.92→1, opacity: 0→1
blurIn:      blur(12px)→blur(0px), opacity: 0→1
fadeIn:      opacity: 0→1
```

### Scroll Trigger

`viewport: { once: true, amount: 0.15 }` — fires when element is 15% in viewport, once only.

---

## Section Choreography

| Section          | Entrance Effect                                                                                                                  | Technique                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Hero**         | Cinematic mount: left column stagger (eyebrow→h1→thesis→identity items), right column slides from right                          | `animate` (above fold), `staggerChildren`        |
| **Impact**       | Section head slides from left; 8 cells fan in with `scaleReveal` stagger                                                         | `staggerContainer(0.08)`                         |
| **Portfolio**    | Left sidebar slides in; feature cards `scaleReveal` with `whileHover` lift; metrics race via `CountUp`; registry columns stagger | `staggerContainer` + `CountUp` + `useInView`     |
| **Expertise**    | Masthead fades down; hero grid children stagger; thinking nodes `scaleReveal` one-by-one; footer fades in                        | `staggerContainer(0.1)` on graph nodes           |
| **Intelligence** | Section head slides from left; brief cards emerge from blur                                                                      | `blurIn` with `staggerContainer(0.15)`           |
| **Vision**       | Headline `SplitText` word-by-word; copy paragraphs stagger `fadeUp`                                                              | `SplitText` component + `staggerContainer(0.18)` |
| **FieldNotes**   | Section head slides from left; 3 notes fan from center with x-offset                                                             | Direct `x` offset per note (-40/0/+40)           |
| **Contact**      | Section head fades up; list items stagger `fadeUp`; arrow icons nudge on loop                                                    | `staggerContainer(0.1)` + infinite loop arrow    |

---

## New Components

### `lib/motion-variants.ts`

Central token store for all timing, easing, variants, and scroll trigger config. Prevents per-component drift.

### `components/SectionReveal.tsx`

Reusable `motion.div` wrapper for `whileInView` reveals with configurable variant and delay.

### `components/CountUp.tsx`

Animates a number from 0 to target using `useInView` + `requestAnimationFrame`. Respects `prefers-reduced-motion`.

### `components/SplitText.tsx`

Splits text per word or character into individually animated `motion.span` elements. Handles accessibility with `aria-label` on container.

---

## Accessibility

All animations respect `useReducedMotion()` from Framer Motion:

- When `prefers-reduced-motion: reduce` is set in OS → all Framer Motion animations are bypassed
- Static fallback renders immediately for all components
- `CountUp` shows final value directly
- `SplitText` renders as plain text

---

## Testing

- `vitest.setup.ts` mocks `framer-motion` globally — replaces `motion.*` with plain HTML elements, hooks return sensible no-op values
- `IntersectionObserver` mocked globally via `MockIntersectionObserver` class
- All 29 tests passing after implementation

---

## Files Changed

**New:** `lib/motion-variants.ts`, `components/SectionReveal.tsx`, `components/CountUp.tsx`, `components/SplitText.tsx`

**Modified:** `components/Hero.tsx`, `components/Impact.tsx`, `components/Portfolio.tsx`, `components/Expertise.tsx`, `components/Intelligence.tsx`, `components/Vision.tsx`, `components/FieldNotes.tsx`, `components/Contact.tsx`, `vitest.setup.ts`
