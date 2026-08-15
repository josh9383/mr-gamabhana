## Why

Individual idea set pages (`/ideasets/{slug}/`) currently hide each member idea inside a collapsed accordion, so a visitor must click every header to read the content. Reading an idea set top-to-bottom is awkward, and the page gives no hint of the idea's catalogue attributes until expanded.

## What Changes

- Individual idea set pages render each member idea as a **full-content card** in a **single column** (all screen sizes), instead of an accordion.
- Each card contains the whole idea: title (linking to the idea's page), photos (fallback / single / fading carousel), the idea's full details (`content_html`), and a footer of badge links derived from the active catalogue attributes (the same `footer_badges` used on idea cards).
- Cards are pre-rendered server-side and **progressively revealed on scroll** (infinite scroll): the visitor sees one idea card at a time and the next card loads as the sentinel enters the viewport, ending with an end-of-list marker.
- The page keeps working without JavaScript (all cards are in the HTML; only the reveal behavior is enhanced).
- The ideaset landing page, home page, and other catalogue pages are unchanged.

## Capabilities

### New Capabilities

- `ideaset-page-cards`: Idea set pages list their member ideas as single-column, full-content cards with catalogue-attribute footers and progressive on-scroll reveal (infinite scroll).

### Modified Capabilities

- `build-engine`: The idea set page member payload changes from accordion-only fields to full-content card fields — `title`, `url`, `description`, `image_urls`, `content_html`, plus `footer_badges` derived from the active catalogue configuration (REQ-BE-014).
- `site-output`: The idea set page output changes from a Bootstrap accordion to the single-column card list with progressive reveal; it continues to exclude the catalogue search experience (REQ-SO-013).

## Impact

Files created or updated:

- `build.py` — enrich each idea set page member payload with `footer_badges` (reusing `footer_badges_for`) for the active footer-enabled catalogue types.
- `templates/ideaset.html.j2` — replace the accordion markup with the single-column card list (`#ideaset-cards`), each card with title, photos, `content_html`, and footer badges, plus a reveal sentinel; load `assets/app.js`.
- `theme/app.js` — add `initIdeasetCards()` that reveals one pre-rendered card per scroll step via an IntersectionObserver sentinel and shows an end-of-list marker.
- `theme/style.css` — single-column card list styling (stacked full-width cards) and any sentinel/card spacing rules.
- `openspec/specs/ideaset-page-cards/spec.md` (new), `openspec/specs/build-engine/spec.md` and `openspec/specs/site-output/spec.md` (deltas).

No changes to `content/` (user inputs). No new dependencies; MiniSearch, Tom Select, Bootstrap collapse JS are not required on these pages.

Constraints, Limitations, Assumptions, Out-of-Scope:

- **Constraint**: Progressive reveal operates on pre-rendered cards in the HTML; no runtime fetching of idea content, since the site is fully static.
- **Limitation**: "Load next idea" is a scroll-reveal animation, not a network fetch; the full payload is always in the page source (no-JS fallback).
- **Assumption**: One idea card is revealed per scroll step; the first card is visible on load.
- **Assumption**: Footer badges reuse the existing `footer_badges` computation so cards match idea-card footers.
- **Out-of-scope**: The ideaset landing page (keeps its faceted search), the home page, and all other catalogue pages; no content changes.
