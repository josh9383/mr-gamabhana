## Why

The home page drops first-time visitors straight into the search box and facet controls with no explanation of what the site is or how to use it. New users may not realize the three-step journey (search → filter → open an idea), so a lightweight, self-collapsing onboarding hero just below the navbar can orient them without getting in the way of returning users.

## What Changes

- The home page (`site/index.html`) gains an **onboarding hero** rendered directly below the navbar (above the facets and results).
- The hero introduces the **three-step journey** with progressive copy — one step visible at a time:
  1. Search for ideas using the navbar search box.
  2. Filter ideas by class, subject, concept, or material.
  3. Open an idea to read and use it.
- Steps **auto-advance one at a time**, each displayed for approximately 3–4 seconds, with a **subtle fade/slide transition** (no flashy animation).
- The hero **collapses** (hides itself) once the three-step sequence completes.
- The sequence **does not block or disable** the catalogue interaction — the hero is an in-flow section, and the search box, facets, and results remain fully usable while it runs.
- The sequence runs **4 consecutive times on every page load** (three-step cycle repeats MAX_RUNS times) and collapses after the fourth cycle; **no session or persistent state** is used.
- `prefers-reduced-motion` disables the transitions; without JavaScript all three steps render statically.
- Catalogue pages, idea set pages, and idea pages are unchanged.

## Capabilities

### New Capabilities

- `home-onboarding-hero`: The home page onboarding hero below the navbar — a three-step progressive sequence with auto-advance timing, subtle fade/slide transitions, non-blocking interaction, and a per-session run limit.

### Modified Capabilities

- `site-output`: REQ-SO-001 (Home page) changes so the generated home page also contains the onboarding hero section directly below the navbar.

## Impact

Files created or updated:

- `templates/home.html.j2` — insert the onboarding hero markup (three steps + intro) immediately after the navbar and before `<main>`.
- `theme/app.js` — add `initOnboardingHero()`: cycles the three steps MAX_RUNS times per page load, per-step auto-advance timing, fade/slide via CSS classes, collapse after the fourth cycle, `prefers-reduced-motion` handling, and a guard so it no-ops on every non-home page; dispatch it from `init()`.
- `theme/style.css` — hero, step, transition, and `prefers-reduced-motion` styles.
- `openspec/specs/home-onboarding-hero/spec.md` (new), `openspec/specs/site-output/spec.md` (delta to REQ-SO-001).

No changes to `content/` (user inputs). No new dependencies (vanilla JS, existing CSS/HTML).

Constraints, Limitations, Assumptions, Out-of-Scope:

- **Constraint**: Strictly vanilla stack — no frameworks, no inline styles, no inline scripts; transitions are CSS class-driven.
- **Constraint**: No persistent state — the sequence restarts on every page load and is not bound to a session or any storage.
- **Limitation**: Without JavaScript the three steps render statically and the hero does not collapse.
- **Assumption**: Step timing of ~3.5 seconds per step satisfies the 3–4 second requirement.
- **Out-of-scope**: No dismiss/close button (the hero auto-collapses after four cycles on each load); no content changes; no session, storage, or cross-tab persistence; no changes to any page other than the home page.

## Rollout

The build is static; the change is applied by regenerating the site. No feature flags or content migration needed.
