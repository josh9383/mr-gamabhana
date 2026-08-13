## Context

The previous change shipped a faceted MiniSearch search page at `site/search.html` (`templates/search.html.j2`, `initSearchPage()` in `theme/app.js`, vendored `theme/assets/minisearch.min.js` copied to `site/assets/`). The home page (`templates/index.html.j2`) still uses a naive substring search over ideas and renders static catalogue-group sections. Catalogue pages (`templates/catalogue.html.j2`) filter `.catalogue-card` elements by substring over `data-search` via `initCatalogueSearch()`, deliberately without loading `ideas.json` (REQ-CS-003) so they stay self-contained under GitHub Pages project paths.

This change promotes the search experience to the home page, removes `search.html`, and makes catalogue-page search use MiniSearch while preserving the no-`ideas.json` self-containment guarantee.

## Goals / Non-Goals

**Goals:**
- The site root is the faceted MiniSearch search experience (input, six facets with counts, ranked results, URL state).
- `search.html` is gone: no template, no build output, no sitemap entry, no internal links.
- Catalogue landing and individual pages get MiniSearch prefix + fuzzy search built from their own cards, still without `ideas.json`.
- `?tag=` pre-filter on catalogue pages runs through the same index.
- Graceful degradation: if `MiniSearch` is unavailable on a catalogue page, fall back to the previous substring filtering.
- No inline scripts/styles; output stays self-contained under `base_url`.

**Non-Goals:**
- Changing `content/`, the idea pages' rendering, or the MiniSearch index configuration validated in the previous change.
- Adding autocomplete, pagination, or snippet highlighting.
- Server-side search.

## Decisions

### D1. Home page = the search experience; `search.html` removed
- **Decision:** Rename `templates/search.html.j2` to `templates/home.html.j2`, change its canonical to the site root (`{{ site.base_url }}/`), keep the page title `शोध | {{ site.title }}`, and render it as `site/index.html`. Delete `templates/index.html.j2` and stop generating `site/search.html`. Update `build.py` accordingly (render home template → root, drop the search URL from the sitemap).
- **Rationale:** The root becomes a single, consistent search-first entry point; the staging page served its purpose and the user chose removal over a redirect. The `#search-page` container and `initSearchPage()` remain unchanged, so the validated search logic moves verbatim to the home page (URL state works on `/` via query params).
- **Alternatives:** Keep `search.html` as a redirect (rejected by user decision: extra page + sitemap/spec surface for little benefit).

### D2. Catalogue search indexes the page's own cards
- **Decision:** On any page with `.catalogue-search` input, `initCatalogueSearch()` builds a MiniSearch index from the visible `.catalogue-card` elements, one document per card with a stable id (its index in the grid) and a single indexed field containing the card's searchable text (`data-search`). On input, the query runs through MiniSearch (prefix + fuzzy) and matched cards are shown, others hidden. The `?tag=` pre-filter runs the same query path on load. If `typeof MiniSearch === "undefined"`, the previous substring filtering is used instead.
- **Rationale:** Keeps REQ-CS-003 intact (no `ideas.json` fetch on catalogue pages, works under project paths), reuses the vendored library, and gives consistent prefix/fuzzy behavior. Card count per page is small, so an in-memory index built once on load is instant.
- **Alternatives:** Index the full `ideas.json` and intersect with page membership (rejected: reintroduces the `ideas.json` dependency REQ-CS-003 explicitly forbids). Server-side precomputed search index (rejected: unnecessary, corpus is small).

### D3. Same tokenizer and search options everywhere
- **Decision:** Reuse the existing `searchTokenize` (Unicode-aware split) and the same `processTerm`/`searchOptions` (`prefix: true`, `fuzzy: 0.2`, AND combination) for both the home index and catalogue card indexes.
- **Rationale:** Consistency and DRY; one validated tokenizer config across the site. Catalogue cards index one combined text field per card rather than separate fields, since their content is already a single pre-computed search string.

### D4. Client script restructure
- **Decision:** Remove `renderHomeGroup`, `initHome`, and `filterCards` from `theme/app.js`; keep `loadIndex`, `searchTokenize`, `escapeHtml`, and `initSearchPage`; rewrite `initCatalogueSearch` to use MiniSearch with fallback. In `init()`: run `initCatalogueSearch()` first (no `ideas.json`), then `initSearchPage()` when `#search-page` is present (now the home page), and drop the `#search` home branch.
- **Rationale:** Preserves the layered "centralized coordinator" pattern; catalogue search still works even when `ideas.json` fails (REQ-CS-005).

## Risks / Trade-offs

- [Catalogue pages now depend on the MiniSearch asset] → Fallback to substring filtering if the global is missing; the asset is vendored and copied by the build (REQ-SO-007).
- [Home no longer shows catalogue-group sections] → Facet panels provide equivalent navigation; all ideas are still listed initially with no filters.
- [Shared `/search.html` links break] → Accepted by user decision; search is at the root now.
- [Card indexes are rebuilt per page] → Trivial cost; index is built once on load from DOM nodes present at parse time.
- [Home URL state on `/` could grow] → Same repeatable-param scheme validated previously; fine at this scale.

## Migration Plan

- Rebuild with `python build.py`: `site/index.html` becomes the search page, `site/search.html` disappears, sitemap loses the search entry, catalogue pages gain MiniSearch filtering.
- No data migration; `content/` untouched.
- Rollback: restore the previous templates (`index.html.j2`, `search.html.j2`) and `app.js`/`build.py` state; nothing else is affected.

## Open Questions

- None blocking.
