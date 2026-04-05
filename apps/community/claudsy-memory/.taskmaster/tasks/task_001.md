# Task ID: 1

**Title:** Install GSAP, Three.js, Swiper dependencies and setup custom fonts

**Status:** done

**Dependencies:** None

**Priority:** high

**Description:** Install gsap, three, and swiper npm packages. Copy Roc Grotesk (.woff2) and Azeret Mono (.otf) font files from site-concept/assets/ to public/fonts/. Declare @font-face rules in globals.css and add Tailwind @theme font mappings.

**Details:**

1. Run npm install gsap three swiper
2. Copy site-concept/assets/roc-grotesk-medium.woff2, roc-grotesk-regular.woff2, azeret-mono-regular.otf to public/fonts/
3. Add @font-face declarations in globals.css for both font families
4. Map fonts in @theme inline block: --font-roc-grotesk and --font-azeret-mono
5. Add utility classes: .font-roc-grotesk, .font-azeret-mono

**Test Strategy:**

Verify fonts load in browser DevTools Network tab. Check computed styles on test elements show correct font-family. Confirm no FOUT/FOIT issues.
