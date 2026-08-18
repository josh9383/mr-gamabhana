## 1. Templates

- [x] 1.1 Rename `templates/search.html.j2` → `templates/home.html.j2`, change its canonical to the site root (`{{ site.base_url }}/`), and confirm the search-page layout (`#search-page`, `#search-input`, six facet containers, `#search-results`) and asset references are unchanged
- [x] 1.2 Delete `templates/index.html.j2` (old home page with catalogue-group sections and the naive `#search` box)
- [x] 1.3 Add the `{{ site.base_url }}/assets/minisearch.min.js` script tag before `app.js` in `templates/catalogue.html.j2`

## 2. Build engine (build.py)

- [x] 2.1 Render `templates/home.html.j2` → `site/index.html`; remove the `site/search.html` render and the `search.html.j2` template load
- [x] 2.2 Drop the search URL from `site/sitemap.xml` URL generation
- [x] 2.3 Run `python build.py` and confirm `site/index.html` is the search experience, `site/search.html` no longer exists, and the sitemap has no search entry

## 3. Client script (theme/app.js)

- [x] 3.1 Remove `renderHomeGroup`, `initHome`, and `filterCards` (old home catalogue-group rendering and substring filtering) along with the `#search` home branch in `init()`
- [x] 3.2 Rewrite `initCatalogueSearch()` to build a MiniSearch index from the page's `.catalogue-card` elements (indexed field = `data-search` text, Unicode-aware tokenizer, prefix + fuzzy), show/hide cards on match, and support the `?tag=` pre-filter through the same index
- [x] 3.3 Add substring-filter fallback in `initCatalogueSearch()` when `typeof MiniSearch === "undefined"`, preserving standalone catalogue filtering without `ideas.json`
- [x] 3.4 Confirm `init()` runs catalogue search first (no `ideas.json`), then the home search experience when `#search-page` is present, and that `initSearchPage` is unchanged
- [x] 3.5 Run `node --check theme/app.js` to confirm the script parses

## 4. Docs

- [x] 4.1 Update `README.md`: home page is the MiniSearch faceted-search page; catalogue pages filter with MiniSearch; remove the `search.html` reference

## 5. Build and verify

- [x] 5.1 Rebuild and verify generated home page + all catalogue pages reference `assets/minisearch.min.js`; `site/search.html` absent; sitemap URL count drops by one
- [x] 5.2 Headless verification against `site/` data: home search logic (Devanagari prefix/fuzzy + facet composition) and catalogue card-index logic (build index from card search text, prefix/fuzzy match, fallback path) - mirroring the shipped `app.js` functions
