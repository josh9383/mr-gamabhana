## Why

The home page currently renders every matching idea into the DOM at once. As the idea catalog grows, a single render pass produces a large grid, slowing first paint and keeping the full list in memory even though the user only sees the top of it. Paginate the listing with an infinite-scroll pattern: render the first page immediately and append the next page only when the user scrolls to the bottom.

## What Changes

- The home page results container SHALL render the first page of the current result set immediately (page size 6 ideas), instead of every matching idea at once.
- When the user scrolls to the bottom of the results container, the next page of the current result set SHALL be appended to the listing.
- A sentinel element SHALL mark the end of the listing, and the loading of the next page SHALL be triggered by observing that sentinel with an `IntersectionObserver`.
- The result count text SHALL reflect the total number of matching ideas, not just the ideas loaded so far.
- Any change to the search query or to any facet SHALL reset the listing to the first page and restart scroll-based loading.
- A "no more results" state SHALL be shown once every matching idea is loaded, and loading SHALL not repeat while a page load is in progress.
- The pagination is session-scoped: the loaded page count is NOT written to the URL, and the URL state (`q` plus facet parameters) remains unchanged.
- **No breaking changes** to `ideas.json`, catalogue pages, or the build engine.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `client-side-search`: The home page results rendering changes from "render all matching ideas at once" to "render the first page, then append subsequent pages as the user scrolls to the bottom" (REQ-CS-011 modified, REQ-CS-013 added), including the total count and end-of-list behavior.

## Impact

- **Files created/updated:**
  - `theme/app.js` — paginated rendering in `renderResults()`, `IntersectionObserver` on a sentinel, reset-on-filter-change, guard against in-flight loads and re-triggers.
  - `templates/home.html.j2` — a static sentinel element (`#search-more`) after the results container that the observer watches.
  - `theme/style.css` — sentinel, loading indicator, and end-of-list styles (no inline styles).
  - `site/index.html` — regenerated output.
- **Unchanged:** `build.py` (no build-engine changes), `content/` (read-only), `ideas.json` payload shape, catalogue pages, idea pages, and URL state semantics.
- **Dependencies:** None new — `IntersectionObserver` is a browser API; no external libraries.
- **Constraints, Limitations, Assumptions:**
  - Pagination applies only to the home page idea listing; catalogue pages and idea set pages keep their current single-pass behavior.
  - The page size is fixed at 6; not user-configurable.
  - Loaded page count is session state only; refreshing or sharing the URL starts at page 1.
  - No inline scripts or styles; all UI is programmatic DOM injection or template literals.
- **Out-of-Scope:** Server-side pagination (the site is static and fully client-side), sorting, a "load more" button, and any change to `ideas.json`.
