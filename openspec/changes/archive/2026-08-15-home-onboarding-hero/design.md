## Context

The home page (`templates/home.html.j2`) renders navbar → `<main class="container">` → facets row → search results. It loads `assets/app.js`, whose `init()` coordinator currently dispatches `initCatalogueSearch()`, `initIdeasetCards()`, and (when `#search-page` exists) `initPage()`. The shared `theme/style.css` already has a `prefers-reduced-motion` block. The site is fully static, vanilla JS (ES2020), Bootstrap 5.3, with a no-JS fallback pattern (everything visible without scripting).

## Goals / Non-Goals

**Goals:**

- Show a three-step onboarding hero directly below the navbar on the home page only.
- One step visible at a time; auto-advance every ~4 seconds (within the 3–4 s requirement); collapse after the sequence finishes.
- Subtle fade/slide transition only; nothing flashy; `prefers-reduced-motion` removes the animation.
- Never block or disable the search box, facets, or results.
- Run the sequence 4 consecutive times on every page load, with no session or persistent state.
- Start at the top of the page on load and refresh so the hero stays in view.
- Work without JavaScript (all three steps visible statically).

**Non-Goals:**

- No changes to any page other than the home page.
- No dismiss/close button (auto-collapse handles it).
- No content changes under `content/`; hero copy is static template text.
- No new dependencies or build-engine changes (the hero needs no new render context).
- No session, storage, or cross-tab persistence.

## Decisions

### D1. Static in-flow markup, progressively enhanced by JS

`templates/home.html.j2` gains a `<section id="onboarding-hero">` immediately after `</nav>` and before `<main>`, in normal document flow. It contains a `.hero-steps alert alert-light` with three `.hero-step` blocks, each a single `<h4>` with the step copy (शोधा → निवडा → प्रयोग करून पहा). The page is enhanced by `initOnboardingHero()` which adds a `hero-js` class to the section; the CSS only applies the single-step stacked behaviour under `.hero-js`. Without JavaScript the three steps render as ordinary stacked blocks.

- Alternative: inject the hero with JS `innerHTML` - rejected: the rules require static/deterministic template output and no runtime DOM injection for core chrome; static markup also gives the no-JS fallback for free.

### D2. Non-blocking in-flow design

The hero is a normal block section - never `position: fixed/absolute`, never a full-screen overlay, no `pointer-events` manipulation. The navbar search stays above it, the facets and results below it, so catalogue interaction is fully usable while the sequence runs. The sequence only toggles CSS classes on its own steps.

- Alternative: modal or toast overlay - rejected: would cover/block the interface, violating the non-blocking requirement.

### D3. Single-step display via CSS-grid stacking

Under `.hero-js`, `.hero-steps` becomes a grid and every `.hero-step` occupies the same cell (`grid-area: 1 / 1`). Active step: `opacity: 1; transform: none; visibility: visible;`. Inactive steps: `opacity: 0; transform: translateY(6px); visibility: hidden;`, all with `transition: opacity .35s ease, transform .35s ease, visibility .35s`. `visibility` animates discretely at the end of the transition, so steps fade/slide in and out and inactive steps drop out of the accessibility tree. `aria-live="polite"` on the section announces step changes.

- Alternative: `display: none` toggling - rejected: it cannot fade/slide and removes content abruptly.
- Alternative: JS-driven opacity animation - rejected: animation belongs in CSS, and the rules forbid flashy JS animation; CSS transitions keep it subtle.

### D4. Timing, advance, and collapse

`initOnboardingHero()` runs the sequence with `STEP_DURATION = 4000` ms: reveal step 1 on load, then every 4 s swap to the next step by moving the `.hero-step-active` class (CSS transitions handle the fade/slide). After the sequence completes, the section fades out (`.hero-collapsing`), then gets the `hidden` attribute after ~550 ms (`FADE_DURATION`) so it leaves the layout. The sequence is a simple self-contained timer chain (no `setInterval` lingering after completion).

- Alternative: `setInterval` with a counter - rejected: the timer must stop cleanly after the last step; a chained `setTimeout` sequence is simpler to stop.

### D5. Sequence cycles MAX_RUNS times per page load, no persistent state

The hero runs the full three-step cycle `MAX_RUNS = 4` times on every page load: after the third step completes, the run counter increments and the sequence restarts at step 1; after the fourth cycle the section collapses. No `sessionStorage`, `localStorage`, or other state is read or written - the hero behaves identically on every load.

- Alternative: session-scoped cap via `sessionStorage` - rejected: the user explicitly wants the hero to run on every page load, not bound to a session.
- Alternative: `localStorage` lifetime cap - rejected: would permanently hide the hero after a fixed number of visits.

### D6. Reduced motion and no-JS

`@media (prefers-reduced-motion: reduce)` under `.hero-js` sets `transition: none` so steps swap instantly and the collapse is instant; timing and the four cycles per load are unchanged. Without JS, the `hero-js` class is never added and all three steps show statically (D1).

### D7. Coordinator integration

`init()` gains one line dispatching `initOnboardingHero()` alongside the existing dispatchers. The function no-ops when `#onboarding-hero` is absent, so catalogue, idea set, and idea pages (which also load `assets/app.js`) are unaffected. No shared global state is introduced; the hero's step state stays local to the function.

### D8. Top-of-page on load and refresh

Browsers restore the previous scroll position on reload, which can drop the user past the hero and to the bottom of the results. `init()` therefore sets `history.scrollRestoration = "manual"` (disabling restoration) and calls `window.scrollTo(0, 0)` before dispatching the page initializers, so every load and refresh renders at the top with the hero in view.

- Alternative: leave restoration enabled - rejected: refresh after scrolling buried the hero, which is why this decision exists.

## Risks / Trade-offs

- **Timers may drift when the tab is backgrounded** → Sequence is non-critical and self-limiting; drift only delays step swaps, never blocks interaction.
- **Four cycles per load keep the hero visible for ~48 seconds** → Intended per the explicit requirement; the hero is in-flow, non-blocking, and auto-collapses.
- **Hero stacking uses CSS grid in one cell** → Supported in the last two versions of all major browsers; the no-JS path is plain block layout.
- **Copy is static in the template** → Changes to onboarding copy require a template edit + rebuild; acceptable for fixed site chrome.
- **Scroll restoration disabled globally** → Reload always returns to the top on every page; the site is small, so returning to a previous scroll depth on reload is not a supported flow.

## Migration Plan

1. Add the hero markup to `templates/home.html.j2` (below `</nav>`, above `<main>`).
2. Add `initOnboardingHero()` to `theme/app.js` and dispatch it from `init()`.
3. Add hero/step/transition/reduced-motion styles to `theme/style.css`.
4. Run `python build.py`; serve `site/`; verify on `/`: single active step, ~4 s auto-advance, fade/slide, four consecutive cycles, collapse after the fourth cycle, facets/search remain interactive, and the hero restarts on every reload. Refresh after scrolling and confirm the page returns to the top with the hero in view. Verify catalogue/idea set/idea pages are unaffected.
5. Rollback: revert the three source files and rebuild; the home page returns to its previous state.

## Open Questions

- None blocking.
