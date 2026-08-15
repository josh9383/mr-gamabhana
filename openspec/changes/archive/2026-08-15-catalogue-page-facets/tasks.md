# Tasks

## 1. Build Engine

- [x] 1.1 In `build.py`, in the individual catalogue page render loop, compute `locked_facet = {"type": key, "label": definition["title"], "values": [item["title"]]}` and pass it to the `catalogue_template.render(...)` call for that page (landing pages and the ideas landing page keep passing no `locked_facet`)
- [x] 1.2 Run `python build.py` and verify the generated `site/standards/4/index.html` and `site/concepts/tulnaa/index.html` contain a `#search-page` block with `data-locked-facet` and `data-locked-values` attributes and a static locked-facet control, while `site/standards/index.html` keeps the card grid with no `#search-page`

## 2. Template

- [x] 2.1 In `templates/catalogue.html.j2`, add the Font Awesome CDN stylesheet and `{{ site.base_url }}/assets/tom-select.bootstrap5.min.css` to the `<head>`
- [x] 2.2 Add a conditional search experience block for individual pages (`{% if locked_facet %}`): the `.facets` row of Tom Select facet panels (one per `facet_groups` entry, with the locked facet rendered as an `h3` label plus a disabled `form-control` input marked `data-locked="true"`) and a `#search-page` element with `data-base-url`, `data-meta-url`, `data-locked-facet`, and `data-locked-values` attributes, `#result-count`, `#search-results` containing the pre-rendered idea cards, and `#search-more`
- [x] 2.3 Update the navbar search input so it carries `id="search-input"` and the `phonetic-input` class on all pages, with the `catalogue-search` class applied only when `{% if not locked_facet %}` (landing pages)
- [x] 2.4 Keep the existing landing-page card grid (`#catalogue-list`) for pages without `locked_facet`

## 3. Client Script

- [x] 3.1 In `theme/app.js`, change `loadIndex()` to accept a URL argument and have `initPage()` fetch `page.dataset.metaUrl || "meta.json"`
- [x] 3.2 In `initPage()`, read `data-locked-facet` and `data-locked-values` from the `#search-page` element, seed `state[lockedFacet] = lockedValues`, and override the value after `readStateFromURL()`
- [x] 3.3 In `writeStateToURL()`, skip the locked facet type when appending parameters
- [x] 3.4 In `initFacetSelects()`, skip facet groups with `data-locked="true"` (no Tom Select is created for them)
- [x] 3.5 In the reset (`#clear-facets`) click handler, skip the locked facet type so it is retained while the query and other facets are cleared
- [x] 3.6 Verify `renderFacets()` and `applyState()` already skip types without a Tom Select and confirm no locked-facet type is rendered as interactive

## 4. Styling

- [x] 4.1 In `theme/style.css`, add a small rule for the static locked-facet control (e.g. `.facet[data-locked="true"] .form-control` consistency) matching the facet panel layout

## 5. Verification

- [x] 5.1 Rebuild with `python build.py` and serve with `python -m http.server 8000 --directory site`; on `/standards/4/` confirm the standard facet is locked to `4` and read-only, other facets filter within standard 4, counts reflect the scope, autosuggest works, and infinite scroll paginates
- [x] 5.2 On `/concepts/tulnaa/` confirm the concepts facet is locked to `तुलना`, URL params for `concepts` are ignored on load, and the URL written on facet change omits the locked facet
- [x] 5.3 Confirm the reset button retains the locked facet and clears the query and other facets on an individual page
- [x] 5.4 Confirm a landing page (e.g. `site/standards/index.html`) and the ideas landing page still show the card grid with card-search behaviour and no facet row
