## Context

The previous iteration wrapped the search input, facets, and results inside a Bootstrap collapsible `#search-panel` that defaulted to collapsed, so the home page appeared blank until the button was clicked. The project is strictly vanilla (Bootstrap 5.3/Bootswatch via CDN, plain JS, vendored MiniSearch at `theme/assets/minisearch.min.js`). The home page body currently holds `#search-page` with a `.facets` aside and a `.search-results` section; the navbar holds only the brand.

## Goals / Non-Goals

**Goals:**
- List every idea on the home page by default; the listing is never hidden inside a panel or drawer.
- Move the search icon and search box into the navbar; typing filters the listing in place.
- Put facets in a Bootstrap offcanvas drawer so results stay visible while filtering.
- Hide the facet drawer button below the medium breakpoint (mobile shows only the search box).
- Keep MiniSearch autoSuggest on the navbar search box and use vendored Tom Select multi-selects for facets.

**Non-Goals:**
- No changes to the build engine, `ideas.json` payload, or idea/catalogue/ideaset pages.
- No new catalogue types or changes to `facet_types`.
- No jQuery/select2 dependency; Tom Select is the only facet widget and is vendored locally.
- No facet access on mobile (drawer button hidden below `md`).

## Decisions

**D1: Navbar search with icon and box.**
The navbar gains the search input (input-group with a magnifier SVG) plus the autoSuggest container positioned under it. `#search-page` moves to the page body and becomes just the results column: `#result-count` + `#search-results`. This satisfies "results should continue on home page" and "move the search icon and search box in nav bar".
- Alternative considered: keeping the search in the page body — rejected because the user asked for navbar placement.

**D2: Facets in a Bootstrap offcanvas drawer.**
Facet panels move into `#facets-drawer` (`offcanvas offcanvas-end`), opened by a `#facets-toggle` button in the navbar via `data-bs-toggle="offcanvas"` (Bootstrap already bundled, so no new dependency). A "clear all" button sits at the top of the drawer body. The idea listing remains in the page body, visible while the drawer is open.
- Alternative considered: Bootstrap Modal — rejected because a modal backdrop dims and covers the results the user wants to keep in view; offcanvas keeps them visible.

**D3: Responsive facet access.**
`#facets-toggle` gets `d-none d-md-block`; on mobile the navbar shows only the search box. Facet state still applies if shared via URL (the drawer simply stays closed on mobile).

**D4: Results render all ideas by default.**
`initSearchPage()` renders the grid on load with no query/facets, so the listing shows every idea. `currentResults()` already returns all ideas when no filters are active; the fix is that the results container is always visible in the body.

**D5: Facets powered by vendored Tom Select.**
Each facet panel renders a `<select multiple class="form-select facet-select">`; `initFacetSelects()` wraps each in a `TomSelect` instance (complete bundle, plugins `remove_button` + `clear_button`). Options are populated on every `renderFacets()` pass with the live counts as `addOption({value, text, count})`; the custom `render.option` shows `value (count)` while `render.item` shows just the value. A silent `setValue` on init restores URL state, and the `onChange` callback writes state back to the URL and re-renders. Tom Select 2.3.1 (Apache-2.0) is vendored at `theme/assets/tom-select.min.js` (complete build, plugins included) with the Bootstrap 5 theme `theme/assets/tom-select.bootstrap5.min.css`; `build.py` copies both to `site/assets/` (REQ-SO-007). The old pillbox renderer, its event listeners, and its CSS are removed.
- Alternative considered: keeping the vanilla pillboxes — rejected because the user asked for Tom Select.

**D6: Autosuggest and URL round-trip carried over.**
The debounced `miniSearch.autoSuggest`, outside-click/Escape close, and URL round-trip are retained with element references retargeted to the navbar input, drawer facets, and body results.

## Risks / Trade-offs

- [Navbar space is tight on small screens] → The search input-group is allowed to flex/shrink; the brand and search coexist; the drawer button is hidden on mobile so it never crowds the navbar.
- [Offcanvas body vs fixed drawer height] → `offcanvas-body` scrolls its Tom Select dropdowns; overflow is contained within the drawer.
- [Results jump when facets open the drawer on medium screens] → The listing stays in place; the drawer overlays from the right edge only.
- [Tom Select adds a dependency] → Vendored locally and pinned (2.3.1, Apache-2.0), same pattern as MiniSearch; select2/jQuery are still avoided; catalogue pages are unaffected.
- [Offcanvas relies on Bootstrap JS loading] → Bootstrap bundle already required by REQ-SO-011; if it fails, the drawer button degrades but the listing still renders.

## Migration Plan

1. Update `templates/home.html.j2` (navbar search, offcanvas drawer, body results).
2. Update `theme/app.js` (retarget references; results default to all ideas).
3. Update `theme/style.css` (navbar search, drawer, results grid; remove panel styles).
4. Run `python build.py` and verify at mobile and desktop widths.
5. No data or build-engine migration; rollback is a revert of the three source files plus a rebuild.

## Open Questions

None.
