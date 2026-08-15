## Context

Individual idea set pages are rendered by `templates/ideaset.html.j2` as a Bootstrap accordion (`data-bs-toggle="collapse"`); each member idea is collapsed behind a header and only expands on click. The page loads Bootstrap JS but not `theme/app.js`. In `build.py`, each idea set page receives `items` where every member item carries `title`, `url`, `description`, `image_urls`, and `content_html` (the Markdown body converted with `extra`/`toc`). The `theme/style.css` already provides `card-carousel` (16:9 fading image carousel), `card-hidden`, and badge-link styles; `theme/app.js` already implements IntersectionObserver-driven "load more" pagination in `initPage()` that can be mirrored.

## Goals / Non-Goals

**Goals:**

- Member ideas on idea set pages display as full-content cards in a single column at every screen size.
- Each card shows the complete idea: title (linked to the idea page), photos, the full idea content, and a footer of catalogue-attribute badges.
- Cards reveal progressively on scroll (one per step) with an end-of-list marker, so the visitor reads the idea set top-to-bottom.
- The page works without JavaScript: all cards are present in the HTML.

**Non-Goals:**

- Changing the ideaset landing page, home page, or other catalogue pages.
- Network-fetching idea content at runtime (fully static).
- Adding search, facets, or MiniSearch to idea set pages.
- Content changes under `content/`.

## Decisions

### D1. Pre-rendered full-content cards with client-side progressive reveal

The template renders every member idea as a `card` inside `#ideaset-cards`; cards beyond the first are hidden with the existing `card-hidden` class. A `#ideaset-more` sentinel is observed with an IntersectionObserver; when it enters the viewport, the next batch of cards is revealed, and a `सर्व युक्त्या पाहिल्या` end marker is shown once all cards are visible. All cards remain in the DOM (no-JS fallback: the page simply shows everything).

- Alternative: fetch idea JSON at runtime and build cards dynamically — rejected: adds a payload + render pipeline for no benefit, and breaks the no-JS guarantee.
- Alternative: render everything with no reveal — rejected: the user explicitly wants scroll-to-load ("load next idea").

### D2. Dedicated single-column container

A new `#ideaset-cards` block styles the list as one full-width column (CSS: `display: flex; flex-direction: column; gap`) with cards taking the full container width at all breakpoints. The first card is visible on load; the container needs no grid columns.

- Alternative: reuse `.catalogue-grid` — rejected: it is `repeat(auto-fill, minmax(220px, 1fr))` and would produce multi-column cards that conflict with the full-content layout.

### D3. Footer badges reuse the idea-card computation

`build.py` computes each member's `footer_badges` with the existing `footer_badges_for(idea, catalogue_defs, footer_types)` so the footer links exactly mirror idea cards (e.g., props → `/props/{slug}/`, ideaset → `/ideasets/{slug}/`). The ideaset page render already has `catalogue_defs` and `footer_types` in scope. The template renders the badges exactly like idea-card footers (`badge-{path}` classes).

### D4. One card revealed per scroll step

`initIdeasetCards()` reveals a single card per sentinel intersection (PAGE_SIZE = 1, matching "load next idea"), using the same observer pattern as `initPage()`'s infinite scroll. A `prefers-reduced-motion` style keeps all cards visible for reduced-motion users.

- Alternative: reveal multiple cards per step — rejected as it dilutes the requested one-at-a-time reading experience.

### D5. Client entry point without disturbing existing dispatchers

`templates/ideaset.html.j2` gains `<script src=".../assets/app.js">`. In `init()`, `initCatalogueSearch()` already no-ops on pages without `.catalogue-search`, and `initPage()` no-ops without `#search-page`; a new `initIdeasetCards()` no-ops without `#ideaset-cards`. The three dispatchers stay mutually exclusive.

## Risks / Trade-offs

- **Large HTML payload** (all cards inline) → acceptable for realistic idea set sizes (a handful of members); matches the existing ideas landing page approach.
- **Reveal may feel like stutter with long content** → the sentinel uses `rootMargin` so the next card loads slightly before it scrolls into view; reduced-motion users see everything.
- **Badge count could be high on busy cards** → badges already wrap (`d-flex flex-wrap gap-1`), consistent with idea cards.
- **Image carousel at full width** is large (16:9) → intended: the card represents the whole idea; object-fit cover keeps it tidy.

## Migration Plan

1. Implement `build.py` payload, template, JS, and CSS changes; run `python build.py`.
2. Serve `site/` and verify on `/ideasets/fractions-introduction/`: single-column cards, first card visible, scroll reveals the rest, end marker appears, badges link correctly, idea page links work, no `.catalogue-search`/`#search-page` present.
3. Regression: `/` (home), `/ideasets/` landing, a catalogue landing page, an individual catalogue page, and an idea page are unchanged.
4. Rollback: revert the four source files; rebuild restores the accordion.

## Open Questions

- None blocking.
