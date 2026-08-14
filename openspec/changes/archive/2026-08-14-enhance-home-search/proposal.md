## Why

The first iteration hid the search input, facets, and results inside a collapsible panel that defaulted to collapsed, leaving a blank home page until the user expanded it. The redesign treats the home page as the default idea listing: search and facets are pure filters layered on top of an always-visible list of ideas. The search controls belong in the navbar, and facets belong in a drawer so results stay in view.

## What Changes

- The home page SHALL list every idea by default in the page body; the results grid is always visible and is never inside a panel or drawer.
- The search icon and search box SHALL move into the navbar; typing filters the idea listing in place.
- Facet controls SHALL live in a Bootstrap offcanvas drawer opened from a navbar button, so the idea listing remains visible while filtering.
- The facet drawer button SHALL be hidden on extra-small and small screens; on mobile the navbar shows only the search box (facets remain reachable on medium and larger screens).
- The facet controls SHALL be Tom Select multi-selects (vendored locally as `theme/assets/tom-select.min.js` and `theme/assets/tom-select.bootstrap5.min.css`, copied to `site/assets/`) with live counts, removable items, and per-facet clear buttons.
- Icons (search magnifier and filter drawer button) SHALL use the Font Awesome icon font loaded from the jsDelivr CDN, not inline SVGs.
- MiniSearch `autoSuggest` SHALL remain on the navbar search box (type-ahead suggestions).
- URL state round-trip (`q` plus facet params) SHALL keep working; on load the query/facets restore and the filtered listing renders immediately.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `site-output`: Home page structure changes — search icon and search box in the navbar, a facet drawer, an always-visible idea listing in the page body, Font Awesome icons, and Tom Select assets copied to `site/assets/`.
- `client-side-search`: Search and facets become filters over the default idea listing; facets render in a drawer and use Tom Select multi-select controls; autosuggest and URL round-trip interactions remain.

## Impact

- **Files created/updated:**
  - `templates/home.html.j2` — navbar search controls, offcanvas facet drawer, always-visible results area, Tom Select and Font Awesome asset links.
  - `theme/app.js` — re-target search/facet wiring to the new layout; results render all ideas by default; facet controls driven by Tom Select.
  - `theme/style.css` — navbar search, drawer layout, results-grid styles, Tom Select option counts; remove obsolete panel and pillbox styles.
  - `theme/assets/tom-select.min.js`, `theme/assets/tom-select.bootstrap5.min.css` — vendored Tom Select 2.3.1 (Apache-2.0).
  - `build.py` — copy the two Tom Select assets into `site/assets/`.
  - `site/index.html` — regenerated output.
- **Unchanged:** `content/` (read-only), other templates.
- **Dependencies:** Tom Select 2.3.1 vendored locally (no CDN at runtime); Bootstrap Offcanvas comes from the already-bundled `bootstrap.bundle.min.js`; MiniSearch already vendored; Font Awesome 6.7.2 via jsDelivr CDN.
- **Constraints, Limitations, Assumptions:**
  - Tom Select is the only multi-select library used; select2/jQuery are **not** added.
  - Facet drawer is hidden on mobile; no facet access on extra-small/small screens.
  - No inline scripts or styles; all UI is programmatic DOM injection or template literals.
- **Out-of-Scope:** Catalogue pages, idea pages, idea set pages, and the build engine are unchanged; no new catalogue types; `ideas.json` payload shape unchanged.
