# Task ID: 12

**Title:** Build TeamsSection with reversed stacking cards layout

**Status:** pending

**Dependencies:** 11

**Priority:** medium

**Description:** Create the 'For AI Teams' section with reversed layout (cards left, text right) and 3 numbered stacking cards. Mirrors DeveloperSection with different content.

**Details:**

1. src/components/landing/TeamsSection.tsx: Similar to DeveloperSection but reversed
2. Left column (col-span-6): 3 stacking cards, order-1 on mobile
3. Card 1 (electric-teal): '01' + 'Session continuity' + 'Never lose context between sessions'
4. Card 2 (infrared): '02' + 'Fact curation' + 'Edit, merge, archive knowledge'
5. Card 3 (off-white): '03' + 'Health dashboard' + 'Real-time engine monitoring'
6. Right column (col-span-5, offset): 'For AI Teams' label, 'Scale Your Agent Fleet' heading, description, WQFButton
7. Same GSAP stacking logic as DeveloperSection
8. Mobile: cards above text, clip-path reveal

**Test Strategy:**

Verify reversed layout renders correctly. Cards stack on scroll. Mobile order is cards-first. Content matches spec.
