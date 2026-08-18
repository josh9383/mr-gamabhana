# Use standard Bootstrap cards - Tasks

## 1. Content model

- [x] 1.1 Add the optional `image` field (empty string) to `content/ideas/angles/meta.json`
- [x] 1.2 Add the optional `image` field (empty string) to `content/ideas/triangles/meta.json`

## 2. Build engine

- [x] 2.1 Enrich idea card payloads with `props`, `prop_slugs`, and `image_url` for both the ideas landing page (`idea_items`) and individual catalogue page cards (`item_cards`) - REQ-BE-011
- [x] 2.2 Resolve `image_url`: copy `content/ideas/{id}/{image}` into `site/ideas/{id}/` and set `image_url` to `/ideas/{id}/{image}` when the field is non-empty; otherwise use `/assets/card-fallback.png` - REQ-BE-012
- [x] 2.3 Copy `theme/assets/card-fallback.png` into `site/assets/` alongside the existing assets - REQ-SO-007

## 3. Theme

- [x] 3.1 Add `theme/assets/card-fallback.png` (neutral placeholder SVG, no inline scripts)
- [x] 3.2 Rework `.catalogue-card` CSS: remove hand-rolled border/background/padding rules, keep link-card overrides (`text-decoration: none`, `color: var(--bs-body-color)`, `height: 100%`, hover `border-color: var(--bs-primary)`) and remove the obsolete `.catalogue-card small` rule

## 4. Templates

- [x] 4.1 Rewrite the card markup in `templates/catalogue.html.j2` as `<a class="card catalogue-card">` with `card-img-top` image cap, `card-body` (`card-title` + `card-text` description), and a data-driven `card-footer` (props badge links when `item.props` is present, count when `item.count` is not none) - REQ-SO-003, REQ-SO-004

## 5. Client-side search

- [x] 5.1 Extend the MiniSearch `storeFields` in `theme/app.js` to include `props` and `image_url` - REQ-CS-006
- [x] 5.2 Update `renderResults()` to emit Bootstrap cards (image cap, title, description, props footer) using `escapeHtml` and `baseUrl + idea.image_url` - REQ-CS-006
- [x] 5.3 Keep the `.catalogue-card` class and `data-search` attribute on every card so `initCatalogueSearch()` filtering and the `?tag=` pre-filter keep working - REQ-CS-003

## 6. Build and verify

- [x] 6.1 Run `python build.py` to regenerate `site/`
- [x] 6.2 Verify idea cards on `site/ideas/`, catalogue landing pages, and individual catalogue pages render image cap, title, description, and footer
- [x] 6.3 Verify home-page search results render cards with a props footer and fallback image
- [x] 6.4 Verify catalogue-page filtering (`data-search`, `.card-hidden`) and the `?tag=` pre-filter still work
- [x] 6.5 Confirm `content/` changed only by the additive `image` fields (no other data modified)
