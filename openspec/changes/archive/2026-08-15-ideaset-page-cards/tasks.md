# Tasks

## 1. Build Engine

- [x] 1.1 Enrich the idea set page member payload in `build.py`: add `footer_badges` to each member item via `footer_badges_for(by_id[mid], catalogue_defs, footer_types)` (REQ-BE-014)
- [x] 1.2 Confirm the member payload still carries `title`, `url`, `description`, `image_urls`, and `content_html` (no accordion-specific fields) (REQ-BE-014)

## 2. Template

- [x] 2.1 Rewrite `templates/ideaset.html.j2`: replace the Bootstrap accordion with a single-column card list `#ideaset-cards` (one `card` per member) plus a `#ideaset-more` reveal sentinel (REQ-IPC-001, REQ-SO-013)
- [x] 2.2 Render each card with the linked title, photos (fallback / single / `card-carousel` for multiple), the full `content_html` in `.idea-content`, and a `card-footer` with the member's `footer_badges` (REQ-IPC-001, REQ-IPC-003)
- [x] 2.3 Mark every card after the first with the `card-hidden` class so only the first card is visible on load (REQ-IPC-002)
- [x] 2.4 Load `assets/app.js` on the idea set page so the reveal logic runs (REQ-IPC-002)

## 3. Client

- [x] 3.1 Add `initIdeasetCards()` to `theme/app.js`: no-op without `#ideaset-cards`; hide/reveal one card per sentinel intersection via IntersectionObserver, matching the `initPage()` pagination pattern (REQ-IPC-002)
- [x] 3.2 Show the `सर्व युक्त्या पाहिल्या` end-of-list marker once all cards are revealed (REQ-IPC-002)
- [x] 3.3 Respect `prefers-reduced-motion` by revealing all cards immediately (REQ-IPC-002)
- [x] 3.4 Call `initIdeasetCards()` from `init()`; confirm `initCatalogueSearch()` and `initPage()` still no-op on this page (REQ-SO-013)

## 4. Styles

- [x] 4.1 Add `#ideaset-cards` styling to `theme/style.css`: single-column stacked cards spanning the container width at every screen size (REQ-IPC-001)
- [x] 4.2 Ensure card spacing, footer badge wrap, and `content_html` spacing read well in the full-width card (REQ-IPC-003)

## 5. Verification

- [x] 5.1 Run `python build.py`; confirm the build succeeds and `site/ideasets/fractions-introduction/index.html` contains one card per member with no accordion markup (REQ-IPC-001, REQ-SO-013)
- [x] 5.2 Confirm the page loads `assets/app.js` and contains `#ideaset-cards` plus `#ideaset-more`, with all cards after the first `card-hidden` (REQ-IPC-002)
- [x] 5.3 Serve `site/` and verify on `/ideasets/fractions-introduction/`: first card visible, scroll reveals the next cards one at a time, end marker appears, footers link to catalogue pages, and idea-page links work (REQ-IPC-001, REQ-IPC-002, REQ-IPC-003)
- [x] 5.4 Regression-check `/` (home), `/ideasets/` landing, a catalogue landing page, an individual catalogue page, and an idea page are unchanged (REQ-SO-013)
