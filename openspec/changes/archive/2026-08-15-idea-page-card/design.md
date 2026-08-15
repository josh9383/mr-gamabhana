## Context

Individual idea pages are rendered by `templates/idea.html.j2` as an `article` with a `header` (title + optional lead), a hardcoded badge row (`categories`/`concepts`/`props`/`ideasets` only), a `row-cols-3` thumbnail grid of `image_urls`, and the converted Markdown body in `.idea-content`. The page already loads Bootstrap JS and `assets/app.js` and includes canonical/`og:` meta, breadcrumb, watermark, and navbar. Idea set pages (`ideaset.html.j2`) now render member ideas as full-width cards — `.card-body` (title link, description, fallback/single/carousel photos, `.idea-content`) plus a `.card-footer` of `footer_badges`. In `build.py`, `footer_badges_for(idea, catalogue_defs, footer_types)` already produces the badge list used by idea-card and idea set card footers, but the idea page render context (`**idea`, `**base_context`, `content`, `content_html`) does not carry `footer_badges`.

## Goals / Non-Goals

**Goals:**

- The idea page renders as a single full-width card matching the idea set page card design (title, photos, content, footer badges).
- Footer badges are config-driven (`footer: true` catalogue types), consistent with every other card on the site.
- Photos use the same fallback/single/carousel rendering as idea set cards.
- Breadcrumb, canonical URL, `og:` meta, navbar, watermark, and script links are preserved.

**Non-Goals:**

- Changing the Markdown copy (`index.md`), home page, idea set pages, or catalogue pages.
- Adding progressive reveal / infinite scroll to the idea page (it is a single card).
- Content changes under `content/`.
- Changing which catalogues are shown beyond switching the badge row to the shared `footer_badges` computation.

## Decisions

### D1. Single full-width card reusing the idea set card components

The `article` layout is replaced by one `.card.idea-page-card`. Inside `.card-body`: an `h1` title (kept as the page heading, unlike the idea set cards' linked `h2` — the idea page is the idea's own page), the lead description, the photos, and `.idea-content` with `content_html`. The `card-footer` renders `footer_badges` exactly like idea set card footers (`badge badge-{path} text-decoration-none`). The card spans the full container width at every screen size.

- Alternative: keep the article/header/grid and only restyle it — rejected: the user asked for the same card design, and the header-badge-row/thumbnail-grid pattern is inconsistent with the rest of the site.

### D2. Footer badges come from `footer_badges_for`

`build.py` adds `"footer_badges": footer_badges_for(idea, catalogue_defs, footer_types)` to each idea page render context. This replaces the template's hardcoded `categories`/`concepts`/`props`/`ideasets` badge row with the shared config-driven computation used by idea cards and idea set cards — every active catalogue type with `footer: true` (e.g., boards, standards, subjects when active).

- Alternative: keep the hardcoded badge row and only change the layout — rejected: it would leave the idea page footer different from every other card on the site.
- Trade-off: when `boards`/`standards`/`subjects` are active they now appear as footer badges on the idea page (previously absent). This is intended: the idea page is the canonical place to see all of an idea's catalogue attributes.

### D3. Photos reuse the fallback/single/carousel markup

The `row-cols-3` thumbnail grid is replaced with the same markup idea set cards use: `card-fallback.png` when `image_urls` is empty, a single `card-img-top` image when one image exists, and `card-carousel card-carousel--{n}` (16:9 fading carousel, up to 6 images) for multiple. Image URLs are prefixed with `site.base_url` (matching the carousel and `og:image` usage elsewhere) instead of the raw root-relative path the old grid used.

### D4. Page-level metadata and chrome preserved

Breadcrumb, `<link rel="canonical">`, `og:` meta, watermark overlay, navbar (`menu_groups`), Bootstrap JS, and `assets/app.js` stay as-is. `initIdeasetCards()` already no-ops without `#ideaset-cards`, so loading `assets/app.js` is harmless.

## Risks / Trade-offs

- **Single-image ideas lose the multi-thumbnail grid** → currently every idea has exactly one image; the carousel branch is exercised only when an idea gains multiple images (same as idea set cards).
- **Badge set changes on the idea page** (boards/standards/subjects now shown when active) → intended for consistency; documented in the proposal.
- **Full-width 16:9 image is large on the idea page** → consistent with the idea set card design the user requested.

## Migration Plan

1. Add `footer_badges` to the idea page context in `build.py`; rewrite `templates/idea.html.j2`; add `.idea-page-card` styles to `theme/style.css`.
2. Run `python build.py`; verify `site/ideas/m1/index.html` contains one `.idea-page-card` with photos, `content_html`, and footer badges, and no header badge row or `row-cols-3` grid.
3. Serve `site/` and verify `/ideas/m1/`: card layout, images, content, footer badges link to catalogue pages, breadcrumb/canonical intact.
4. Regression: `/` (home), `/ideasets/`, an idea set page, and a catalogue landing page are unchanged.
5. Rollback: revert the three source files; rebuild restores the article layout.

## Open Questions

- None blocking.
