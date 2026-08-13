## 1. Template

- [x] 1.1 Rewrite `templates/ideaset.html.j2` to render a Bootstrap accordion: an `.accordion` container with one `.accordion-item` per member idea, first item expanded (`show`) and the rest collapsed
- [x] 1.2 Render each accordion item header (`.accordion-header` > `.accordion-button` with `data-bs-toggle="collapse"` and `data-bs-target`) showing the member idea's title, linking to the idea page
- [x] 1.3 Render each accordion item body (`.accordion-collapse.collapse` > `.accordion-body`) containing the idea's images (`image_urls`, reusing the fallback/single/multi-carousel pattern) and details (`description` + `content_html`)
- [x] 1.4 Remove the catalogue search experience from the template: drop `.catalogue-search` input, `minisearch.min.js` script, `app.js` catalogue-search init, and the gamabhana widget script

## 2. Build Engine

- [x] 2.1 In the idea set page loop in `build.py`, build per-member accordion item payloads `{title, url, description, image_urls, content_html}` where `content_html = markdown(load_idea_content(idea), extensions=["extra", "toc"])`, ordered by `member_ids`
- [x] 2.2 Pass the member accordion items to `ideaset_template.render(...)` and write `site/ideasets/{slug}/index.html` as before
- [x] 2.3 Confirm idea set records (`member_count`, `member_ids`, aggregated facets, `representative_image_urls`), `site/ideas.json`, and the sitemap are unchanged

## 3. Verification

- [x] 3.1 Run `python build.py` and confirm it succeeds
- [x] 3.2 Inspect `site/ideasets/fractions-introduction/index.html`: contains one accordion item per member idea, each with the idea title in the header and images plus converted Markdown details in the body
- [x] 3.3 Confirm no `card.catalogue-card`, no `.catalogue-search`, no `minisearch.min.js`, and no gamabhana widget script on idea set pages
- [x] 3.4 Serve the generated site and confirm the accordion expands/collapses with Bootstrap JS and idea images resolve
