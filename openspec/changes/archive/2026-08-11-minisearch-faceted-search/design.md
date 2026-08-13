## Context

The site is a static, template-driven site (build.py → `site/`). Today the only full-catalogue search is the home page (`templates/index.html.j2`) which does a naive `String.includes` substring filter across ideas (see `theme/app.js` `initHome`). Catalogue pages filter in place via `data-search`. There is no relevance ranking, no fuzzy matching, and no faceting.

This change adds a dedicated `site/search.html` page powered by MiniSearch 7.2.0 (vendored, MIT, zero dependencies) with full-text + faceted search. Per project rules: output must be fully self-contained (REQ-SO-009), no inline scripts/styles, programmatic DOM only, and the only existing client data source is `site/ideas.json` (site config, ideas index, catalogues with counts).

Constraint note: the config constraint "no external libraries" is relaxed for MiniSearch only, because it is vendored as a static asset with no runtime network dependency, preserving the self-containment guarantee.

## Goals / Non-Goals

**Goals:**
- Ranked full-text search over title, description, board, standard, subject, category, concepts, and props with prefix + fuzzy matching.
- Correct tokenization of Devanagari text.
- Faceted narrowing (boards, standards, subjects, categories, concepts, props) with live counts, combinable with the text query.
- Search state shareable via URL query parameters.
- New `site/search.html` page; existing pages untouched except a nav link and sitemap entry.
- Zero inline scripts/styles; everything under `site/` self-contained.

**Non-Goals:**
- Replacing the home page's search behavior (that happens in a later change once this page is validated).
- Server-side search, a search index build step, or pre-computed JSON index (corpus is small; building in the browser is instant).
- Autocomplete/suggestions UI, pagination, or highlighting of matched terms in result snippets.
- Any change to `content/`.

## Decisions

### D1. Vendor MiniSearch locally instead of loading from a CDN
- **Decision:** Download `minisearch@7.2.0` UMD build (`dist/umd/index.min.js`) into `theme/assets/minisearch.min.js`; `build.py` copies it to `site/assets/minisearch.min.js`; the search page loads it via `<script src="{{ site.base_url }}/assets/minisearch.min.js">`.
- **Rationale:** Preserves REQ-SO-009 self-containment and works offline and under GitHub Pages project paths, consistent with how `app.js`/`style.css` are already handled. Global `MiniSearch` is exposed by the UMD build.
- **Alternatives:** CDN `<script>` (rejected: external runtime dependency, breaks self-containment/offline); bundling into `app.js` (rejected: conflates vendored third-party code with our module, complicates upgrades and license attribution).

### D2. Unicode-aware tokenizer for Devanagari
- **Decision:** Pass a custom `tokenize` function to the MiniSearch index that splits on whitespace and punctuation while keeping letter runs in any script, e.g. `text => text.split(/[\\s\\u200C\\u200D.,;:!?()\\[\\]{}'"“”‘’…/-]+/u).filter(Boolean)`, plus `processTerm: t => t.toLowerCase()` for both index and query.
- **Rationale:** MiniSearch's default tokenizer splits on non-word characters; without the `u` flag Devanagari letters are treated as non-word, which would destroy Marathi terms like `कोन`.
- **Trade-off:** Devanagari words are space-separated in Marathi, so whitespace/punctuation splitting is adequate; no morphological stemming is attempted.

### D3. Index configuration
- **Decision:** `fields: ['title','description','board','standard','subject','category','concepts','props']`, `boost: { title: 2 }`, `storeFields: ['id','title','description','url']`, `searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 }, combineWith: 'AND' }`.
- **Rationale:** Titles matter most; prefix handles partial words; light fuzzy handles typos on a small corpus; AND-combination keeps short Marathi queries precise.
- **Alternatives:** `fuzzy: true` (rejected: 2-edit distance too noisy on short Devanagari words).

### D4. Faceted search model
- **Decision:** A single source-of-truth state object `{ q: '', board: [], standard: [], subject: [], category: [], concept: [], prop: [] }`. Within one facet, selected values OR together; across facets, AND; facets AND with the text query. When `q` is empty and no facets are active, the page lists every idea.
- **Facet counts:** each facet's counts are computed over the set filtered by the query and by every *other* active facet (excluding its own selections), so clicking a checkbox never shows a disabled/zero option due to itself.
- **Decision:** Rebuild the full result set on any state change (tiny corpus — simple and correct), then re-render facets and results from that set.
- **Rationale:** Matches standard faceted-search UX (e.g., e-commerce), is stateless/procedural per the layered architecture, and keeps a single source of truth.

### D5. URL state
- **Decision:** Read `q`, `board`, `standard`, `subject`, `category`, `concept`, `prop` (repeatable) params on load and seed the state; write them back on every change via `history.replaceState` so back/forward history isn't spammed while searches remain shareable.

### D6. Page structure and rendering
- **Decision:** `templates/search.html.j2` renders the site header (with search link active), a full-width search input, a two-column layout — left facet panels (checkboxes + counts per group, plus a "सर्व साफ करा" clear-all) and right a results area (`#search-results`) with a result-count line and `.catalogue-card` result anchors. All DOM injection via template literals in `app.js`; all styling in `theme/style.css`. `initSearchPage()` is registered in `init()` only when the `#search-page` container exists, keeping catalogue-page behavior independent of `ideas.json`.
- **Rationale:** Follows the existing "centralized coordinator module" pattern in `app.js` and the no-inline-style/script rules.

## Risks / Trade-offs

- [MiniSearch requires ES2018+] → All current browsers in "last 2 versions" support it; consistent with the ES2020 stack.
- [Fuzzy matches on short Devanagari words add noise] → Use `fuzzy: 0.2` with `prefix: true` and AND-combination; tuning knob documented for later.
- [Vendored asset must stay in sync with upstream] → Pin version `7.2.0` in the filename and README; re-vendoring is a single file copy.
- [No highlighting/pagination] → Acceptable for the corpus size; deferred until the page proves itself as the future home page.
- [URL params could grow long] → Only repeatable facet params; negligible at this scale.

## Migration Plan

- Additive: new template, new asset, new page, one nav link, one sitemap entry. Existing pages and `ideas.json` unchanged.
- Deployment: rebuild `site/` with `python build.py`; no data migration.
- Rollback: remove the search link/sitemap entry and `search.html`/`minisearch.min.js` from the build; delete the asset; nothing else depends on them.

## Open Questions

- None blocking. (Later decision, out of scope: whether the home page's inline search box is replaced by the faceted search page.)
