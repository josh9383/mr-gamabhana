# Use standard Bootstrap cards - Design

## Context

Idea and catalogue cards are currently hand-rolled `<a class="catalogue-card">` anchors rendered by `templates/catalogue.html.j2`, styled by custom rules in `theme/style.css` (border, radius, background). The home-page search results are injected client-side by `renderResults()` in `theme/app.js` using the same `.catalogue-card` shape via template literals. The site runs Bootstrap 5.3.x with a Bootswatch theme via CDN; `theme/style.css` already uses `var(--bs-*)` tokens so it tracks the active theme.

Idea metadata lives in `content/ideas/{id}/meta.json`; `props` is an array of strings (e.g. `["chalk", "crayons", "umbrella"]`). There are no image assets in `content/` today. The build engine is `build.py` (Python + Jinja2); it produces self-contained pages under `site/` that reference only `base_url`-relative assets.

Constraints: strictly vanilla stack, no inline styles/scripts, site artifacts self-contained, and cards must keep working with the client-side filter that toggles `.card-hidden` on `.catalogue-card` elements via their `data-search` text.

## Goals / Non-Goals

**Goals:**
- Every card becomes a standard Bootstrap `.card` matching the Bootswatch card anatomy: `card-img-top` image cap, `card-body` with `card-title` and `card-text` description, and a `card-footer`.
- Idea cards list the idea's props in the footer, linked to the prop catalogue pages.
- Catalogue landing cards (boards, standards, subjects, categories, concepts, props) show the item count in the footer.
- Ideas support an optional `image` field; when missing or empty, cards show a bundled fallback image.
- Keep the `.catalogue-card` + `data-search` JS hooks so catalogue-page filtering (REQ-CS-003) keeps working unchanged.
- Extend the MiniSearch `storeFields` so home-page results render the same cards with props and image.

**Non-Goals:**
- No new idea images are created or curated; `content/` changes are limited to the additive optional `image` field (explicit user decision).
- No changes to idea detail pages (`templates/idea.html.j2`), search ranking, facets, or URL-state behaviour.
- No layout/grid framework overhaul; `.catalogue-grid` stays.

## Decisions

### Decision: Render each card as an anchor carrying `card catalogue-card`
The whole card is one link (image + title + description). An `<a>` has a transparent content model in HTML5, so `card-body`/`card-footer` block children inside it are valid. Making the card itself the anchor keeps the existing `.catalogue-card` selector used by `initCatalogueSearch()` and the `data-search` attribute in place, and lets the JS filter toggle `.card-hidden` on the same element.

Alternative considered: `div.card` + `a.stretched-link` overlay - rejected because it splits the click target from the card element and would complicate the existing in-place filter.

CSS: the hand-rolled `.catalogue-card` border/background/padding rules are removed (Bootstrap `.card` provides these). Only minimal overrides remain on `.catalogue-card`: `text-decoration: none`, `color: var(--bs-body-color)`, `height: 100%`, and a hover `border-color: var(--bs-primary)`. The old `.catalogue-card small` rule is removed.

### Decision: Footer content is data-driven - props for idea cards, count for catalogue cards
Idea card payloads already have `count: None` and no `props`; catalogue item payloads have `count` and no `props`. The build adds `props` and `prop_slugs` to idea card payloads (REQ-BE-011). The template branches: `{% if item.props %}` → props footer (small badge links to `/props/{slug}/`); `{% elif item.count is not none %}` → count footer (युक्त्या (N)); otherwise no footer. Home-page JS results always render the props footer from the extended store fields.

### Decision: Optional `image` field resolves to a root-relative `image_url`, with a bundled fallback asset
`content/ideas/{id}/meta.json` gains an optional `image` field naming an image file inside the idea's content directory. When present, the build copies `content/ideas/{id}/{image}` into `site/ideas/{id}/` and sets `image_url = /ideas/{id}/{image}`. When missing or empty, `image_url = /assets/card-fallback.png` (REQ-BE-012). The template renders `<img class="card-img-top" src="{{ item.image_url }}" alt="{{ item.title }}">` - root-relative like other template URLs, staying self-contained under `base_url`.

A new static asset `theme/assets/card-fallback.png` (a neutral, minimal SVG, no inline scripts) is copied to `site/assets/` alongside the existing assets, extending the copy step in REQ-SO-007.

### Decision: JS-rendered home search cards extend `storeFields`
`renderResults()` in `theme/app.js` emits the same card markup (image cap, title, description, props footer). `storeFields` changes from `["id", "title", "description", "url"]` to `["id", "title", "description", "url", "props", "image_url"]`. Props render as badge links using the existing `escapeHtml` helper; the image `src` uses `baseUrl + idea.image_url` (matching the existing `baseUrl + idea.url` pattern). Because the build always resolves `image_url` (idea image or fallback), JS always renders an `<img>`.

## Risks / Trade-offs

- [Whole-card anchor containing block children] → Valid under the HTML5 transparent content model; limit children to flow content (`img`, `h2`, `p`, `div`), verify output in the browser and an HTML validator during implementation.
- [Fallback SVG may clash with a theme] → Keep it neutral and unobtrusive (theme-agnostic fill); Bootswatch themes style the `card-body` independently, so the placeholder stays subtle.
- [Content directory constraint] → `content/` is normally read-only (REQ-CM-004); this change intentionally adds the optional `image` field to the two existing `meta.json` files as an explicit user decision, strictly additive with no data loss.

## Migration Plan

1. Add `theme/assets/card-fallback.png` and the `image` fields to `content/ideas/*/meta.json`.
2. Update `build.py` (payload enrichment, image copy + `image_url`, fallback asset copy), `templates/catalogue.html.j2` (card markup), `theme/style.css` (card overrides), and `theme/app.js` (result cards + store fields).
3. Regenerate `site/` with `python build.py` and verify the card markup and filtering on a local server.
4. Rollback: revert the four source files; a full rebuild restores the previous output. The additive `meta.json` field can be left or removed without affecting prior behavior (empty = fallback).
