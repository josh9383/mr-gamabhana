# Use standard Bootstrap cards for catalogue and search results

## Why

Idea and catalogue cards are currently hand-rolled `<a>` elements styled only by a custom `.catalogue-card` class. They ignore the standard card anatomy provided by Bootstrap and the active Bootswatch theme (image cap, title, description, footer), so idea cards cannot surface the props (साहित्य) used in each idea, and the design drifts from the theme's card specifications.

## What Changes

- Replace the hand-rolled `.catalogue-card` anchors with standard Bootstrap `.card` components in `templates/catalogue.html.j2` and in the client-rendered search results in `theme/app.js`.
- Every card renders the standard card anatomy from the Bootswatch card specs: `card-img-top` image cap, `card-body` with `card-title` and `card-text` (description).
- Idea cards render a `card-footer` listing the idea's props as links to the prop catalogue pages.
- Catalogue landing cards (boards, standards, subjects, categories, concepts, props) render a `card-footer` showing the item count.
- Add an optional `image` field to the idea `meta.json` schema. When an idea has an image file, the build copies it into the idea's output directory and exposes a root-relative `image_url` on the idea card payloads; when the field is missing or empty, cards display a bundled fallback image.
- Add a fallback image asset `theme/assets/card-fallback.png` copied into `site/assets/` so cards stay self-contained under the `base_url`.
- Keep `.catalogue-card` as a JS hook class on the card element so catalogue-page filtering (REQ-CS-003) keeps working unchanged.
- **Explicit user decision**: the existing `content/ideas/*/meta.json` files are updated to add the optional `image` field. This is strictly additive — no existing metadata is changed.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `content-model`: The idea record schema (REQ-CM-002) gains an optional `image` field.
- `build-engine`: The build gains idea card payload enrichment and image resolution — `image_url`, `props`, and `prop_slugs` on idea card items, image copy into the idea directory, and fallback to a bundled placeholder asset when no image is present.
- `site-output`: Catalogue and ideas-landing pages (REQ-SO-003, REQ-SO-004) render Bootstrap cards with image cap, title, description, and a footer (props for idea cards, count for catalogue cards). The static asset copy requirement (REQ-SO-007) includes the fallback image asset.
- `client-side-search`: Home-page search results (REQ-CS-006) are rendered as Bootstrap cards with image cap, title, description, and a props footer; the MiniSearch `storeFields` are extended with `props` and `image_url`.

## Impact

- `templates/catalogue.html.j2` — card markup rewritten to the Bootstrap card component.
- `theme/style.css` — `.catalogue-card` hand-rolled styles trimmed; keep only the JS hooks and minimal card-link overrides.
- `theme/app.js` — `renderResults()` emits full cards; `storeFields` extended with `props` and `image_url`.
- `build.py` — idea card payload enrichment, image copy and `image_url` resolution, fallback asset copy.
- `theme/assets/card-fallback.png` — new static asset (mirrors into `site/assets/`).
- `content/ideas/angles/meta.json`, `content/ideas/triangles/meta.json` — additive optional `image` field (explicit user decision).
- Regenerated `site/` output.
- No dependency or content-model structural changes beyond the additive `image` field.
