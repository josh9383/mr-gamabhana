# Tasks

## 1. Build Engine

- [x] 1.1 Add `footer_badges` to the idea page render context in `build.py` via `footer_badges_for(idea, catalogue_defs, footer_types)` (REQ-BE-022)
- [x] 1.2 Confirm the idea page context still carries the idea record fields, `catalogue_attributes`, `content`, and `content_html`, and that the Markdown copy render is unaffected (REQ-BE-022)

## 2. Template

- [x] 2.1 Rewrite `templates/idea.html.j2`: replace the `article`/header/badge-row/`row-cols-3` grid with a single `.card.idea-page-card` (REQ-IDC-001, REQ-SO-002)
- [x] 2.2 Render the card `card-body`: `h1` title, lead description (when non-empty), photos (fallback / single / `card-carousel`), and the full `content_html` in `.idea-content` (REQ-IDC-001)
- [x] 2.3 Render a `card-footer` of `footer_badges` badges, matching the idea set card footer markup (REQ-IDC-002)
- [x] 2.4 Keep the breadcrumb, canonical URL, `og:` meta, watermark, navbar, Bootstrap JS, and `assets/app.js` links (REQ-IDC-001)

## 3. Styles

- [x] 3.1 Add `.idea-page-card` styles to `theme/style.css`: full-width card, inner photo radius reset, `.idea-content` spacing, footer badge wrap (REQ-IDC-001)

## 4. Verification

- [x] 4.1 Run `python build.py`; confirm `site/ideas/m1/index.html` contains exactly one `.idea-page-card` with photos, `content_html`, and a footer, and no header badge row or `row-cols-3` grid (REQ-IDC-001, REQ-SO-002)
- [x] 4.2 Confirm the card footer badges match idea-card footers and link to catalogue pages that exist (REQ-IDC-002)
- [x] 4.3 Serve `site/` and verify `/ideas/m1/`: card renders with title, description, images, content, footer badges, breadcrumb, and canonical (REQ-IDC-001, REQ-IDC-002)
- [x] 4.4 Regression-check `/` (home), `/ideasets/`, an idea set page, and a catalogue landing page are unchanged (REQ-SO-002)
