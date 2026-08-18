## Why

Individual idea pages (`/ideas/{id}/`) currently use a dedicated article layout that differs from the card design everywhere else on the site: a separate header with a badge row, a `row-cols-3` thumbnail grid, and the content body. Idea set pages now render member ideas as full-content cards, so the visual language is inconsistent. Applying the same card design to individual idea pages makes every idea look identical across the site (home cards, catalogue cards, idea set cards, idea pages).

## What Changes

- The individual idea page (`site/ideas/{id}/index.html`) renders as a **single full-width card** (`.idea-page-card`) instead of the article/header/badge-row/image-grid layout.
- The card contains the whole idea: the title (`h1`), the lead description, photos (fallback / single / fading carousel - the same photo rendering used on idea set cards), the full converted Markdown body in `.idea-content`, and a `card-footer` of catalogue-attribute badge links.
- The footer badges come from the same config-driven `footer_badges` computation used by idea cards and idea set cards (every active catalogue type with `footer: true`), replacing the hardcoded categories/concepts/props/ideasets badge row.
- The breadcrumb, canonical URL, `og:` meta tags, navbar, watermark, Bootstrap JS, and `assets/app.js` links are unchanged.
- The Markdown copy (`index.md`), home page, idea set pages, and all catalogue pages are unchanged.

## Capabilities

### New Capabilities

- `idea-page-card`: Individual idea pages render as a single full-width card with title, photos, converted Markdown body, and catalogue-attribute footer badges, matching the idea set page card design.

### Modified Capabilities

- `build-engine`: The idea page render context gains `footer_badges` derived from the active catalogue configuration (new REQ-BE-022).
- `site-output`: REQ-SO-002 changes so the idea page HTML renders as a full-content card with a `card-footer` of catalogue-attribute badges instead of the header badge row and thumbnail grid.

## Impact

Files created or updated:

- `build.py` - add `footer_badges` to each idea page render context (reusing `footer_badges_for`).
- `templates/idea.html.j2` - replace the `article`/header/badge-row/`row-cols-3` grid with a single `.card.idea-page-card` containing title, description, photos, `content_html`, and a `card-footer` of badges; keep breadcrumb, canonical, `og:` meta, watermark, and script links.
- `theme/style.css` - `.idea-page-card` styles (full-width card, inner photo radius reset, `.idea-content` spacing, footer badge wrap).
- `openspec/specs/idea-page-card/spec.md` (new), `openspec/specs/build-engine/spec.md` and `openspec/specs/site-output/spec.md` (deltas).

No changes to `content/` (user inputs). No new dependencies.

Constraints, Limitations, Assumptions, Out-of-Scope:

- **Constraint**: The card reuses existing components (`footer_badges_for`, `card-carousel`, fallback/single photo markup) - no new rendering machinery.
- **Limitation**: The photos switch from a `row-cols-3` thumbnail grid to full-width single/carousel rendering, matching the idea set cards.
- **Assumption**: Footer badges are config-driven (all `footer: true` catalogue types), which adds board/standard/subject badges when those catalogues are active - consistent with every other card on the site.
- **Assumption**: The idea page keeps its `h1` title and canonical/`og:` metadata (it is a standalone page, unlike idea set member cards).
- **Out-of-scope**: The Markdown copy, home page, idea set pages, catalogue pages, and content inputs; no infinite-scroll reveal on the idea page (a single card).

## Migration Plan

1. Add `footer_badges` to the idea page context in `build.py`; rewrite `templates/idea.html.j2`; add `.idea-page-card` styles.
2. Run `python build.py`; verify `site/ideas/m1/index.html` renders one card with photos, content, and footer badges, with no header badge row or thumbnail grid.
3. Serve `site/` and verify `/ideas/m1/`: card layout, images, content, footer badges linking to catalogue pages, breadcrumb/canonical intact.
4. Regression: `/` (home), `/ideasets/`, an idea set page, and a catalogue landing page are unchanged.
5. Rollback: revert `build.py`, `templates/idea.html.j2`, and `theme/style.css`; rebuild restores the article layout.

## Rollout

The build is static; the change is applied by regenerating the site. No feature flags or content migration needed.
