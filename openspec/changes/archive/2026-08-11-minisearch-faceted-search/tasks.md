## 1. Vendor MiniSearch

- [x] 1.1 Download `minisearch@7.2.0` UMD build from the npm registry (`dist/umd/index.min.js`) into `theme/assets/minisearch.min.js`
- [x] 1.2 Confirm the file exposes a global `MiniSearch` (sanity-check the bundled header/global) and record the pinned version + MIT license in `README.md`

## 2. Build engine changes (build.py)

- [x] 2.1 Render `templates/search.html.j2` → `site/search.html` alongside the other pages
- [x] 2.2 Copy `theme/assets/minisearch.min.js` → `site/assets/minisearch.min.js` with the other static assets
- [x] 2.3 Add the search page URL to `site/sitemap.xml` generation
- [x] 2.4 Verify build output respects existing specs (only `site/` is written, `site/` is rebuilt idempotently)

## 3. Template and styles

- [x] 3.1 Create `templates/search.html.j2`: site header, search input, six facet panel containers, results container, and `site/assets/minisearch.min.js` + `site/assets/app.js` script tags - all via `base_url`, no inline scripts/styles
- [x] 3.2 Add a "शोध" link to the search page in the catalogue links of `templates/index.html.j2`
- [x] 3.3 Add faceted-search layout styles to `theme/style.css` (facet panels, checkbox rows with counts, result cards, result-count line, clear-all button, responsive two-column layout)

## 4. Client-side search module (theme/app.js)

- [x] 4.1 Build the MiniSearch index from `ideas.json` with fields `title` (boost 2), `description`, `board`, `standard`, `subject`, `category`, `concepts`, `props`; Unicode-aware `tokenize`; `processTerm` lowercasing; `storeFields` id/title/description/url; search options prefix + `fuzzy: 0.2`, AND combination
- [x] 4.2 Implement the single source-of-truth state model `{ q, board[], standard[], subject[], category[], concept[], prop[] }` and the result-set computation (within-facet OR, across-facet AND, composed with query; all ideas when nothing is selected)
- [x] 4.3 Implement facet-panel rendering with live counts computed over the query + all other active facets, and checkbox toggle handlers
- [x] 4.4 Implement results rendering (count line, `.catalogue-card` anchors, empty-state message) via template literals
- [x] 4.5 Implement URL state read on load and `history.replaceState` write on change for `q` and all facet params
- [x] 4.6 Wire `initSearchPage()` into `init()` only when the search-page container is present, preserving catalogue-page independence from `ideas.json`

## 5. Build and verify

- [x] 5.1 Run `python build.py` and confirm `site/search.html`, `site/assets/minisearch.min.js`, and the sitemap entry exist and match spec
- [x] 5.2 Manual verification in a browser: Devanagari query (e.g., `कोन`, `त्रिकोण`), prefix/fuzzy match, facet selection + counts + clear-all, facet+query combination, URL share/refresh restore, and self-containment under a project path
