# Task ID: 10

**Title:** Build ShowcaseSection with Swiper carousel

**Status:** pending

**Dependencies:** 4

**Priority:** medium

**Description:** Create the agent showcase section with centered heading and Swiper carousel displaying integrated agents/tools. Centered active slide with expand effect.

**Details:**

1. src/components/landing/ShowcaseSection.tsx: overflow-hidden section with top padding
2. Header: 'Integrated Agents' (p1-mono) + 'Your agents remember everything.' (h5 uppercase) + WQFButton 'Explore capabilities'
3. Swiper config: centeredSlides, slidesPerView auto, speed 500, slideToClickedSlide, mousewheel with forceToAxis
4. Slides: Claude, Codex, Cursor, Jules, Copilot. Each slide: agent name, icon/logo placeholder, custom hover color via CSS variables
5. Active slide: larger dimensions, rounded-[20px], full opacity. Inactive: smaller, no rounded, opacity-40
6. GSAP entrance: fade-in-up on scroll trigger
7. Responsive breakpoints: mobile touch-friendly, desktop mouse-draggable

**Test Strategy:**

Swiper renders and navigates correctly. Active slide expands. Drag/swipe works on mobile and desktop. Hover colors apply on active slide.
