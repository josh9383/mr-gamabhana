## 1. Theme configuration in build engine

- [x] 1.1 Add `DEFAULT_THEME_STYLESHEET` (`https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/vapor/bootstrap.min.css`) and `DEFAULT_BOOTSTRAP_SCRIPT` (`https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`) constants to `build.py`
- [x] 1.2 In `main()`, resolve `site.theme_stylesheet` and `site.bootstrap_script` from `content/site.json`, falling back to the default constants when a field is absent or empty
- [x] 1.3 Rebuild and verify defaults render without any `content/site.json` edit (REQ-BE-009 scenarios pass)

## 2. Templates restyled with Bootstrap/Bootswatch

- [x] 2.1 Add theme stylesheet `<link>` (before local style.css) and Bootstrap JS bundle `<script>` (before app.js) to `templates/home.html.j2`, `templates/catalogue.html.j2`, and `templates/idea.html.j2` (REQ-SO-011)
- [x] 2.2 Restyle `templates/home.html.j2`: navbar header, container, form-control search input, form-check facet controls, card grid results; keep all app.js selector hooks (REQ-SO-001)
- [x] 2.3 Restyle `templates/catalogue.html.j2`: navbar header, breadcrumb, form-control search, card items; keep `.catalogue-grid`, `.catalogue-card`, `.catalogue-search` (REQ-SO-003)
- [x] 2.4 Restyle `templates/idea.html.j2`: navbar header, breadcrumb, badge tags, content container (REQ-SO-002)
- [x] 2.5 Confirm no inline style or script blocks were introduced in any template

## 3. Theme CSS rework

- [x] 3.1 Rework `theme/style.css` to use Bootstrap CSS variables (`var(--bs-*)`), keeping only app.js-dependent selectors (`.catalogue-card`, `.facet-item`, `.facet-items`, `.card-hidden`, `.catalogue-grid`, `.catalogue-search`, `.no-results`, `.facet h3`, `.facet-actions`)
- [x] 3.2 Verify responsive behavior relies on Bootstrap grid/utilities (mobile-first)

## 4. Verification

- [x] 4.1 Run `python build.py` successfully
- [x] 4.2 Grep every generated HTML page for the theme stylesheet URL and bootstrap bundle URL (REQ-SO-011)
- [x] 4.3 Grep generated pages for app.js selector hooks (`.catalogue-card`, `.facet-item`, `#search-page`, `.catalogue-search`, `.card-hidden`) to confirm they survived the restyle
- [x] 4.4 Run the headless smoke test of MiniSearch home search and catalogue filtering; confirm all assertions pass
- [x] 4.5 Confirm `site/sitemap.xml`, `site/ideas.json`, and idea Markdown copies are unchanged from a pre-theme build
