# Tasks

## 1. Build Engine

- [x] 1.1 Extend `ideaset_catalogue_items(ideasets)` in `build.py` to include `id` plus the aggregated facet fields (`standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`) copied from the idea set records (REQ-BE-020)
- [x] 1.2 Special-case the ideasets landing page render in the catalogue loop of `build.py`: before the `if key == "ideasets": continue` guard, render `site/ideasets/index.html` with `search_index="ideasets"` and `facet_groups` excluding the `ideasets` entry, without a `locked_facet` (REQ-BE-021)
- [x] 1.3 Verify the standard landing-page render (no `search_index`) still applies to all other catalogue landing pages and the ideas landing page (REQ-BE-021)

## 2. Template

- [x] 2.1 In `templates/catalogue.html.j2`, widen the search-block condition to `{% if locked_facet or search_index %}` and guard the locked-facet branch with `{% if locked_facet and type == locked_facet.type %}` (REQ-SO-003)
- [x] 2.2 Add `data-index="{{ search_index }}"` to `#search-page` when `search_index` is present; keep the existing locked-facet attributes for individual pages (REQ-ILS-001)
- [x] 2.3 Render the navbar input class as `catalogue-search` only when neither `locked_facet` nor `search_index` is set, keeping `initCatalogueSearch` and `initPage` mutually exclusive (REQ-SO-003)
- [x] 2.4 Confirm the ideasets landing page keeps the `phonetic-input` class on its `#search-input` and includes the gamabhana widget launcher like the other search pages (REQ-SO-012)

## 3. Client Search

- [x] 3.1 In `theme/app.js`, generalize `initPage()` to read an index mode from `page.dataset.index`: use `data.catalogues.ideasets` as the item list when the mode is `"ideasets"`, otherwise `data.ideas` (REQ-ILS-004)
- [x] 3.2 Add a `facetValues(item, type)` branch for the `"ideasets"` mode that reads the aggregated arrays (`standards`, `subjects`, `categories`, `concepts`, `props`), keeping the existing scalar handling for `standard`/`subject` idea records (REQ-ILS-002, REQ-ILS-004)
- [x] 3.3 Derive the active facet types from the rendered `.facet` groups' `data-facet` (falling back to `data.site.facet_types` when no panels exist) so the ideasets landing page never includes `ideasets` in URL state or filtering (REQ-ILS-005)
- [x] 3.4 Branch the MiniSearch field set and `storeFields` by index mode: ideasets uses `["title", "description", "standards", "subjects", "categories", "concepts", "props"]` with `storeFields: ["id"]` (REQ-ILS-004)
- [x] 3.5 Extend `cardHtml` to render the `युक्त्या (count)` footer when the item has a `count`, keeping the prop-badge footer for idea cards (REQ-ILS-003)

## 4. Verification

- [x] 4.1 Run `python build.py`; confirm the build succeeds and `site/ideasets/index.html` contains `#search-page` with `data-index="ideasets"` and no `.facet` with `data-facet="ideasets"`
- [x] 4.2 Confirm `site/meta.json` `catalogues.ideasets` items carry `id` and the aggregated facet arrays (REQ-BE-020, REQ-SO-005)
- [x] 4.3 Serve `site/` and verify on `/ideasets/`: facets render without a युक्तीसंच panel, counts reflect idea sets, facets + query compose, reset/URL state work, and cards keep the member-count footer (REQ-ILS-001, REQ-ILS-002, REQ-ILS-003, REQ-ILS-005)
- [x] 4.4 Regression-check `/` (home), an individual catalogue page (locked facet), another catalogue landing page (card grid), and `/ideasets/{slug}/` (accordion) are unaffected (REQ-SO-003, REQ-BE-021)
