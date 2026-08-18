## Context

The site generates a faceted search experience (`initPage()` in `theme/app.js`) used by the home page and, after the `catalogue-page-facets` change, by individual catalogue pages. It indexes `site/meta.json`'s `ideas` array with MiniSearch, renders Tom Select facet panels with live counts, autosuggest, URL state, infinite scroll, and reset. The ideasets landing page (`site/ideasets/index.html`) is currently a plain card grid over idea set items (`catalogue_template` with `items=ideaset_catalogue_items(...)`) using the lightweight card-search (`initCatalogueSearch`). Its `meta.json` records already carry aggregated metadata from `build_ideasets` (`standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `search`, `member_count`, `representative_image_urls`), but `ideaset_catalogue_items` exposes only a subset.

## Goals / Non-Goals

**Goals:**

- The ideasets landing page provides the full search + facets experience (search, facet panels with counts, autosuggest, URL state, infinite scroll, reset) over idea sets.
- Facet values come from each idea set's aggregated metadata; the unit of filtering is the idea set.
- No "ideasets" (युक्तीसंच) facet panel appears on the page; all other facets are interactive.
- Existing idea set card look is preserved (representative images, title, description, member count footer).
- Individual idea set pages and other catalogue landing pages keep their current behavior.

**Non-Goals:**

- Faceting or filtering individual idea set pages (`/ideasets/{slug}/`).
- Changing the home page's facet set (it keeps its configured facets, including `ideasets`).
- Filtering within an idea set at member level.
- New dependencies.

## Decisions

### D1. Reuse `initPage()` with an index mode

`initPage()` is generalized with an index mode read from a `data-index` attribute on `#search-page`:
- `"ideas"` (default): items = `data.ideas`, facet values as today.
- `"ideasets"`: items = `data.catalogues.ideasets`, facet values from aggregated arrays (`standards`, `subjects`, `categories`, `concepts`, `props`).

All existing machinery (matchesFacets, filteredByOthers counts, autosuggest, URL state, infinite scroll, reset) then works unchanged over the chosen item list.

- Alternative considered: a separate `initIdeasetSearch()` - rejected as duplication of ~400 lines of state/search logic, contradicting the "centralized coordinator" rule.
- Alternative considered: filtering `data.ideas` on the ideasets page - rejected: the page lists idea sets, not ideas.

### D2. Facet types derive from the rendered facet panels (single source of truth)

The client reads the active facet types from the DOM (`facetsRoot.querySelectorAll(".facet")` dataset) instead of `data.site.facet_types`. For home and individual catalogue pages the rendered panels come from the same config-driven `facet_groups` list as `facet_types`, so behavior is unchanged; on the ideasets landing page the build passes a `facet_groups` list that excludes `ideasets`, so the client naturally has no ideasets facet - no special-casing in JS.

- Alternative considered: a `data-facet-types` JSON attribute - rejected: redundant with the rendered panels and adds a second source of truth.
- Fallback: if no `.facets` root exists, fall back to `data.site.facet_types`.

### D3. Template renders the search block for `search_index` and guards locked-facet access

The search block condition becomes `{% if locked_facet or search_index %}`. Inside it, the locked-facet branch is guarded (`{% if locked_facet and type == locked_facet.type %}`) so it is skipped when only `search_index` is set. The `#search-page` element adds `data-index="{{ search_index }}"` when present. The navbar input keeps `catalogue-search` only when neither `locked_facet` nor `search_index` is set, so `initCatalogueSearch` and `initPage` stay mutually exclusive.

### D4. Build enriches idea set records and special-cases the ideasets landing render

`ideaset_catalogue_items` exposes each idea set's `id`, `standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs` (already aggregated by `build_ideasets`) - the same items feed both the landing page render and `meta.json`'s `catalogues.ideasets`, keeping a single source. In the catalogue loop, the `ideasets` landing page is rendered before the `continue` guard with `search_index="ideasets"` and `facet_groups` minus `ideasets`.

### D5. Ideaset cards show the member count, idea cards keep badges

`cardHtml` gains a footer branch: when the item has a `count`, render the existing `युक्त्या (count)` footer (matching the current static idea set cards); otherwise keep the prop-badge footer. Idea records have no `count`, so idea cards are unaffected. MiniSearch for ideasets uses fields `["title", "description", "standards", "subjects", "categories", "concepts", "props"]` and `storeFields: ["id"]` (results are resolved against the full items array, not hit fields).

## Risks / Trade-offs

- **`meta.json` failure loses live search on the page** → the pre-rendered idea set cards remain visible inside `#search-results` (no-JS fallback) and `initPage()` logs without throwing, consistent with existing pages.
- **Facet matching is idea-set level** → a selected concept shows idea sets that contain that concept among their members; a partially matching idea set cannot be filtered to its matching members only. Documented as a limitation.
- **DOM-derived facet types touch home/catalogue pages** → the rendered panels are produced from the same `facet_groups` list as the old `facet_types`, so the sets are identical; verified during implementation.
- **Payload size growth** → ideasets items add a few aggregated arrays to `meta.json`; negligible for realistic idea set counts.

## Migration Plan

1. Implement build + template + client changes, run `python build.py`.
2. Serve with `python -m http.server 8000 --directory site`; verify on `/ideasets/`: facets render without a युक्तीसंच panel, counts reflect the idea set index, facets + query compose, reset/URL state behave, cards keep the count footer, and `/` (home), an individual catalogue page, and `/ideasets/{slug}/` are unaffected.
3. Rollback: revert `build.py`, `templates/catalogue.html.j2`, and `theme/app.js`; rebuild restores prior behavior.

## Open Questions

- None blocking. (Whether the home page should eventually also drop the ideasets facet is out of scope and left to configuration.)
