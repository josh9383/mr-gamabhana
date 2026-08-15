# home-onboarding-hero Specification

## Purpose
The home page onboarding hero introduces a three-step journey (search, filter, open) directly below the navbar, auto-advances and collapses after four cycles, and remains non-blocking and accessible.

## Requirements

### Requirement: [REQ-HOH-001: Home page onboarding hero]
The home page (`site/index.html`) SHALL render an onboarding hero section directly below the navbar and above the page content. The hero SHALL introduce a three-step journey (search ideas, filter ideas by catalogue attributes, open an idea) with progressive copy, showing the three steps one at a time in order.

#### Scenario: Home page renders the onboarding hero
- **WHEN** the build generates `site/index.html`
- **THEN** it contains an onboarding hero section immediately after the navbar
- **AND** the hero contains three ordered step blocks covering searching, filtering, and opening an idea

### Requirement: [REQ-HOH-002: Auto-advance and collapse]
The hero SHALL display one step at a time and auto-advance to the next step every 3–4 seconds using a subtle fade/slide transition. After the sequence completes (fourth cycle), the hero SHALL collapse and no longer occupy page space.

#### Scenario: Sequence advances and collapses
- **WHEN** the hero sequence runs on the home page
- **THEN** only the current step is visible and the next step fades in after 3–4 seconds
- **AND** after the fourth cycle the hero fades out and collapses

### Requirement: [REQ-HOH-003: Non-blocking and accessible]
The hero SHALL NOT block or disable the search input, facet controls, or results listing while the sequence runs. Transitions SHALL be disabled under `prefers-reduced-motion`, and without JavaScript all three steps SHALL render statically visible.

#### Scenario: Catalogue interaction stays usable
- **WHEN** the hero sequence is running
- **THEN** the navbar search input, facet controls, and results listing remain interactive

#### Scenario: Reduced motion and no-JS
- **WHEN** the user prefers reduced motion
- **THEN** steps switch without animation
- **AND** when JavaScript is unavailable, all three steps are visible statically

### Requirement: [REQ-HOH-004: Sequence runs four times per load]
The hero SHALL run the three-step sequence MAX_RUNS times (4 consecutive cycles) on every page load and collapse only after the fourth cycle completes. The hero SHALL NOT use sessionStorage, localStorage, or any persistent state.

#### Scenario: Sequence cycles four times per page load
- **WHEN** the home page loads
- **THEN** the three-step sequence cycles through 4 consecutive times
- **AND** the hero collapses after the fourth cycle
- **AND** no session or persistent storage is read or written

### Requirement: [REQ-HOH-005: Top-of-page on load and refresh]
The home page SHALL render at the top of the viewport on initial load and on refresh, keeping the onboarding hero in view. The browser SHALL NOT restore a previous scroll position on reload.

#### Scenario: Page starts at the top
- **WHEN** the home page loads or is refreshed after the user has scrolled
- **THEN** the page is scrolled to the top
- **AND** the onboarding hero is visible at the top of the page
