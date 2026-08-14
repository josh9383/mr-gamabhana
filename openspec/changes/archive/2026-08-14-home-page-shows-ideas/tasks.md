## 1. Build engine (build.py)

- [x] 1.1 Add `home_idea_items(ideas)` helper that serializes each normalized idea record into a home-index payload entry (id, title, description, url, board, standard as string, subject, categories/concepts/props with slugs, ideasets with slugs, image_urls) (REQ-BE-016).
- [x] 1.2 In `main()`, build the `ideas.json` payload as `{"site": site, "ideas": home_idea_items(ideas), "catalogues": catalogues}`, removing the `ideasets` array (REQ-SO-005, REQ-BE-016).

## 2. Theme (JS)

- [x] 2.1 In `theme/app.js`, switch `initSearchPage()` to read `data.ideas` instead of `data.ideasets` (REQ-CS-006).
- [x] 2.2 Update `facetValues(idea, type)` to read per-idea fields: `standard`/`subject` as scalars, catalogue arrays as value lists; rename the remaining `set`/`ideasets` references to `idea`/`ideas` in filtering and facet rendering (REQ-CS-007).
- [x] 2.3 Update the MiniSearch configuration to index `title` (boosted), `description`, `board`, `standard`, `subject`, `categories`, `concepts`, `props`, and `ideasets`, with `storeFields` `id`, `title`, `description`, `url`, `props`, `prop_slugs`, and `image_urls` (REQ-CS-006).
- [x] 2.4 Rewrite `imageCapHtml()` to render the idea's own `image_urls` in source order (fallback, single image, or carousel capped at six) and delete the unused `shuffle()` helper (REQ-CS-006).
- [x] 2.5 Rewrite `renderResults()` to render idea cards (image cap, title linking to `/ideas/{id}/`, description, prop-badge footer only when `props` is active, no member-count footer) and update the copy to `{n} युक्त्या` and `कोणतीही युक्ती सापडली नाही` (REQ-CS-006).

## 3. Verification

- [x] 3.1 Run `python build.py` and confirm it completes without errors (REQ-BE-016).
- [x] 3.2 Confirm `site/ideas.json` contains an `ideas` array with one record per idea (id, title, url, board, standard, subject, catalogue arrays with slugs, image_urls) and no `ideasets` array (REQ-SO-005, REQ-BE-016).
- [x] 3.3 Serve `site/` and verify the home search returns idea cards linking to `/ideas/{id}/` with image caps, descriptions, and prop badges; the result count reads `{n} युक्त्या` (REQ-CS-006).
- [x] 3.4 Verify facet counts reflect individual ideas (standard/subject as scalars) and the URL state (`q` plus facet params) round-trips on load and change (REQ-CS-007, REQ-CS-008).
- [x] 3.5 Confirm the ideasets catalogue landing page (`site/ideasets/index.html`) still renders idea set cards with representative images and that idea set pages are unchanged (REQ-IS-004).
- [x] 3.6 Run `node --check theme/app.js` to confirm the script is syntactically valid.
