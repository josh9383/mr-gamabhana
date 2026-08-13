## Why

Idea set pages currently render member ideas as a grid of compact catalogue cards, each card showing only the idea's title, description, and image cap. This discards the idea's actual content and forces users to click through to each idea page to see details. Showing member ideas as an accordion lets visitors expand an idea's images and full details in place on the idea set page.

## What Changes

- Replace the catalogue-card grid on idea set pages (`site/ideasets/{slug}/index.html`) with a Bootstrap accordion where each member idea becomes one accordion item.
- Each accordion item SHALL have a header containing the member idea's title and a body containing the idea's images and details.
- Idea "details" SHALL be the idea's Markdown body converted to HTML (same conversion as the idea page) plus its description, so the idea set page shows the real content, not just a teaser.
- Remove the catalogue search input, MiniSearch, and phonetic widget from idea set pages because the filterable-card pattern they support is being replaced by the accordion.
- The build engine SHALL pass an accordion item payload (title, url, description, `image_urls`, `content_html`) for each member idea to the idea set template instead of the card payload.
- The accordion SHALL be server-rendered with standard Bootstrap collapse markup (first item expanded), requiring no custom JS.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `site-output`: REQ-SO-013 changes so idea set pages render member ideas as an accordion of full details (images + converted body) instead of catalogue cards; the idea set page search/widet usage is dropped.
- `ideaset`: REQ-IS-003 changes so idea set pages display members as accordion items (title header; images and details body) instead of `card.catalogue-card` entries.
- `build-engine`: REQ-BE-014 changes so idea set rendering supplies accordion item payloads with `content_html` for each member idea; the card payload requirement for idea set pages is removed.

## Impact

- `build.py`: idea set page rendering loop builds per-member accordion items (including `content_html` via the existing Markdown conversion) and passes them to the template.
- `templates/ideaset.html.j2`: rewritten from card grid + search to a Bootstrap accordion; drops `.catalogue-search`, `minisearch.min.js`, `app.js` catalogue-search init, and the gamabhana widget script.
- `openspec/specs/site-output/spec.md`, `openspec/specs/ideaset/spec.md`, `openspec/specs/build-engine/spec.md`: requirement updates for the accordion rendering.
- No changes to `content/` (user-generated inputs), idea pages, catalogue pages, home page, or `theme/app.js` (`makeAccordion` is untouched; it serves idea-page Markdown sections).
- No new dependencies.
