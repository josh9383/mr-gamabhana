## Context

The site is a static build (Python + Jinja2) that generates a home page (`site/index.html`) with a full faceted search experience driven by `theme/app.js` (`initPage()`), and catalogue pages (`templates/catalogue.html.j2`) that currently render a card grid with a lightweight card-search (`initCatalogueSearch()` in `app.js`). The facet row is already present in the catalogue template but commented out. `app.js` already contains two mutually-exclusive init paths: `initCatalogueSearch()` guarded by `.catalogue-search`, and `initPage()` guarded by `#search-page`.

Home page (`initPage()`) provides, over the `site/meta.json` index: MiniSearch full-text search, Tom Select facet panels with live counts, autosuggest, URL-shareable state (`q` + one param per facet type), reset button, and infinite scroll. `meta.json` is currently fetched with a relative `fetch("meta.json")`, which is only correct at the site root (REQ-CS-003 deliberately keeps catalogue pages independent of `meta.json` so they work under GitHub Pages project paths).

The change makes individual catalogue pages (every `site/{path}/{slug}/index.html`) use the home-page search experience, with the page's own facet preselected, applied, and read-only.

## Goals / Non-Goals

**Goals:**

- Individual catalogue pages render the same facets + search as the home page (search, facet panels with counts, autosuggest, URL state, infinite scroll, reset).
- The catalogue's own facet is locked: preselected, applied, read-only, and retained by the reset button.
- Landing pages (`site/{path}/index.html`, `site/ideas/index.html`) keep their current card-search behaviour.
- Individual pages keep working under GitHub Pages project paths.
- No new dependencies; vanilla JS + existing vendored MiniSearch/Tom Select.

**Non-Goals:**

- Changing landing-page behaviour or `?tag=` handling on landing pages.
- Server-rendering the full search experience; pre-rendered cards remain only as a no-JS/`meta.json`-failure fallback.
- Faceting the `ideasets` catalogue (it has no individual pages).
- Refactoring `initPage()`'s facet rendering or pagination internals beyond what locked facets require.

## Decisions

### D1. Reuse `initPage()` on individual catalogue pages with a locked facet

The home search already implements every needed behaviour (counts, autosuggest, URL state, infinite scroll, reset). Individual pages reuse it via the same `#search-page` block. The page's scope is enforced by seeding `state[lockedFacet] = [lockedValue]`; all existing filter logic (`matchesFacets`, `filteredByOthers`) then composes it with the query and other facets automatically.

- Alternatives considered: (a) extending `initCatalogueSearch` to add facets - rejected: the page's cards only carry a flat `data-search` string, so facet counts/filtering would require a bespoke per-page index; (b) a dedicated per-page JSON payload - rejected: `meta.json` already contains all ideas and is fetched once, and a per-page payload would duplicate data and cache paths.

### D2. Locked facet is expressed by the build engine and read from the DOM

`build.py` computes, for each individual catalogue page, `locked_facet = {"type": key, "label": definition["title"], "values": [item["title"]]}` (a single value per page). The template renders:

- the locked facet group as a static read-only control (an `h3` label plus a disabled Bootstrap `form-control` input) with `data-locked="true"`, instead of a Tom Select;
- `#search-page` data attributes `data-locked-facet` and `data-locked-values` (JSON).

`app.js` seeds state from these attributes. The DOM is the single source of truth for the locked facet; the build and the client never duplicate the value in code.

- Alternative considered: disabling the Tom Select instance. Rejected: Tom Select's disable/remove-button semantics are awkward for a truly immutable control, and a static control needs no JS wiring at all (works without JS).

### D3. Meta.json fetch becomes base-URL-aware

`loadIndex(url)` takes a URL. Templates set `data-meta-url="{{ site.base_url }}/meta.json"` on `#search-page` (home keeps its current relative `"meta.json"` default). Under a project path the catalogue page's relative fetch would otherwise resolve to `/{path}/{slug}/meta.json` and fail; an absolute base-URL path fixes this while keeping home unchanged.

### D4. Search input routing stays exclusive per page

The navbar search input keeps `id="search-input"` on all pages, but the `catalogue-search` class is rendered only when the page is a landing page (`{% if not locked_facet %}`). This keeps `initCatalogueSearch` and `initPage` mutually exclusive without touching `init()` dispatch in `app.js`.

### D5. Locked facet is excluded from URL write and reset, but overrides URL read

- `readStateFromURL()` forces `state[lockedFacet] = lockedValues` after reading params (the page scope is authoritative - URL params cannot change it).
- `writeStateToURL()` skips the locked facet (the page path already encodes it; writing it back would be redundant).
- The reset handler skips the locked facet while clearing all others and the query.
- `initFacetSelects()` skips groups with `data-locked="true"`; `renderFacets()` and `applyState()` already no-op when no Tom Select exists for a type.

### D6. Stylesheets added to the catalogue template

`catalogue.html.j2` loads the Font Awesome CDN stylesheet (the navbar search icon and reset icon already use FA classes) and the vendored `tom-select.bootstrap5.min.css`, both unconditionally. The Tom Select CSS is inert on landing pages; FA fixes the search icon there too. A small `.facet-readonly`/disabled-input rule in `theme/style.css` is the only style addition.

## Risks / Trade-offs

- **`meta.json` failure on individual pages loses live search** → the pre-rendered card grid stays visible inside `#search-results` as a no-JS fallback, and `initPage()` already logs the error without throwing (REQ-CS-005). Landing pages are unaffected.
- **Autosuggest/facet options are drawn from the whole index, not the page scope** → matches home behaviour when a facet is active; acceptable. Locked-scope filtering of results is exact.
- **SEO impact of JS-driven results** → pre-rendered cards remain in the HTML, so crawlers and no-JS users still see the full listing; JS replaces the listing on init.
- **Locked value mismatch between page slug and idea metadata** → the locked value is derived from the same item titles used to build slugs and card payloads, so it always matches the ideas on the page; this keeps the client-side filter exact.
- **Duplication of the facet row between home and catalogue templates** → small, deliberate; the catalogue template keeps its own conditional markup so landing pages stay untouched.

## Migration Plan

1. Build the site with `python build.py` and inspect generated `site/standards/4/`, `site/concepts/tulnaa/`, and a landing page to confirm markup.
2. Serve with `python -m http.server 8000 --directory site`; verify locked facet, other-facet filtering, counts, reset, URL state, autosuggest, infinite scroll on a few catalogue types (single and multi mode).
3. Rollback: revert `templates/catalogue.html.j2`, `theme/app.js`, `theme/style.css`, and `build.py`; the previous behaviour is fully restored on rebuild.

## Open Questions

- None blocking. (Whether to also write the locked value into the URL for sharing is settled in D5: it is not written, since the path already encodes it.)
