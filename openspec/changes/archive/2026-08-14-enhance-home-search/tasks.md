## 1. Template (home.html.j2)

- [x] 1.1 Move the search icon and search box into the navbar as an input-group, keeping the `phonetic-input` class and an `#autosuggest` container positioned under it (REQ-SO-001, REQ-CS-011, REQ-CS-012).
- [x] 1.2 Add a `#facets-toggle` button in the navbar opening a Bootstrap offcanvas `#facets-drawer` via `data-bs-toggle="offcanvas"`, hidden below the medium breakpoint with `d-none d-md-block` (REQ-SO-001, REQ-CS-011).
- [x] 1.3 Move the facet panels (`data-facet`) and the clear-all button into the offcanvas drawer body (REQ-SO-001, REQ-CS-007).
- [x] 1.4 Render an always-visible results area (`#result-count` + `#search-results`) in the page body under the title, outside any panel or drawer, and remove the old collapsible `#search-panel` (REQ-SO-001, REQ-CS-011).

## 2. Theme CSS (style.css)

- [x] 2.1 Add navbar search styles: flexible input-group width, magnifier icon spacing, and `.autosuggest` positioning under the navbar search box (REQ-SO-001, REQ-CS-012).
- [x] 2.2 Add offcanvas drawer styles so facet pillboxes lay out cleanly in the drawer body (REQ-SO-001, REQ-CS-007).
- [x] 2.3 Remove obsolete `#search-toggle`/panel styles no longer used by the template (REQ-SO-001).

## 3. Theme JS (app.js)

- [x] 3.1 Re-target `initSearchPage()` element references: `#search-input` (navbar), `.facets` (drawer), `#result-count` and `#search-results` (page body) (REQ-SO-001, REQ-CS-011).
- [x] 3.2 Ensure the results grid renders every idea by default on load and updates in place on query/facet changes (REQ-CS-011).
- [x] 3.3 Keep the debounced autoSuggest handler on the navbar search input with phonetic-to-Devanagari conversion and suggestion selection/hide behavior (REQ-CS-012).
- [x] 3.4 Keep the pillbox facet interactions (toggle, live counts, removable pills, one-open dropdown, outside-click and Escape close) inside the drawer (REQ-CS-007).
- [x] 3.5 Restore URL state (`q` plus facet params) into the input and the filtered listing on load without requiring the drawer to open (REQ-CS-008, REQ-CS-011).

## 4. Verification

- [x] 4.1 Run `python build.py` and confirm it completes without errors (REQ-SO-001).
- [x] 4.2 Run `node --check theme/app.js` to confirm the script is syntactically valid (REQ-CS-007, REQ-CS-012).
- [x] 4.3 Confirm `site/index.html` contains the navbar search input-group, the offcanvas facet drawer with hidden toggle below `md`, and an always-visible results container in the page body (REQ-SO-001, REQ-CS-011).
- [x] 4.4 Serve `site/` and verify the home page lists every idea by default and that typing in the navbar search filters the listing in place (REQ-CS-011).
- [x] 4.5 Verify the facet drawer opens from the navbar button on desktop, pillbox selections update the listing and counts, and mobile width shows the search box only (REQ-CS-007, REQ-CS-011).
- [x] 4.6 Verify autosuggest appears while typing and selects a suggestion into the navbar input (REQ-CS-012).
- [x] 4.7 Verify URL state (`q` plus facet params) round-trips and renders the filtered listing on load (REQ-CS-008, REQ-CS-011).
- [x] 4.8 Confirm no jQuery/select2 dependency is introduced and catalogue pages are unaffected (REQ-CS-007).

## 5. Icons (Font Awesome)

- [x] 5.1 Add the Font Awesome CDN stylesheet link to the home page `<head>` (REQ-SO-001).
- [x] 5.2 Replace the inline SVG search icon and facet drawer icon with Font Awesome `<i>` classes (`fa-magnifying-glass`, `fa-filter`) (REQ-SO-001).
- [x] 5.3 Rebuild `site/` and confirm the home page loads the Font Awesome stylesheet, contains no inline `<svg>` icons, and catalogue pages are unaffected (REQ-SO-001).

## 6. Tom Select facets

- [x] 6.1 Vendor Tom Select 2.3.1 into `theme/assets/tom-select.min.js` (complete build) and `theme/assets/tom-select.bootstrap5.min.css` (REQ-CS-007).
- [x] 6.2 Update `build.py` to copy the Tom Select JS and CSS into `site/assets/` (REQ-SO-007).
- [x] 6.3 Update `templates/home.html.j2`: link the Tom Select stylesheet, load the script before `app.js`, and render each facet as `<select class="form-select facet-select" multiple>` (REQ-SO-001, REQ-CS-007).
- [x] 6.4 In `theme/app.js`, replace the pillbox renderer with `initFacetSelects()` wrapping each select in a `TomSelect` instance (`remove_button` + `clear_button` plugins), populate options with live counts, and restore URL state via silent `setValue` (REQ-CS-007, REQ-CS-008).
- [x] 6.5 Remove pillbox markup, listeners, and CSS from `theme/app.js` and `theme/style.css` (REQ-CS-007).
- [x] 6.6 Rebuild and verify: home page references the vendored Tom Select assets, facet selects render as Tom Select controls with counts, catalogue pages are unaffected, and no `select2`/`jquery` dependency is introduced (REQ-CS-007, REQ-SO-007).
