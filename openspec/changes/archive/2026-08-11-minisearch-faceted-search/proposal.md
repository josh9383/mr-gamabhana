## Why

The current search on the home page is a naive substring filter (`String.includes`) over a combined text blob: it returns no relevance ranking, no fuzzy or prefix matching, and offers no way to narrow results by board, standard, subject, category, concept, or material. As the idea catalogue grows, finding the right युक्त्या becomes guesswork.

## What Changes

- Add a dedicated `site/search.html` page (from a new `templates/search.html.j2`) that becomes the primary search destination; the home page search input is left as-is and only the new page is built first (the user will later replace the home page with this one).
- Introduce **MiniSearch 7.2.0** as the single client-side full-text engine, **vendored locally** at `theme/assets/minisearch.min.js` (copied to `site/assets/minisearch.min.js`) so output stays self-contained with zero runtime network/CDN dependency. **BREAKING:** the "no external frontend libraries" constraint is relaxed for this one vendored, MIT-licensed, zero-dependency library.
- Index every idea's title (boosted), description, board, standard, subject, category, concepts, and props with a Unicode-aware tokenizer so Devanagari text (e.g., `कोन`, `त्रिकोण`) tokenizes correctly. Enable prefix and fuzzy matching.
- Add **faceted search**: facet panels for boards, standards, subjects, categories, concepts, and props, each with live counts. Multiple values within one facet combine with OR; different facets combine with AND; facets compose with the text query.
- Persist query and active facets in the URL (`?q=...&board=...&subject=...`) so searches are shareable and survive refresh.
- Render ranked results as idea cards with a result count and an empty-state message.
- Update the home page catalogue links and the sitemap to include the search page.
- **BREAKING (URL/output):** `site/search.html` and `site/assets/minisearch.min.js` are new build outputs; sitemap gains one entry.

## Capabilities

### New Capabilities
- (none; functionality is added across the existing output and search specs)

### Modified Capabilities
- `site-output`: add a search page requirement (REQ-SO-010), extend the sitemap requirement to include the search URL, extend the assets requirement to copy the vendored MiniSearch file, and extend the home page requirement to link to the search page.
- `client-side-search`: add MiniSearch full-text search, faceted search with counts, and URL-state requirements for the search page.

## Impact

- **Build engine:** `build.py` - render `templates/search.html.j2` → `site/search.html`, copy `theme/assets/minisearch.min.js` → `site/assets/minisearch.min.js`, add the search URL to `site/sitemap.xml`.
- **Templates:** create `templates/search.html.j2`; add a "शोध" link to the catalogue links in `templates/index.html.j2`.
- **Theme:** create `theme/assets/minisearch.min.js` (vendored 7.2.0 UMD, global `MiniSearch`); add the search-page module to `theme/app.js`; add faceted-search layout styles to `theme/style.css`.
- **Specs:** delta specs for `site-output` and `client-side-search`; main specs updated at archive time.
- **Docs:** `README.md` notes the vendored dependency, version, and license.
- **Out of scope:** no changes to `content/`; no changes to the home-page search behavior; no server-side search.
