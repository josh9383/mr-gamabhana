# Tasks

## 1. Template

- [x] 1.1 Insert the onboarding hero markup in `templates/home.html.j2` directly below `</nav>` and above `<main>`: a `<section id="onboarding-hero" aria-live="polite">` containing a `.hero-steps alert alert-light` with three `.hero-step` blocks, each an `<h4>` with the step copy (शोधा → निवडा → प्रयोग करून पहा) (REQ-HOH-001, REQ-SO-001)
- [x] 1.2 Ensure the hero uses only static classes and no inline styles or scripts, and that the navbar search input, facets, and results container remain in the page (REQ-HOH-003)

## 2. Client

- [x] 2.1 Add `initOnboardingHero()` to `theme/app.js`: no-op without `#onboarding-hero`; cycle the three steps `MAX_RUNS` (4) consecutive times per page load with no `sessionStorage` or persistent state (REQ-HOH-004)
- [x] 2.2 Implement the sequence: add the `hero-js` class, advance `.hero-step-active` one step every 4000 ms, restart at step 1 after each full cycle, and collapse the hero (fade + `hidden`) after the fourth cycle (REQ-HOH-002)
- [x] 2.3 Respect `prefers-reduced-motion` (transitions stay in CSS; timing and cycles unchanged) (REQ-HOH-003)
- [x] 2.4 Dispatch `initOnboardingHero()` from `init()`; confirm it no-ops on catalogue, idea set, and idea pages (REQ-HOH-003)
- [x] 2.5 Ensure the page starts at the top on load/refresh by setting `history.scrollRestoration = "manual"` and calling `window.scrollTo(0, 0)` at the top of `init()` so the hero stays in view (REQ-HOH-005)

## 3. Styles

- [x] 3.1 Add `#onboarding-hero`, `.hero-steps`, and `.hero-step` styles to `theme/style.css`: single-cell grid stacking under `.hero-js`, active vs inactive step states with subtle fade/slide transitions, collapse transition, and a `prefers-reduced-motion` rule disabling transitions (REQ-HOH-002, REQ-HOH-003)

## 4. Verification

- [x] 4.1 Run `python build.py`; confirm `site/index.html` contains the hero section below the navbar with three steps, and catalogue, idea set, and idea pages are unaffected (REQ-HOH-001, REQ-SO-001)
- [x] 4.2 Serve `site/` and verify on `/`: one step visible at a time, ~4 s auto-advance, fade/slide transition, four consecutive cycles, and collapse after the fourth cycle (REQ-HOH-002)
- [x] 4.3 Verify the search input, facets, and results stay interactive during the sequence, and that the hero cycles 4 times and collapses on every load with no session state (REQ-HOH-003, REQ-HOH-004)
- [x] 4.4 Run `node --check theme/app.js` and regression-check catalogue, idea set, and idea pages load correctly with the new dispatcher (REQ-HOH-003)
- [x] 4.5 Refresh `/` after scrolling and confirm the page returns to the top with the hero in view (REQ-HOH-005)
