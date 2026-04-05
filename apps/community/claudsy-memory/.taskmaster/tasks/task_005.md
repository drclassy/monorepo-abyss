# Task ID: 5

**Title:** Implement Ethos Section

**Status:** done

**Dependencies:** 1, 2, 3, 4

**Priority:** medium

**Description:** Create the light background section with vision text and expanding feature cards.

**Details:**

1. In `src/components/landing/EthosSection.tsx`, use Tailwind classes like `bg-neural-fog` and `text-rich-carbon`.
2. Build 4 expanding cards for features such as Semantic Memory.
3. Use GSAP for clip-path reveals, for example: `gsap.from(cardRef, { clipPath: 'inset(0 0 100% 0)', scrollTrigger: { trigger: cardRef } })`.
4. Ensure mobile stacking via responsive Tailwind utilities.
5. Keep content aligned to Sentra / Claudesy Memory branding.

**Test Strategy:**

Hover over cards on desktop to check expansion. On mobile, verify they stack vertically. Confirm content matches Sentra branding and animations trigger on scroll.
