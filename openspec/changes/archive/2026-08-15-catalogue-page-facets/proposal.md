## Why

Individual catalogue pages (e.g. `/standards/4/`, `/concepts/tulnaa/`, `/categories/प्रयोग/`) currently show only a plain card listing with a simple card-search box. Users cannot combine the page's own scope with the full faceted search they get on the home page, so narrowing a catalogue (e.g. standard 4 + concept + material) requires guessing the URL or switching back to the home page.

## What Changes

- Individual catalogue pages (every page under `site/{path}/{slug}/index.html`, not the `index.html` landing pages) will render the same facets + search experience as the home page: search input, facet panels with live counts, autosuggest, URL-shareable state, infinite scroll, and a reset button.
- The facet that corresponds to the catalogue page is preselected, applied, and read-only. Example: on `/standards/4/` the "standard" facet is locked to `4`; on `/concepts/tulnaa/` the "concepts" facet is locked to `तुलना`.
- The reset button clears the search query and all *user-changeable* facets but retains the page's locked facet value.
- Catalogue landing pages (`site/{path}/index.html`) and the ideas landing page keep their current card-search behaviour unchanged.
- The build engine passes the locked-facet context (type, label, values) into each individual catalogue page render; the client script reads it from a data attribute on the search container.
- Individual catalogue pages will load the client index (`meta.json`) using a base-URL-aware path so they stay correct under GitHub Pages project paths.

## Capabilities

### New Capabilities

- `locked-facet`: A facet panel that is preselected, applied, and read-only on a catalogue page, including how it interacts with reset, URL state, facet counts, and the client search engine.

### Modified Capabilities

- `client-side-search`: Individual catalogue pages gain the home-page facet + search experience (facets, counts, autosuggest, URL state, infinite scroll) with a locked facet; card-based MiniSearch filtering is scoped to landing pages; `tag` URL pre-filter applies to landing pages; individual pages load `meta.json` via a base-URL-aware path; `meta.json` failure degrades to the static listing.
- `site-output`: Individual catalogue page output gains facet/search markup, the facet-related stylesheet links, and a locked-facet control; landing pages are unchanged.
- `build-engine`: The build computes and passes the locked-facet context (type, label, values) to individual catalogue page renders and keeps exposing the facet type list to the template.

## Impact

Files created or updated:

- `build.py` — pass `locked_facet` context when rendering individual catalogue pages.
- `templates/catalogue.html.j2` — conditionally render the facet row + `#search-page` search block for individual pages; add Font Awesome and Tom Select stylesheet links; render the locked facet as a static read-only control; keep landing-page markup for `index.html` pages.
- `theme/app.js` — `initPage()` locked-facet support (state seeding, read/write URL, skip locked group in facet init, reset retention); base-URL-aware `meta.json` fetch via a `data-meta-url` attribute.
- `theme/style.css` — optional styling for the static locked-facet control.
- `openspec/specs/client-side-search/spec.md`, `openspec/specs/site-output/spec.md`, `openspec/specs/build-engine/spec.md` — requirement deltas for this change.

No changes to `content/` (user inputs). No new dependencies; Tom Select and MiniSearch are already vendored.

Constraints, Limitations, Assumptions, Out-of-Scope:

- **Constraint**: Individual pages load `meta.json` (unlike today) — the fetch path must be base-URL-aware to keep REQ-CS-003's project-path intent. If `meta.json` fails, the static card listing remains visible (no full search).
- **Limitation**: Autosuggest and facet value lists come from the full index, so suggestions may include values outside the locked page scope (same behaviour as the home page with an active facet).
- **Assumption**: A locked facet always has exactly one value (each individual catalogue page represents a single item).
- **Assumption**: The `ideasets` catalogue has no individual pages, so no locked-facet page is generated for it.
- **Out-of-scope**: Landing pages (`site/{path}/index.html`) and the ideas landing page keep their current behaviour; no changes to `?tag=` handling on landing pages; no server-side rendering of full search results (pre-rendered cards act as a no-JS fallback only).
