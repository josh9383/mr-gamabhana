## Why

The MiniSearch faceted-search experience on `search.html` has been validated and works well. It should now be the site's entry point, and the catalogue pages should benefit from the same engine instead of the naive substring filter. This makes search consistent everywhere: one library, ranked results, prefix/fuzzy matching.

## What Changes

- **Home page becomes the search experience.** `site/index.html` (from a renamed `templates/home.html.j2`) renders the faceted MiniSearch search page: search input, six facet panels, and ranked results. The old home content (catalogue group sections and the naive `#search` box) is removed. The home search reads/writes its state via the URL (`?q=...&board=...`).
- **`search.html` is removed entirely** (per decision): no more separate search page, no sitemap entry, no redirect. Links to `/search.html` now point to the root.
- **Catalogue-page search uses MiniSearch too.** Landing and individual catalogue pages build a MiniSearch index in the browser from the page's own `.catalogue-card` elements (their searchable text), so pages stay self-contained and still never load `ideas.json` under GitHub Pages project paths. Prefix + fuzzy matching replaces the substring filter; the `?tag=` pre-filter runs through the same index. If the MiniSearch library fails to load, the page falls back to the previous substring filtering.
- **Templates:** `templates/search.html.j2` is renamed to `templates/home.html.j2` (canonical becomes the root) and `templates/index.html.j2` is deleted; `templates/catalogue.html.j2` adds the `minisearch.min.js` script tag.
- **Client script cleanup:** `initHome`/`renderHomeGroup`/`filterCards` and the old home search branch are removed from `theme/app.js`; `initCatalogueSearch` is rewritten around MiniSearch.

## Capabilities

### New Capabilities
- (none; all behavior lands in the existing output/search specs)

### Modified Capabilities
- `site-output`: modify REQ-SO-001 (home page renders the search experience from `templates/home.html.j2`), modify REQ-SO-006 (sitemap no longer lists a search page), modify REQ-SO-003 (catalogue pages reference the MiniSearch asset), and remove REQ-SO-010 (search page no longer generated).
- `client-side-search`: remove REQ-CS-002 (old home substring search), modify REQ-CS-006/007/008 to target the home page (the search page), and modify REQ-CS-003/004 so catalogue search and the `tag` pre-filter use a client-built MiniSearch index with substring fallback.

## Impact

- **Build engine (`build.py`):** render `templates/home.html.j2` → `site/index.html`; stop rendering `search.html`; drop the search URL from `site/sitemap.xml`; delete the obsolete `search.html.j2` template reference.
- **Templates:** rename `search.html.j2` → `home.html.j2` (canonical `/`, keep search layout); delete `index.html.j2`; add `<script src=".../assets/minisearch.min.js">` to `catalogue.html.j2`.
- **Theme:** `theme/app.js` — delete `initHome`, `renderHomeGroup`, `filterCards`, and the `#search` branch; rewrite `initCatalogueSearch` to index the page's cards with MiniSearch (prefix + fuzzy, `?tag=` support, substring fallback); `theme/style.css` unchanged (styles already cover the layout).
- **Specs:** delta specs for `site-output` and `client-side-search`; main specs updated at archive.
- **Docs:** `README.md` describes the home search page and MiniSearch catalogue filtering.
- **Out of scope:** no changes to `content/`; no new libraries (MiniSearch 7.2.0 already vendored); no server-side search.
