## Context

The home page search experience is a fully client-side, zero-dependency module (`initSearchPage` in `theme/app.js`, the coordinator) that builds a MiniSearch index over `site/ideas.json`, filters ideas by a navbar query and Tom Select facets, and renders every matching idea at once into `#search-results` inside the page body. `currentResults()` is the single source of truth for the filtered set; `renderResults()` writes its full contents plus a total count (`{n} युक्त्या`) into the DOM. The catalog currently has 9 ideas; as it grows, a single render pass will produce an increasingly heavy grid and delay first paint. The change adds infinite-scroll pagination: render the first page, append the next page when the user scrolls to the bottom, and reset to the first page whenever the query or facets change.

## Goals / Non-Goals

**Goals:**
- Render only the first page (6 ideas) of the current result set on the home page, then append subsequent pages on scroll to the bottom.
- Keep the total result count (not the loaded count) in `#result-count`.
- Reset to the first page on any query or facet change, and show an end-of-list state when everything is loaded.
- Keep the change strictly client-side and dependency-free (`IntersectionObserver` is a browser API).
- Keep the coordinator (`initSearchPage`) as the single source of truth for all search state, including pagination.

**Non-Goals:**
- No server-side or static pagination (the site is static and fully client-side).
- No changes to `ideas.json`, catalogue pages, idea pages, or the build engine.
- No "load more" button, sorting, or user-configurable page size.
- No pagination parameters in the URL (session-scoped only).

## Decisions

**D1: Pagination state lives in the coordinator.**
A module-scoped `loadedPage` counter (0-based) and `const PAGE_SIZE = 6` sit alongside `state` in `initSearchPage`. `currentResults()` still returns the full filtered array; `renderResults()` renders only `currentResults().slice(0, (loadedPage + 1) * PAGE_SIZE)`. The total count always comes from `currentResults().length`. This preserves the existing single-source-of-truth pattern.

**D2: Sentinel element observed by an `IntersectionObserver`.**
`templates/home.html.j2` gains a static sentinel `<div id="search-more" aria-live="polite"></div>` right after `#search-results`. A single `IntersectionObserver` watches it; when it intersects the viewport, results remain, and no load is in progress, the next page is appended. The observer is unobserve()d at the end of the list.
- Alternative considered: a `window` `scroll` listener with manual `getBoundingClientRect()` math — rejected because it needs rAF/throttle plumbing and can jank; `IntersectionObserver` is the standard, cheaper mechanism.
- Alternative considered: a "load more" button — rejected because the user asked for scroll-triggered pagination.

**D3: Reset to page 1 on every filter change.**
The query input listener, the Tom Select `onChange`, `clear-facets`, `applySuggestion`, and `applyState` (URL restore) each call a shared `resetAndRender()` that sets `loadedPage = 0` and calls `render()`. `render()` itself never resets the page, so appending a page via the observer reuses the same `render()` without losing the scroll position.

**D4: In-flight guard and graceful degradation.**
A `loadingMore` flag guards the observer callback so re-entrant intersections cannot start a second page load. If `typeof IntersectionObserver === "undefined"` (ancient browsers), the listing falls back to rendering all results at once — the current behavior.

**D5: Card markup is extracted.**
The card template literal currently inside `renderResults()` moves to a `cardHtml(idea)` function used by both the initial render and page appends, so every page renders identically.
- Alternative considered: appending only the new slice via `insertAdjacentHTML` — rejected for this scale because a deterministic full re-render of the slice is simpler and avoids partial-update bugs; if the catalog grows large, appending can be revisited.

**D6: Sentinel communicates end-of-list.**
The sentinel renders a muted end-of-list line (`सर्व युक्त्या पाहिल्या` — "all ideas seen") once every matching idea is loaded, and stays clear otherwise. `aria-live="polite"` announces loading progress to assistive technology.

## Risks / Trade-offs

- [Auto-fill when the first page is shorter than the viewport] → The observer fires immediately, so small result sets fill to the bottom of the viewport (with 9 ideas: 6 rendered, then 3 appended). This is standard infinite-scroll behavior and effectively preserves today's experience for small catalogs.
- [Full re-render on append could flicker] → Data is local and synchronous, and the grid renders from the same source, so the replacement is deterministic and flicker-free at this scale.
- [Infinite scroll can be disorienting / hard to bookmark] → The total count is always visible, the end-of-list state is explicit, and pagination is session-only, so URLs stay shareable.
- [Observer never fires because results never fill the viewport] → Not a problem: IO fires on any intersection, so short lists auto-fill and terminate at the end-of-list state.

## Migration Plan

1. Add the `#search-more` sentinel to `templates/home.html.j2` after `#search-results`.
2. Update `theme/app.js`: add `PAGE_SIZE`/`loadedPage`/`loadingMore`, extract `cardHtml()`, slice in `renderResults()`, add the observer + `resetAndRender()`, and route every filter change through `resetAndRender()`.
3. Update `theme/style.css` with sentinel/end-of-list styles.
4. Run `python build.py`, then verify with `python -m http.server` in `site/`: confirm first page, scroll-appended pages, reset on filter change, total count, and end-of-list state (the 9-idea catalog shows 6 + 3).
5. Rollback is a revert of the three source files plus a rebuild; no data or build-engine migration.

## Open Questions

None.
